"""
Seed data for initial markets
"""

from datetime import datetime, timedelta
from models.market import Market, MarketStatus

def get_seed_markets():
    """Get initial dummy markets"""
    
    # Market 1: Bitcoin
    market1 = Market(
        id="market_btc100k",
        question="Will Bitcoin reach $100,000 by end of 2025?",
        description="Market will resolve YES if Bitcoin (BTC/USD) reaches or exceeds $100,000 at any point before December 31, 2025 11:59 PM UTC.",
        creator_address="SEEDWALLETADDRESS123456789012345678901234567890ABCDEF",
        category="Crypto",
        outcomes=["Yes", "No"],
        end_time=datetime(2025, 12, 31, 23, 59, 59),
        resolution_source="CoinMarketCap/CoinGecko",
        app_id=1001
    )
    market1.status = MarketStatus.ACTIVE
    market1.outcome_token_ids = {"Yes": 2001, "No": 2002}
    market1.total_liquidity = 45230.0
    market1.total_volume = 45230.0
    market1.prices = {"Yes": 0.67, "No": 0.33}
    
    # Market 2: AI Jobs
    market2 = Market(
        id="market_aijobs",
        question="Will AI replace 10% of jobs by 2026?",
        description="Resolves YES if credible studies show that AI has directly replaced at least 10% of total global employment by end of 2026.",
        creator_address="SEEDWALLETADDRESS123456789012345678901234567890ABCDEF",
        category="Technology",
        outcomes=["Yes", "No"],
        end_time=datetime(2026, 12, 31, 23, 59, 59),
        resolution_source="World Economic Forum/ILO Reports",
        app_id=1002
    )
    market2.status = MarketStatus.ACTIVE
    market2.outcome_token_ids = {"Yes": 2003, "No": 2004}
    market2.total_liquidity = 32100.0
    market2.total_volume = 32100.0
    market2.prices = {"Yes": 0.42, "No": 0.58}
    
    # Market 3: SpaceX Mars
    market3 = Market(
        id="market_spacexmars",
        question="Will SpaceX land on Mars before 2030?",
        description="Market resolves YES if SpaceX successfully lands a spacecraft on Mars with humans on board before January 1, 2030.",
        creator_address="SEEDWALLETADDRESS123456789012345678901234567890ABCDEF",
        category="Space",
        outcomes=["Yes", "No"],
        end_time=datetime(2029, 12, 31, 23, 59, 59),
        resolution_source="NASA/SpaceX Official Announcements",
        app_id=1003
    )
    market3.status = MarketStatus.ACTIVE
    market3.outcome_token_ids = {"Yes": 2005, "No": 2006}
    market3.total_liquidity = 67890.0
    market3.total_volume = 67890.0
    market3.prices = {"Yes": 0.28, "No": 0.72}
    
    return [market1, market2, market3]
