"""
Algorand service for blockchain interactions
Handles smart contracts, ASAs, and transactions
"""

import os
from typing import Optional, Dict, List
from dotenv import load_dotenv

from algosdk.v2client import algod, indexer
from algosdk import account, mnemonic, transaction
from algosdk.transaction import (
    AssetConfigTxn,
    ApplicationCreateTxn,
    ApplicationCallTxn,
    PaymentTxn,
    OnComplete,
    StateSchema
)
from algokit_utils import get_algod_client, get_indexer_client

load_dotenv()


class AlgorandService:
    """Service for interacting with Algorand blockchain"""

    def __init__(self) -> None:
        """Initialize Algorand clients"""
        self.network = os.getenv("ALGORAND_NETWORK", "testnet")

        # Initialize clients
        if self.network == "localnet":
            self.algod_client = algod.AlgodClient(
                os.getenv("ALGOD_TOKEN", "a" * 64),
                os.getenv("ALGOD_SERVER", "http://localhost:4001")
            )
            self.indexer_client = indexer.IndexerClient(
                os.getenv("INDEXER_TOKEN", "a" * 64),
                os.getenv("INDEXER_SERVER", "http://localhost:8980")
            )
        else:
            # Use public TestNet/MainNet nodes
            self.algod_client = algod.AlgodClient(
                "",
                os.getenv("ALGOD_SERVER", "https://testnet-api.algonode.cloud")
            )
            self.indexer_client = indexer.IndexerClient(
                "",
                os.getenv("INDEXER_SERVER", "https://testnet-idx.algonode.cloud")
            )

        # Get creator account from mnemonic
        creator_mnemonic = os.getenv("CREATOR_MNEMONIC")
        if creator_mnemonic:
            self.creator_private_key = mnemonic.to_private_key(creator_mnemonic)
            self.creator_address = account.address_from_private_key(
                self.creator_private_key
            )
        else:
            # Generate temporary account for development
            self.creator_private_key, self.creator_address = account.generate_account()
            print(f"⚠️  Using temporary creator account: {self.creator_address}")
            print("⚠️  Set CREATOR_MNEMONIC in .env for production")

    def get_suggested_params(self):
        """Get suggested transaction parameters"""
        return self.algod_client.suggested_params()

    def wait_for_confirmation(self, txid: str, timeout: int = 10) -> Dict:
        """
        Wait for transaction confirmation

        Args:
            txid: Transaction ID
            timeout: Number of rounds to wait

        Returns:
            Transaction confirmation details
        """
        last_round = self.algod_client.status().get("last-round")
        txinfo = self.algod_client.pending_transaction_info(txid)

        while True:
            last_round += 1
            self.algod_client.status_after_block(last_round)
            txinfo = self.algod_client.pending_transaction_info(txid)
            if txinfo.get("confirmed-round", 0) > 0:
                return txinfo
            if last_round > last_round + timeout:
                raise Exception("Transaction not confirmed within timeout")

    def create_asa(
        self,
        asset_name: str,
        unit_name: str,
        total: int,
        decimals: int = 0,
        url: str = "",
        metadata_hash: Optional[bytes] = None
    ) -> int:
        """
        Create an Algorand Standard Asset (ASA)

        Args:
            asset_name: Asset name
            unit_name: Unit name (ticker)
            total: Total supply
            decimals: Number of decimals
            url: Asset URL
            metadata_hash: Metadata hash

        Returns:
            Asset ID
        """
        params = self.get_suggested_params()

        txn = AssetConfigTxn(
            sender=self.creator_address,
            sp=params,
            total=total,
            default_frozen=False,
            unit_name=unit_name,
            asset_name=asset_name,
            manager=self.creator_address,
            reserve=self.creator_address,
            freeze=self.creator_address,
            clawback=self.creator_address,
            url=url,
            decimals=decimals,
            metadata_hash=metadata_hash
        )

        # Sign and send transaction
        signed_txn = txn.sign(self.creator_private_key)
        txid = self.algod_client.send_transaction(signed_txn)

        # Wait for confirmation
        confirmed_txn = self.wait_for_confirmation(txid)

        # Get asset ID
        asset_id = confirmed_txn["asset-index"]
        print(f"✅ Created ASA: {asset_name} (ID: {asset_id})")

        return asset_id

    def deploy_market_contract(
        self,
        market_id: str,
        outcomes: List[str],
        end_time: int
    ) -> int:
        """
        Deploy a prediction market smart contract

        Args:
            market_id: Unique market identifier
            outcomes: List of possible outcomes
            end_time: Market end time (Unix timestamp)

        Returns:
            Application ID
        """
        params = self.get_suggested_params()

        # Simple approval program (TEAL)
        # In production, compile from actual TEAL files
        approval_program = b"\x06"  # Placeholder - approve all
        clear_program = b"\x06"  # Placeholder - approve all

        # Global schema: Store market state
        global_schema = StateSchema(
            num_uints=10,  # Store prices, volumes, etc.
            num_byte_slices=10  # Store outcomes, status, etc.
        )

        # Local schema: Store user positions
        local_schema = StateSchema(
            num_uints=5,  # User's shares per outcome
            num_byte_slices=2
        )

        # Create application
        txn = ApplicationCreateTxn(
            sender=self.creator_address,
            sp=params,
            on_complete=OnComplete.NoOpOC,
            approval_program=approval_program,
            clear_program=clear_program,
            global_schema=global_schema,
            local_schema=local_schema,
            app_args=[market_id.encode(), str(end_time).encode()]
        )

        # Sign and send
        signed_txn = txn.sign(self.creator_private_key)
        txid = self.algod_client.send_transaction(signed_txn)

        # Wait for confirmation
        confirmed_txn = self.wait_for_confirmation(txid)

        # Get application ID
        app_id = confirmed_txn["application-index"]
        print(f"✅ Deployed market contract (App ID: {app_id})")

        return app_id

    def create_outcome_tokens(
        self,
        market_id: str,
        outcomes: List[str]
    ) -> Dict[str, int]:
        """
        Create outcome tokens (ASAs) for a market

        Args:
            market_id: Market identifier
            outcomes: List of outcomes

        Returns:
            Dictionary mapping outcome to ASA ID
        """
        outcome_token_ids = {}

        for outcome in outcomes:
            asset_id = self.create_asa(
                asset_name=f"{market_id}_{outcome}",
                unit_name=outcome[:8].upper(),
                total=1_000_000_000,  # 1 billion tokens
                decimals=6
            )
            outcome_token_ids[outcome] = asset_id

        return outcome_token_ids

    def send_payment(
        self,
        receiver: str,
        amount: int,
        note: str = ""
    ) -> str:
        """
        Send ALGO payment

        Args:
            receiver: Receiver address
            amount: Amount in microAlgos
            note: Transaction note

        Returns:
            Transaction ID
        """
        params = self.get_suggested_params()

        txn = PaymentTxn(
            sender=self.creator_address,
            sp=params,
            receiver=receiver,
            amt=amount,
            note=note.encode() if note else None
        )

        # Sign and send
        signed_txn = txn.sign(self.creator_private_key)
        txid = self.algod_client.send_transaction(signed_txn)

        # Wait for confirmation
        self.wait_for_confirmation(txid)

        return txid

    def get_account_info(self, address: str) -> Dict:
        """
        Get account information

        Args:
            address: Account address

        Returns:
            Account information
        """
        return self.algod_client.account_info(address)

    def opt_in_to_asset(
        self,
        account_private_key: str,
        asset_id: int
    ) -> str:
        """
        Opt-in to an ASA

        Args:
            account_private_key: Account private key
            asset_id: Asset ID to opt into

        Returns:
            Transaction ID
        """
        address = account.address_from_private_key(account_private_key)
        params = self.get_suggested_params()

        txn = transaction.AssetTransferTxn(
            sender=address,
            sp=params,
            receiver=address,
            amt=0,
            index=asset_id
        )

        # Sign and send
        signed_txn = txn.sign(account_private_key)
        txid = self.algod_client.send_transaction(signed_txn)

        # Wait for confirmation
        self.wait_for_confirmation(txid)

        return txid


# Global singleton instance
algorand_service = AlgorandService()
