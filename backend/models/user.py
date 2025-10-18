"""User model"""

from datetime import datetime
from typing import Optional


class User:
    """User model for in-memory storage"""

    def __init__(
        self,
        address: str,
        username: Optional[str] = None,
        email: Optional[str] = None,
        created_at: Optional[datetime] = None
    ):
        self.address = address
        self.username = username or f"user_{address[:8]}"
        self.email = email
        self.created_at = created_at or datetime.utcnow()
        self.total_trades = 0
        self.total_volume = 0.0
        self.tournaments_joined = 0
        self.insights_staked = 0

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "address": self.address,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
            "total_trades": self.total_trades,
            "total_volume": self.total_volume,
            "tournaments_joined": self.tournaments_joined,
            "insights_staked": self.insights_staked
        }
