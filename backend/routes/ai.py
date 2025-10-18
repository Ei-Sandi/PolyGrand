"""
AI routes - AI predictions and analysis
"""

from typing import List, Dict
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from storage import storage
from services.ai_service import ai_service
from models.market import MarketStatus

router = APIRouter()


@router.get("/prediction/{market_id}")
async def get_ai_prediction(market_id: str) -> JSONResponse:
    """
    Get AI prediction for a specific market

    Returns probability distribution across outcomes
    Includes confidence score
    """
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
        )

    # Get or generate AI prediction
    if market.ai_prediction:
        prediction = market.ai_prediction
    else:
        prediction = ai_service.get_ai_prediction(
            market_question=market.question,
            outcomes=market.outcomes
        )
        market.ai_prediction = prediction
        storage.update_market(market_id, market)

    confidence = ai_service.get_ai_confidence(prediction)

    return JSONResponse({
        "market_id": market_id,
        "question": market.question,
        "prediction": prediction,
        "confidence": confidence,
        "model_version": ai_service.model_version,
        "generated_at": datetime.utcnow().isoformat()
    })


@router.get("/recommendation/{market_id}")
async def get_trading_recommendation(market_id: str) -> JSONResponse:
    """
    Get AI trading recommendation for a market

    Compares AI prediction with current market prices
    Suggests trading opportunities
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

    # Get AI prediction
    if not market.ai_prediction:
        market.ai_prediction = ai_service.get_ai_prediction(
            market_question=market.question,
            outcomes=market.outcomes
        )
        storage.update_market(market_id, market)

    # Generate recommendation
    recommendation = ai_service.get_trading_recommendation(
        market=market.to_dict(),
        ai_prediction=market.ai_prediction,
        current_prices=market.prices
    )

    return JSONResponse({
        "market_id": market_id,
        "recommendation": recommendation,
        "current_prices": market.prices,
        "ai_prediction": market.ai_prediction
    })


@router.get("/sentiment/{market_id}")
async def get_market_sentiment(market_id: str) -> JSONResponse:
    """
    Analyze market sentiment based on trading activity

    Shows whether traders are bullish, bearish, or neutral
    Includes momentum indicators
    """
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
        )

    # Get trades for sentiment analysis
    trades = storage.get_trades_by_market(market_id)
    trade_dicts = [t.to_dict() for t in trades]

    sentiment = ai_service.analyze_market_sentiment(
        market_id=market_id,
        trades=trade_dicts
    )

    return JSONResponse({
        "market_id": market_id,
        "sentiment_analysis": sentiment,
        "analyzed_at": datetime.utcnow().isoformat()
    })


@router.get("/performance")
async def get_ai_performance() -> JSONResponse:
    """
    Get AI performance metrics

    Compares AI predictions vs actual outcomes
    Shows accuracy rate and performance vs humans
    """
    # Get all resolved markets
    all_markets = storage.get_all_markets()
    resolved_markets = [
        m.to_dict() for m in all_markets
        if m.status == MarketStatus.RESOLVED
    ]

    # Calculate performance
    performance = ai_service.benchmark_ai_performance(resolved_markets)

    return JSONResponse({
        "performance_metrics": performance,
        "total_predictions": ai_service.predictions_generated,
        "model_version": ai_service.model_version,
        "updated_at": datetime.utcnow().isoformat()
    })


@router.get("/top-opportunities")
async def get_top_opportunities(limit: int = 10) -> JSONResponse:
    """
    Get top trading opportunities across all markets

    Finds markets where AI prediction differs most from market prices
    Ranked by expected value
    """
    active_markets = storage.get_active_markets()
    opportunities = []

    for market in active_markets:
        # Generate AI prediction if not exists
        if not market.ai_prediction:
            market.ai_prediction = ai_service.get_ai_prediction(
                market_question=market.question,
                outcomes=market.outcomes
            )
            storage.update_market(market.id, market)

        # Find best opportunity in this market
        best_edge = 0
        best_outcome = None
        best_action = None

        for outcome in market.outcomes:
            ai_prob = market.ai_prediction[outcome]
            market_price = market.prices.get(outcome, 0.5)
            edge = ai_prob - market_price

            if abs(edge) > abs(best_edge):
                best_edge = edge
                best_outcome = outcome
                best_action = "BUY" if edge > 0 else "SELL"

        if best_outcome and abs(best_edge) > 0.05:  # Only significant edges
            opportunities.append({
                "market_id": market.id,
                "question": market.question,
                "outcome": best_outcome,
                "action": best_action,
                "edge": best_edge,
                "ai_probability": market.ai_prediction[best_outcome],
                "market_price": market.prices[best_outcome],
                "volume": market.total_volume,
                "liquidity": market.total_liquidity
            })

    # Sort by edge (absolute value)
    opportunities = sorted(
        opportunities,
        key=lambda x: abs(x["edge"]),
        reverse=True
    )[:limit]

    return JSONResponse({
        "opportunities": opportunities,
        "total_markets_analyzed": len(active_markets),
        "generated_at": datetime.utcnow().isoformat()
    })


@router.post("/refresh-prediction/{market_id}")
async def refresh_ai_prediction(market_id: str) -> JSONResponse:
    """
    Refresh AI prediction for a market

    Regenerates prediction based on latest data
    """
    market = storage.get_market(market_id)

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market {market_id} not found"
        )

    # Get latest trades for historical data
    trades = storage.get_trades_by_market(market_id)
    historical_data = {
        "trades": [t.to_dict() for t in trades],
        "current_prices": market.prices,
        "volume": market.total_volume
    }

    # Generate new prediction
    new_prediction = ai_service.get_ai_prediction(
        market_question=market.question,
        outcomes=market.outcomes,
        historical_data=historical_data
    )

    # Update market
    old_prediction = market.ai_prediction
    market.ai_prediction = new_prediction
    storage.update_market(market_id, market)

    return JSONResponse({
        "market_id": market_id,
        "old_prediction": old_prediction,
        "new_prediction": new_prediction,
        "updated_at": datetime.utcnow().isoformat()
    })
