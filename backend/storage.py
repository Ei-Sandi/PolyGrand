"""
In-memory storage for MVP
Replace with actual database (PostgreSQL) in production
"""

from typing import Dict, List, Optional
from models.market import Market
from models.tournament import Tournament
from models.trade import Trade
from models.stake import Stake
from models.user import User


class InMemoryStorage:
    """In-memory storage for all data"""

    def __init__(self) -> None:
        """Initialize storage"""
        self.markets: Dict[str, Market] = {}
        self.tournaments: Dict[str, Tournament] = {}
        self.trades: Dict[str, Trade] = {}
        self.stakes: Dict[str, Stake] = {}
        self.users: Dict[str, User] = {}

        # Indexes for efficient querying
        self.trades_by_market: Dict[str, List[str]] = {}  # market_id -> [trade_ids]
        self.trades_by_user: Dict[str, List[str]] = {}  # user_address -> [trade_ids]
        self.stakes_by_market: Dict[str, List[str]] = {}  # market_id -> [stake_ids]
        self.stakes_by_user: Dict[str, List[str]] = {}  # user_address -> [stake_ids]

    # Market operations
    def create_market(self, market: Market) -> Market:
        """Create a new market"""
        self.markets[market.id] = market
        return market

    def get_market(self, market_id: str) -> Optional[Market]:
        """Get market by ID"""
        return self.markets.get(market_id)

    def get_all_markets(self) -> List[Market]:
        """Get all markets"""
        return list(self.markets.values())

    def get_active_markets(self) -> List[Market]:
        """Get all active markets"""
        return [m for m in self.markets.values() if m.status.value == "active"]

    def update_market(self, market_id: str, market: Market) -> Market:
        """Update a market"""
        self.markets[market_id] = market
        return market

    # Tournament operations
    def create_tournament(self, tournament: Tournament) -> Tournament:
        """Create a new tournament"""
        self.tournaments[tournament.id] = tournament
        return tournament

    def get_tournament(self, tournament_id: str) -> Optional[Tournament]:
        """Get tournament by ID"""
        return self.tournaments.get(tournament_id)

    def get_all_tournaments(self) -> List[Tournament]:
        """Get all tournaments"""
        return list(self.tournaments.values())

    def update_tournament(self, tournament_id: str, tournament: Tournament) -> Tournament:
        """Update a tournament"""
        self.tournaments[tournament_id] = tournament
        return tournament

    # Trade operations
    def create_trade(self, trade: Trade) -> Trade:
        """Create a new trade"""
        self.trades[trade.id] = trade

        # Update indexes
        if trade.market_id not in self.trades_by_market:
            self.trades_by_market[trade.market_id] = []
        self.trades_by_market[trade.market_id].append(trade.id)

        if trade.trader_address not in self.trades_by_user:
            self.trades_by_user[trade.trader_address] = []
        self.trades_by_user[trade.trader_address].append(trade.id)

        return trade

    def get_trade(self, trade_id: str) -> Optional[Trade]:
        """Get trade by ID"""
        return self.trades.get(trade_id)

    def get_trades_by_market(self, market_id: str) -> List[Trade]:
        """Get all trades for a market"""
        trade_ids = self.trades_by_market.get(market_id, [])
        return [self.trades[tid] for tid in trade_ids if tid in self.trades]

    def get_trades_by_user(self, user_address: str) -> List[Trade]:
        """Get all trades by a user"""
        trade_ids = self.trades_by_user.get(user_address, [])
        return [self.trades[tid] for tid in trade_ids if tid in self.trades]

    # Stake operations
    def create_stake(self, stake: Stake) -> Stake:
        """Create a new stake"""
        self.stakes[stake.id] = stake

        # Update indexes
        if stake.market_id not in self.stakes_by_market:
            self.stakes_by_market[stake.market_id] = []
        self.stakes_by_market[stake.market_id].append(stake.id)

        if stake.staker_address not in self.stakes_by_user:
            self.stakes_by_user[stake.staker_address] = []
        self.stakes_by_user[stake.staker_address].append(stake.id)

        return stake

    def get_stake(self, stake_id: str) -> Optional[Stake]:
        """Get stake by ID"""
        return self.stakes.get(stake_id)

    def get_stakes_by_market(self, market_id: str) -> List[Stake]:
        """Get all stakes for a market"""
        stake_ids = self.stakes_by_market.get(market_id, [])
        return [self.stakes[sid] for sid in stake_ids if sid in self.stakes]

    def get_stakes_by_user(self, user_address: str) -> List[Stake]:
        """Get all stakes by a user"""
        stake_ids = self.stakes_by_user.get(user_address, [])
        return [self.stakes[sid] for sid in stake_ids if sid in self.stakes]

    # User operations
    def create_user(self, user: User) -> User:
        """Create a new user"""
        self.users[user.address] = user
        return user

    def get_user(self, address: str) -> Optional[User]:
        """Get user by address"""
        return self.users.get(address)

    def get_or_create_user(self, address: str) -> User:
        """Get user by address or create if not exists"""
        user = self.users.get(address)
        if not user:
            user = User(address=address)
            self.users[address] = user
        return user

    def list_markets(self) -> List[Market]:
        """Alias for get_all_markets"""
        return self.get_all_markets()

    def list_users(self) -> List[User]:
        """Get all users"""
        return list(self.users.values())


# Global singleton instance
storage = InMemoryStorage()
