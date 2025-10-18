# PolyGrand Backend

FastAPI backend for PolyGrand - Prediction Market Platform on Algorand

## Features

- **Prediction Markets**: Create and trade on prediction markets
- **Algorand Integration**: Smart contracts and ASA tokens for outcomes
- **AI Predictions**: AI-powered market predictions and recommendations
- **Insight Staking**: Stake on predictions with reasoning
- **Tournaments**: Competitive prediction tournaments
- **Real-time Updates**: WebSocket support for live market data
- **In-memory Storage**: Fast MVP implementation (ready for database migration)

## Tech Stack

- **Framework**: FastAPI 0.115+
- **Blockchain**: Algorand (via AlgoKit & py-algorand-sdk)
- **Validation**: Pydantic v2
- **Real-time**: WebSockets
- **Python**: 3.12+

## Project Structure

```
backend/
├── app.py                 # Main FastAPI application
├── storage.py            # In-memory storage (MVP)
├── models/               # Data models
│   ├── market.py
│   ├── tournament.py
│   ├── trade.py
│   ├── stake.py
│   └── user.py
├── schemas/              # Pydantic schemas
│   ├── market.py
│   ├── tournament.py
│   └── stake.py
├── routes/               # API routes
│   ├── markets.py
│   ├── tournaments.py
│   ├── staking.py
│   └── ai.py
└── services/             # Business logic
    ├── algorand.py       # Algorand blockchain service
    ├── ai_service.py     # AI predictions
    └── websocket.py      # WebSocket manager
```

## Setup Instructions

### 1. Environment Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# At minimum, set:
# - ALGORAND_NETWORK (testnet/localnet/mainnet)
# - CREATOR_MNEMONIC (your Algorand account mnemonic)
```

### 3. Run the Server

```bash
# Development mode (with auto-reload)
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Or run directly
python app.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Markets

- `POST /api/v1/markets` - Create new market
- `GET /api/v1/markets` - List all markets
- `GET /api/v1/markets/{id}` - Get market details
- `POST /api/v1/markets/{id}/trade` - Execute trade
- `POST /api/v1/markets/{id}/resolve` - Resolve market
- `GET /api/v1/markets/{id}/trades` - Get market trades

### Tournaments

- `POST /api/v1/tournaments` - Create tournament
- `GET /api/v1/tournaments` - List tournaments
- `GET /api/v1/tournaments/{id}` - Get tournament details
- `POST /api/v1/tournaments/{id}/join` - Join tournament
- `POST /api/v1/tournaments/{id}/start` - Start tournament
- `POST /api/v1/tournaments/{id}/predict` - Submit predictions
- `POST /api/v1/tournaments/{id}/complete` - Complete tournament
- `GET /api/v1/tournaments/{id}/leaderboard` - Get leaderboard

### Staking

- `POST /api/v1/staking` - Stake on market outcome
- `GET /api/v1/staking/market/{id}` - Get market stakes
- `GET /api/v1/staking/user/{address}` - Get user stakes
- `POST /api/v1/staking/{id}/claim` - Claim rewards
- `GET /api/v1/staking/market/{id}/insights` - Get market insights

### AI

- `GET /api/v1/ai/prediction/{market_id}` - Get AI prediction
- `GET /api/v1/ai/recommendation/{market_id}` - Get trading recommendation
- `GET /api/v1/ai/sentiment/{market_id}` - Get market sentiment
- `GET /api/v1/ai/performance` - Get AI performance metrics
- `GET /api/v1/ai/top-opportunities` - Get top trading opportunities
- `POST /api/v1/ai/refresh-prediction/{market_id}` - Refresh AI prediction

### WebSocket

- `WS /ws/{client_id}` - WebSocket connection for real-time updates

## Development with AlgoKit

This project uses AlgoKit for Algorand development. Key features:

### Smart Contract Deployment

```python
from services.algorand import algorand_service

# Deploy market contract
app_id = algorand_service.deploy_market_contract(
    market_id="market_123",
    outcomes=["Yes", "No"],
    end_time=1234567890
)
```

### ASA Creation

```python
# Create outcome tokens
outcome_tokens = algorand_service.create_outcome_tokens(
    market_id="market_123",
    outcomes=["Yes", "No"]
)
# Returns: {"Yes": 12345, "No": 12346}
```

### Transaction Handling

```python
# Send payment
txn_id = algorand_service.send_payment(
    receiver="ALGORAND_ADDRESS",
    amount=1000000,  # 1 ALGO in microAlgos
    note="Payment for market entry"
)
```

## Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=.
```

## Example Usage

### Create a Market

```bash
curl -X POST "http://localhost:8000/api/v1/markets" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Will Bitcoin reach $100k by end of 2025?",
    "description": "Market resolves YES if Bitcoin price reaches $100,000 USD",
    "category": "Cryptocurrency",
    "outcomes": ["Yes", "No"],
    "end_time": "2025-12-31T23:59:59Z",
    "resolution_source": "CoinMarketCap",
    "initial_liquidity": 1000.0,
    "creator_address": "YOUR_ALGORAND_ADDRESS"
  }'
```

### Execute a Trade

```bash
curl -X POST "http://localhost:8000/api/v1/markets/{market_id}/trade" \
  -H "Content-Type: application/json" \
  -d '{
    "trader_address": "YOUR_ALGORAND_ADDRESS",
    "outcome": "Yes",
    "amount": 10.0
  }'
```

### Get AI Prediction

```bash
curl "http://localhost:8000/api/v1/ai/prediction/{market_id}"
```

## Algorand Network Configuration

### TestNet (Recommended for Development)

```env
ALGORAND_NETWORK=testnet
ALGOD_SERVER=https://testnet-api.algonode.cloud
INDEXER_SERVER=https://testnet-idx.algonode.cloud
```

Get free TestNet ALGO from: https://testnet.algoexplorer.io/dispenser

### LocalNet (For Local Development)

```bash
# Start LocalNet using AlgoKit
algokit localnet start

# Configure .env
ALGORAND_NETWORK=localnet
ALGOD_SERVER=http://localhost:4001
INDEXER_SERVER=http://localhost:8980
```

### MainNet (Production Only)

```env
ALGORAND_NETWORK=mainnet
ALGOD_SERVER=https://mainnet-api.algonode.cloud
INDEXER_SERVER=https://mainnet-idx.algonode.cloud
```

## Migration to Database

The current implementation uses in-memory storage. To migrate to PostgreSQL:

1. Update `DATABASE_URL` in `.env`
2. Replace `storage.py` with SQLAlchemy models
3. Add database migrations using Alembic
4. Update routes to use database sessions

## Security Notes

- Never commit `.env` file
- Use environment variables for sensitive data
- In production:
  - Set strong `SECRET_KEY`
  - Configure CORS properly
  - Use HTTPS only
  - Validate all Algorand transactions
  - Implement rate limiting

## Contributing

1. Follow PEP 8 style guide
2. Add type hints to all functions
3. Write docstrings for all public APIs
4. Test all endpoints before committing

## License

MIT License

## Support

For issues and questions:
- GitHub Issues: [Your repo URL]
- Documentation: http://localhost:8000/docs
