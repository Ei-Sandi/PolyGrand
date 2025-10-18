"""Market model"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, List


class MarketStatus(str, Enum):
    """Market status enum"""
    ACTIVE = "active"
    CLOSED = "closed"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class Market:
    """Market model for in-memory storage"""

    def __init__(
        self,
        id: str,
        question: str,
        description: str,
        creator_address: str,
        category: str,
        outcomes: List[str],
        end_time: datetime,
        resolution_source: str,
        app_id: Optional[int] = None,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.question = question
        self.description = description
        self.creator_address = creator_address
        self.category = category
        self.outcomes = outcomes
        self.end_time = end_time
        self.resolution_source = resolution_source
        self.app_id = app_id
        self.created_at = created_at or datetime.utcnow()

        # Status and resolution
        self.status = MarketStatus.ACTIVE
        self.resolved_outcome: Optional[str] = None
        self.resolved_at: Optional[datetime] = None

        # Financial data
        self.total_liquidity = 0.0
        self.total_volume = 0.0
        self.total_traders = 0

        # Outcome token ASA IDs
        self.outcome_token_ids: Dict[str, int] = {}

        # Prices (probability percentages)
        self.prices: Dict[str, float] = {
            outcome: 1.0 / len(outcomes) for outcome in outcomes
        }

        # Volume by outcome
        self.volumes: Dict[str, float] = {outcome: 0.0 for outcome in outcomes}

        # Staking data
        self.total_staked_insights = 0
        self.ai_prediction: Optional[Dict[str, float]] = None

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "question": self.question,
            "description": self.description,
            "creator_address": self.creator_address,
            "category": self.category,
            "outcomes": self.outcomes,
            "end_time": self.end_time.isoformat(),
            "resolution_source": self.resolution_source,
            "app_id": self.app_id,
            "created_at": self.created_at.isoformat(),
            "status": self.status.value,
            "resolved_outcome": self.resolved_outcome,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "total_liquidity": self.total_liquidity,
            "total_volume": self.total_volume,
            "total_traders": self.total_traders,
            "outcome_token_ids": self.outcome_token_ids,
            "prices": self.prices,
            "volumes": self.volumes,
            "total_staked_insights": self.total_staked_insights,
            "ai_prediction": self.ai_prediction
        }
