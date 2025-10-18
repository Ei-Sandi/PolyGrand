"""Tournament model"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, List


class TournamentStatus(str, Enum):
    """Tournament status enum"""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Tournament:
    """Tournament model for in-memory storage"""

    def __init__(
        self,
        id: str,
        name: str,
        description: str,
        creator_address: str,
        market_ids: List[str],
        entry_fee: float,
        prize_pool: float,
        start_time: datetime,
        end_time: datetime,
        max_participants: int,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.name = name
        self.description = description
        self.creator_address = creator_address
        self.market_ids = market_ids
        self.entry_fee = entry_fee
        self.prize_pool = prize_pool
        self.start_time = start_time
        self.end_time = end_time
        self.max_participants = max_participants
        self.created_at = created_at or datetime.utcnow()

        # Status
        self.status = TournamentStatus.PENDING

        # Participants
        self.participants: List[str] = []  # List of addresses
        self.participant_scores: Dict[str, float] = {}  # address -> score

        # Predictions
        self.predictions: Dict[str, Dict[str, str]] = {}  # address -> {market_id: outcome}

        # Results
        self.winners: List[str] = []
        self.prize_distribution: Dict[str, float] = {}

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "creator_address": self.creator_address,
            "market_ids": self.market_ids,
            "entry_fee": self.entry_fee,
            "prize_pool": self.prize_pool,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "max_participants": self.max_participants,
            "created_at": self.created_at.isoformat(),
            "status": self.status.value,
            "participants": self.participants,
            "participant_count": len(self.participants),
            "participant_scores": self.participant_scores,
            "predictions": self.predictions,
            "winners": self.winners,
            "prize_distribution": self.prize_distribution
        }
