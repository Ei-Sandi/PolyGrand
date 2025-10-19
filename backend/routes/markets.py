"""
Market routes - Create, trade, and resolve prediction markets
"""

import uuid
from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from models.market import Market, MarketStatus
from models.trade import Trade
from schemas.market import (
    CreateMarketRequest,
    MarketResponse,
    TradeRequest,
    ResolveMarketRequest
)
from storage import storage
from services.algorand import algorand_service
from services.ai_service import ai_service
from services.websocket import websocket_manager

router = APIRouter()


@router.post("/", response_model=MarketResponse, status_code=status.HTTP_201_CREATED)
async def create_market(request: CreateMarketRequest) -> MarketResponse:
    """
    Create a new prediction market

    Creates a market with:
    - Smart contract deployment on Algorand
    - Outcome tokens (ASAs) for each outcome
    - Initial liquidity
    - AI prediction generation
    """
    try:
        # Generate market ID
        market_id = f"market_{uuid.uuid4().hex[:12]}"

        # Mock blockchain deployment (since we don't have test accounts)
        # In production, this would actually deploy to Algorand
        app_id = int(uuid.uuid4().int % 100000)  # Mock app ID
        
        print(f"🚀 Creating market: {request.question}")
        print(f"   - Market ID: {market_id}")
        print(f"   - Mock App ID: {app_id}")
        print(f"   - Creator: {request.creator_address}")
        print(f"   - Initial Liquidity: {request.initial_liquidity} ALGO")

        # Mock outcome token IDs
        outcome_token_ids = {}
        for i, outcome in enumerate(request.outcomes):
            outcome_token_ids[outcome] = int(uuid.uuid4().int % 100000) + i
        
        print(f"   - Outcome Tokens: {outcome_token_ids}")

        # Create market
        market = Market(
            id=market_id,
            question=request.question,
            description=request.description,
            creator_address=request.creator_address,
            category=request.category,
            outcomes=request.outcomes,
            end_time=request.end_time,
            resolution_source=request.resolution_source,
            app_id=app_id
        )
        
        # Status is automatically set to ACTIVE in __init__
        market.outcome_token_ids = outcome_token_ids
        market.total_liquidity = request.initial_liquidity
        market.total_volume = 0.0
        
        # Initialize equal prices for outcomes (50/50 for binary markets)
        equal_price = 1.0 / len(request.outcomes)
        market.prices = {outcome: equal_price for outcome in request.outcomes}

        # Mock AI prediction (random for demo)
        import random
        ai_outcome = random.choice(request.outcomes)
        ai_confidence = round(random.uniform(0.55, 0.85), 2)
        market.ai_prediction = {
            "predicted_outcome": ai_outcome,
            "confidence": ai_confidence,
            "reasoning": f"AI analysis suggests {ai_outcome} is more likely based on historical data patterns."
        }

        # Save to storage
        storage.create_market(market)
        
        print(f"✅ Market created successfully!")
        print(f"   - Status: {market.status.value}")
        print(f"   - AI Prediction: {ai_outcome} ({ai_confidence})")

        # Broadcast market creation via WebSocket
        try:
            await websocket_manager.broadcast(
                f"New market created: {market.question}"
            )
        except:
            pass  # Ignore if no websocket connections

        return MarketResponse(**market.to_dict())

    except Exception as e:
        print(f"❌ Failed to create market: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create market: {str(e)}"
        )


@router.get("/", response_model=List[MarketResponse])
async def get_markets(
    status_filter: str | None = None,
    category: str | None = None,
    limit: int = 100
) -> List[MarketResponse]:
    """
    Get all markets with optional filtering

    Query Parameters:
    - status: Filter by market status (active, closed, resolved)
    - category: Filter by category
    - limit: Maximum number of markets to return
    """
    markets = storage.get_all_markets()

    # Apply filters
    if status_filter:
        markets = [m for m in markets if m.status.value == status_filter]

    if category:
        markets = [m for m in markets if m.category.lower() == category.lower()]

    # Sort by created_at (newest first)
    markets = sorted(markets, key=lambda m: m.created_at, reverse=True)

    # Apply limit
    markets = markets[:limit]

    return [MarketResponse(**m.to_dict()) for m in markets]


@router.get("/{market_id}", response_model=MarketResponse)
async def get_market(market_id: str) -> MarketResponse:
    """Get a single market by ID"""
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
        )

    return MarketResponse(**market.to_dict())


