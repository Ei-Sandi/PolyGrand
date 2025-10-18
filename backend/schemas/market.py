"""Market schemas"""

from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, field_validator


class CreateMarketRequest(BaseModel):
    """Request to create a new prediction market"""
    question: str = Field(..., min_length=10, max_length=500)
    description: str = Field(..., min_length=20, max_length=2000)
    category: str = Field(..., min_length=2, max_length=100)
    outcomes: List[str] = Field(..., min_length=2, max_length=10)
    end_time: datetime
    resolution_source: str = Field(..., min_length=5, max_length=500)
    initial_liquidity: float = Field(..., ge=1.0)
    creator_address: str

    @field_validator('outcomes')
    @classmethod
    def validate_outcomes(cls, v: List[str]) -> List[str]:
        """Validate outcomes are unique"""
        if len(v) != len(set(v)):
            raise ValueError("Outcomes must be unique")
        return v

    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: datetime) -> datetime:
        """Validate end time is in the future"""
        if v <= datetime.utcnow():
            raise ValueError("End time must be in the future")
        return v


class TradeRequest(BaseModel):
    """Request to execute a trade"""
    trader_address: str
    outcome: str
    amount: float = Field(..., gt=0)


class ResolveMarketRequest(BaseModel):
    """Request to resolve a market"""
    resolver_address: str
    winning_outcome: str
    proof: Optional[str] = None


class MarketResponse(BaseModel):
    """Market response"""
    id: str
    question: str
    description: str
    creator_address: str
    category: str
    outcomes: List[str]
    end_time: str
    resolution_source: str
    app_id: Optional[int]
    created_at: str
    status: str
    resolved_outcome: Optional[str]
    resolved_at: Optional[str]
    total_liquidity: float
    total_volume: float
    total_traders: int
    outcome_token_ids: Dict[str, int]
    prices: Dict[str, float]
    volumes: Dict[str, float]
    total_staked_insights: int
    ai_prediction: Optional[Dict[str, float]]

    class Config:
        from_attributes = True
