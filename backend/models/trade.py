"""Trade model"""

from datetime import datetime
from typing import Optional


class Trade:
    """Trade model for in-memory storage"""

    def __init__(
        self,
        id: str,
        market_id: str,
        trader_address: str,
        outcome: str,
        amount: float,
        shares: float,
        price: float,
        txn_id: Optional[str] = None,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.market_id = market_id
        self.trader_address = trader_address
        self.outcome = outcome
        self.amount = amount  # Amount in ALGO
        self.shares = shares  # Shares received
        self.price = price  # Price per share
        self.txn_id = txn_id  # Algorand transaction ID
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "market_id": self.market_id,
            "trader_address": self.trader_address,
            "outcome": self.outcome,
            "amount": self.amount,
            "shares": self.shares,
            "price": self.price,
            "txn_id": self.txn_id,
            "created_at": self.created_at.isoformat()
        }
