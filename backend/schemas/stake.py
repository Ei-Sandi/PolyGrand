"""Staking schemas"""

from typing import Optional
from pydantic import BaseModel, Field


class StakeRequest(BaseModel):
    """Request to stake on an insight"""
    market_id: str
    staker_address: str
    outcome: str
    amount: float = Field(..., gt=0)
    reasoning: str = Field(..., min_length=10, max_length=1000)
    confidence: float = Field(..., ge=0, le=1)


class StakeResponse(BaseModel):
    """Stake response"""
    id: str
    market_id: str
    staker_address: str
    outcome: str
    amount: float
    reasoning: str
    confidence: float
    txn_id: Optional[str]
    created_at: str
    reward_amount: Optional[float]
    is_correct: Optional[bool]
    claimed: bool

    class Config:
        from_attributes = True
