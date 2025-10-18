"""Tournament schemas"""

from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel, Field, field_validator


class CreateTournamentRequest(BaseModel):
    """Request to create a new tournament"""
    name: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=2000)
    market_ids: List[str] = Field(..., min_length=1)
    entry_fee: float = Field(..., ge=0)
    prize_pool: float = Field(..., ge=0)
    start_time: datetime
    end_time: datetime
    max_participants: int = Field(..., ge=2, le=1000)
    creator_address: str

    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: datetime, info) -> datetime:
        """Validate end time is after start time"""
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError("End time must be after start time")
        return v


class JoinTournamentRequest(BaseModel):
    """Request to join a tournament"""
    participant_address: str


class SubmitPredictionRequest(BaseModel):
    """Request to submit prediction for tournament"""
    participant_address: str
    predictions: Dict[str, str]  # market_id -> outcome


class TournamentResponse(BaseModel):
    """Tournament response"""
    id: str
    name: str
    description: str
    creator_address: str
    market_ids: List[str]
    entry_fee: float
    prize_pool: float
    start_time: str
    end_time: str
    max_participants: int
    created_at: str
    status: str
    participants: List[str]
    participant_count: int
    participant_scores: Dict[str, float]
    predictions: Dict[str, Dict[str, str]]
    winners: List[str]
    prize_distribution: Dict[str, float]

    class Config:
        from_attributes = True