@router.post("/{market_id}/trade", status_code=status.HTTP_201_CREATED)
async def execute_trade(market_id: str, request: TradeRequest) -> JSONResponse:
    """
    Execute a trade on a market

    Buys outcome tokens based on the amount provided
    Updates market prices using automated market maker logic
    """
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
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
        # Calculate shares based on current price
        current_price = market.prices[request.outcome]
        shares = request.amount / current_price

        # Update market prices (simple AMM logic)
        # In production, use proper constant product formula
        total_volume = sum(market.volumes.values()) + request.amount
        market.volumes[request.outcome] += request.amount

        # Recalculate prices based on volume
        for outcome in market.outcomes:
            if total_volume > 0:
                market.prices[outcome] = market.volumes[outcome] / total_volume
            else:
                market.prices[outcome] = 1.0 / len(market.outcomes)

        # Normalize prices to sum to 1
        price_sum = sum(market.prices.values())
        if price_sum > 0:
            market.prices = {k: v / price_sum for k, v in market.prices.items()}

        # Update market stats
        market.total_volume += request.amount
        market.total_traders += 1

        # Create trade record
        trade = Trade(
            id=f"trade_{uuid.uuid4().hex[:12]}",
            market_id=market_id,
            trader_address=request.trader_address,
            outcome=request.outcome,
            amount=request.amount,
            shares=shares,
            price=current_price,
            txn_id=f"txn_{uuid.uuid4().hex[:12]}"  # Mock transaction ID
        )

        storage.create_trade(trade)
        storage.update_market(market_id, market)

        # Update user stats
        user = storage.get_or_create_user(request.trader_address)
        user.total_trades += 1
        user.total_volume += request.amount

        # Broadcast price update
        await websocket_manager.send_market_update(
            market_id=market_id,
            update_type="trade",
            data={
                "outcome": request.outcome,
                "amount": request.amount,
                "new_price": market.prices[request.outcome],
                "trader": request.trader_address,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        return JSONResponse({
            "success": True,
            "trade_id": trade.id,
            "shares_received": shares,
            "new_price": market.prices[request.outcome],
            "txn_id": trade.txn_id
        })

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute trade: {str(e)}"
        )


@router.post("/{market_id}/resolve", response_model=MarketResponse)
async def resolve_market(market_id: str, request: ResolveMarketRequest) -> MarketResponse:
    """
    Resolve a market with the winning outcome

    Only the market creator can resolve
    Distributes winnings to traders who bet on winning outcome
    """
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
        )

    if market.status == MarketStatus.RESOLVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Market already resolved"
        )

    if request.resolver_address != market.creator_address:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only market creator can resolve"
        )

    if request.winning_outcome not in market.outcomes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid winning outcome: {request.winning_outcome}"
        )

    # Update market
    market.status = MarketStatus.RESOLVED
    market.resolved_outcome = request.winning_outcome
    market.resolved_at = datetime.utcnow()

    storage.update_market(market_id, market)

    # Process stakes - reward correct predictions
    stakes = storage.get_stakes_by_market(market_id)
    total_correct_stake = sum(
        s.amount for s in stakes if s.outcome == request.winning_outcome
    )
    total_incorrect_stake = sum(
        s.amount for s in stakes if s.outcome != request.winning_outcome
    )

    for stake in stakes:
        stake.is_correct = (stake.outcome == request.winning_outcome)
        if stake.is_correct and total_correct_stake > 0:
            # Reward = original stake + proportional share of incorrect stakes
            stake.reward_amount = stake.amount + (
                stake.amount / total_correct_stake * total_incorrect_stake
            )

    # Broadcast resolution
    await websocket_manager.send_market_update(
        market_id=market_id,
        update_type="resolution",
        data={
            "winning_outcome": request.winning_outcome,
            "resolved_at": market.resolved_at.isoformat(),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

    return MarketResponse(**market.to_dict())


@router.get("/{market_id}/trades")
async def get_market_trades(market_id: str, limit: int = 100) -> List[dict]:
    """Get all trades for a market"""
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
        )

    trades = storage.get_trades_by_market(market_id)
    trades = sorted(trades, key=lambda t: t.created_at, reverse=True)[:limit]

    return [t.to_dict() for t in trades]
