"""Stake model for insight staking"""

from datetime import datetime
from typing import Optional


class Stake:
    """Stake model for in-memory storage"""

    def __init__(
        self,
        id: str,
        market_id: str,
        staker_address: str,
        outcome: str,
        amount: float,
        reasoning: str,
        confidence: float,
        txn_id: Optional[str] = None,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.market_id = market_id
        self.staker_address = staker_address
        self.outcome = outcome
        self.amount = amount  # Amount staked in ALGO
        self.reasoning = reasoning  # Why they believe this outcome
        self.confidence = confidence  # Confidence level (0-1)
        self.txn_id = txn_id  # Algorand transaction ID
        self.created_at = created_at or datetime.utcnow()

        # Rewards
        self.reward_amount: Optional[float] = None
        self.is_correct: Optional[bool] = None
        self.claimed = False

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "market_id": self.market_id,
            "staker_address": self.staker_address,
            "outcome": self.outcome,
            "amount": self.amount,
            "reasoning": self.reasoning,
            "confidence": self.confidence,
            "txn_id": self.txn_id,
            "created_at": self.created_at.isoformat(),
            "reward_amount": self.reward_amount,
            "is_correct": self.is_correct,
            "claimed": self.claimed
        }
