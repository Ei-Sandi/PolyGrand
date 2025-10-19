"""
Stats routes - Platform statistics and analytics
"""

from datetime import datetime
from fastapi import APIRouter

from models.market import MarketStatus
from storage import storage

router = APIRouter()


@router.get("/platform")
async def get_platform_stats() -> dict:
    """Get platform-wide statistics"""
    all_markets = storage.list_markets()
    
    total_volume = sum(m.total_volume for m in all_markets)
    total_liquidity = sum(m.total_liquidity for m in all_markets)
    active_markets = len([m for m in all_markets if m.status == MarketStatus.ACTIVE])
    resolved_markets = len([m for m in all_markets if m.status == MarketStatus.RESOLVED])
    
    return {
        "total_markets": len(all_markets),
        "active_markets": active_markets,
        "resolved_markets": resolved_markets,
        "total_volume": total_volume,
        "total_liquidity": total_liquidity,
        "total_traders": len(storage.list_users()),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10) -> list:
    """Get top traders leaderboard"""
    users = storage.list_users()
    
    # Sort by total profit
    sorted_users = sorted(users, key=lambda u: u.total_profit, reverse=True)[:limit]
    
    return [
        {
            "rank": idx + 1,
            "address": user.address,
            "total_profit": user.total_profit,
            "total_trades": user.total_trades,
            "win_rate": user.win_rate,
            "reputation_score": user.reputation_score
        }
        for idx, user in enumerate(sorted_users)
    ]
