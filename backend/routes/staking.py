"""
Staking routes - Stake insights on market outcomes
"""

import uuid
from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from models.stake import Stake
from models.market import MarketStatus
from schemas.stake import StakeRequest, StakeResponse
from storage import storage
from services.algorand import algorand_service
from services.websocket import websocket_manager

router = APIRouter()


@router.post("/", response_model=StakeResponse, status_code=status.HTTP_201_CREATED)
async def create_stake(request: StakeRequest) -> StakeResponse:
    """
    Stake on a market outcome with reasoning

    Users can stake ALGO on their predicted outcome
    Provide reasoning and confidence level
    Winners receive proportional rewards from losing stakes
    """
    # Validate market exists
    market = storage.get_market(request.market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {request.market_id} not found"
        )

    if market.status != MarketStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Market is not active"
        )

    if request.outcome not in market.outcomes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid outcome: {request.outcome}"
        )

    try:
        # Generate stake ID
        stake_id = f"stake_{uuid.uuid4().hex[:12]}"

        # Process payment (mock - in production, verify Algorand transaction)
        txn_id = f"txn_{uuid.uuid4().hex[:12]}"

        # Create stake
        stake = Stake(
            id=stake_id,
            market_id=request.market_id,
            staker_address=request.staker_address,
            outcome=request.outcome,
            amount=request.amount,
            reasoning=request.reasoning,
            confidence=request.confidence,
            txn_id=txn_id
        )

        storage.create_stake(stake)

        # Update market stats
        market.total_staked_insights += 1
        storage.update_market(request.market_id, market)

        # Update user stats
        user = storage.get_or_create_user(request.staker_address)
        user.insights_staked += 1

        # Broadcast stake
        await websocket_manager.send_market_update(
            market_id=request.market_id,
            update_type="stake",
            data={
                "staker": request.staker_address,
                "outcome": request.outcome,
                "amount": request.amount,
                "confidence": request.confidence,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        return StakeResponse(**stake.to_dict())

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create stake: {str(e)}"
        )


@router.get("/market/{market_id}", response_model=List[StakeResponse])
async def get_market_stakes(market_id: str, limit: int = 100) -> List[StakeResponse]:
    """
    Get all stakes for a market

    Shows community insights and reasoning
    """
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
        )

    stakes = storage.get_stakes_by_market(market_id)
    stakes = sorted(stakes, key=lambda s: s.created_at, reverse=True)[:limit]

    return [StakeResponse(**s.to_dict()) for s in stakes]


@router.get("/user/{user_address}", response_model=List[StakeResponse])
async def get_user_stakes(user_address: str, limit: int = 100) -> List[StakeResponse]:
    """Get all stakes by a user"""
    stakes = storage.get_stakes_by_user(user_address)
    stakes = sorted(stakes, key=lambda s: s.created_at, reverse=True)[:limit]

    return [StakeResponse(**s.to_dict()) for s in stakes]


@router.get("/{stake_id}", response_model=StakeResponse)
async def get_stake(stake_id: str) -> StakeResponse:
    """Get a specific stake by ID"""
    stake = storage.get_stake(stake_id)

    if not stake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stake {stake_id} not found"
        )

    return StakeResponse(**stake.to_dict())


@router.post("/{stake_id}/claim")
async def claim_stake_reward(stake_id: str, claimer_address: str) -> JSONResponse:
    """
    Claim rewards from a stake

    Only available after market is resolved
    Only correct predictions receive rewards
    """
    stake = storage.get_stake(stake_id)

    if not stake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stake {stake_id} not found"
        )

    if stake.staker_address != claimer_address:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only claim your own stakes"
        )

    if stake.claimed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rewards already claimed"
        )

    # Check if market is resolved
    market = storage.get_market(stake.market_id)
    if not market or market.status != MarketStatus.RESOLVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Market not yet resolved"
        )

    # Check if stake was correct
    if not stake.is_correct:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stake did not predict correctly - no rewards available"
        )

    if stake.reward_amount is None or stake.reward_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No rewards available"
        )

    # Process reward payment (mock - in production, send Algorand transaction)
    stake.claimed = True

    return JSONResponse({
        "success": True,
        "stake_id": stake_id,
        "reward_amount": stake.reward_amount,
        "txn_id": f"reward_txn_{uuid.uuid4().hex[:12]}"
    })


@router.get("/market/{market_id}/insights")
async def get_market_insights(market_id: str) -> JSONResponse:
    """
    Get aggregated insights for a market

    Analyzes all stakes to show community sentiment
    Shows most popular predictions and reasoning
    """
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
        )

    stakes = storage.get_stakes_by_market(market_id)

    # Aggregate by outcome
    outcome_stats = {}
    for outcome in market.outcomes:
        outcome_stakes = [s for s in stakes if s.outcome == outcome]
        total_staked = sum(s.amount for s in outcome_stakes)
        avg_confidence = (
            sum(s.confidence for s in outcome_stakes) / len(outcome_stakes)
            if outcome_stakes else 0
        )

        # Get top reasoning
        top_stakes = sorted(
            outcome_stakes,
            key=lambda s: s.amount * s.confidence,
            reverse=True
        )[:3]

        outcome_stats[outcome] = {
            "total_staked": total_staked,
            "num_stakers": len(outcome_stakes),
            "avg_confidence": avg_confidence,
            "top_reasoning": [
                {
                    "staker": s.staker_address,
                    "reasoning": s.reasoning,
                    "confidence": s.confidence,
                    "amount": s.amount
                }
                for s in top_stakes
            ]
        }

    return JSONResponse({
        "market_id": market_id,
        "total_stakes": len(stakes),
        "total_amount_staked": sum(s.amount for s in stakes),
        "outcome_insights": outcome_stats
    })
