from algosdk import account, transaction
from algosdk.v2client import algod
from algosdk.transaction import AssetCreateTxn, ApplicationCreateTxn, PaymentTxn, StateSchema, OnComplete, wait_for_confirmation
import os
from dotenv import load_dotenv

load_dotenv()

# Algorand configuration
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
PRIVATE_KEY = os.getenv("CREATOR_PRIVATE_KEY")
CREATOR_ADDRESS = os.getenv("CREATOR_ADDRESS")

def compile_program(client, source_code):
    compile_response = client.compile(source_code)
    return compile_response['result']

def deploy_contract():
    # Initialize algod client
    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
    
    # Get suggested params
    params = algod_client.suggested_params()
    
    try:
        # Create outcome ASAs
        print("Creating Outcome A ASA...")
        txn_a = AssetCreateTxn(
            sender=CREATOR_ADDRESS,
            sp=params,
            total=1000000,
            decimals=0,
            default_frozen=False,
            unit_name=b"OUTA",
            asset_name=b"OutcomeA",
            manager=CREATOR_ADDRESS,
            reserve=CREATOR_ADDRESS,
            freeze=CREATOR_ADDRESS,
            clawback=CREATOR_ADDRESS,
            url="https://predictionmarket.com/outcomeA",
            strict_empty_address_check=False
        )
        
        print("Creating Outcome B ASA...")
        txn_b = AssetCreateTxn(
            sender=CREATOR_ADDRESS,
            sp=params,
            total=1000000,
            decimals=0,
            default_frozen=False,
            unit_name=b"OUTB", 
            asset_name=b"OutcomeB",
            manager=CREATOR_ADDRESS,
            reserve=CREATOR_ADDRESS,
            freeze=CREATOR_ADDRESS,
            clawback=CREATOR_ADDRESS,
            url="https://predictionmarket.com/outcomeB",
            strict_empty_address_check=False
        )
        
        # Sign and send ASA creation transactions
        signed_txn_a = txn_a.sign(PRIVATE_KEY)
        signed_txn_b = txn_b.sign(PRIVATE_KEY)
        
        txid_a = algod_client.send_transaction(signed_txn_a)
        txid_b = algod_client.send_transaction(signed_txn_b)
        
        # Wait for confirmations
        wait_for_confirmation(algod_client, txid_a, 4)
        wait_for_confirmation(algod_client, txid_b, 4)
        
        # Get created ASA IDs
        ptx_a = algod_client.pending_transaction_info(txid_a)
        ptx_b = algod_client.pending_transaction_info(txid_b)
        
        asa_a_id = ptx_a["asset-index"]
        asa_b_id = ptx_b["asset-index"]
        
        print(f"Created Outcome A ASA: {asa_a_id}")
        print(f"Created Outcome B ASA: {asa_b_id}")
        
        # Compile and deploy smart contract
        print("Compiling smart contract...")
        with open("market_approval.teal", "r") as f:
            approval_teal = f.read()
        with open("market_clear.teal", "r") as f:
            clear_teal = f.read()
            
        approval_result = compile_program(algod_client, approval_teal)
        clear_result = compile_program(algod_client, clear_teal)
        
        # Create application
        print("Deploying smart contract...")
        app_txn = ApplicationCreateTxn(
            sender=CREATOR_ADDRESS,
            sp=params,
            on_complete=OnComplete.NoOpOC,
            approval_program=bytes.fromhex(approval_result),
            clear_program=bytes.fromhex(clear_result),
            global_schema=StateSchema(10, 10),
            local_schema=StateSchema(0, 0),
            app_args=[b"setup", asa_a_id.to_bytes(8, 'big'), asa_b_id.to_bytes(8, 'big')]
        )
        
        signed_app_txn = app_txn.sign(PRIVATE_KEY)
        txid = algod_client.send_transaction(signed_app_txn)
        wait_for_confirmation(algod_client, txid, 4)
        
        # Get app ID
        ptx = algod_client.pending_transaction_info(txid)
        app_id = ptx["application-index"]
        
        print(f"✅ Successfully deployed Prediction Market App ID: {app_id}")
        print(f"Outcome A ASA: {asa_a_id}")
        print(f"Outcome B ASA: {asa_b_id}")
        
        return app_id, asa_a_id, asa_b_id
        
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        return None, None, None

if __name__ == "__main__":
    deploy_contract()