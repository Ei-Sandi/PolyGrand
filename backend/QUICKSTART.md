# PolyGrand Backend - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Python 3.12+
- pip
- Git

## Installation (3 Steps)

### Step 1: Navigate to Backend

```bash
cd /Users/mmesoma/Desktop/hackathon/PolyGrand/backend
```

### Step 2: Run Setup Script

**macOS/Linux:**
```bash
./run.sh
```

**Windows:**
```bash
run.bat
```

This will:
- Create virtual environment
- Install all dependencies
- Copy `.env.example` to `.env`
- Start the server

### Step 3: Configure Algorand (Optional)

Edit `.env` file with your Algorand credentials:

```bash
# For TestNet (recommended)
ALGORAND_NETWORK=testnet
CREATOR_MNEMONIC=your 25 word mnemonic phrase here
```

Get free TestNet ALGO: https://testnet.algoexplorer.io/dispenser

## Access the API

Once running, access:

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **API Base URL**: http://localhost:8000/api/v1

## Test the API

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "PolyGrand Backend",
  "version": "1.0.0",
  "algorand": "connected"
}
```

### Create a Test Market

```bash
curl -X POST "http://localhost:8000/api/v1/markets" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Will it rain tomorrow?",
    "description": "Market resolves YES if it rains, NO otherwise",
    "category": "Weather",
    "outcomes": ["Yes", "No"],
    "end_time": "2025-10-20T23:59:59Z",
    "resolution_source": "Weather.com",
    "initial_liquidity": 100.0,
    "creator_address": "ALGORAND_ADDRESS_HERE"
  }'
```

### Get All Markets

```bash
curl http://localhost:8000/api/v1/markets
```

### Get AI Prediction

```bash
curl "http://localhost:8000/api/v1/ai/prediction/{market_id}"
```

## Manual Installation (If script fails)

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Run server
python app.py
# OR
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Using Poetry (Alternative)

If you prefer Poetry (already configured in `pyproject.toml`):

```bash
# From project root
cd /Users/mmesoma/Desktop/hackathon/PolyGrand

# Install dependencies
poetry install

# Activate shell
poetry shell

# Run backend
cd backend
python app.py
```

## Common Issues

### 1. Port Already in Use

Change port in `.env`:
```env
API_PORT=8001
```

Or specify when running:
```bash
uvicorn app:app --reload --port 8001
```

### 2. Import Errors

Make sure you're in the backend directory:
```bash
cd backend
python app.py
```

### 3. Algorand Connection Issues

For development without Algorand setup:
- The app will work with mock transactions
- Smart contracts will use placeholder TEAL
- You can still test all API endpoints

To use real Algorand:
1. Get TestNet account: https://testnet.algoexplorer.io
2. Fund with free ALGO: https://testnet.algoexplorer.io/dispenser
3. Add mnemonic to `.env`

## Project Structure

```
backend/
├── app.py                    # Main FastAPI app - START HERE
├── config.py                 # Configuration settings
├── storage.py               # In-memory data storage
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
│
├── models/                 # Data models
│   ├── market.py          # Market model
│   ├── tournament.py      # Tournament model
│   ├── trade.py          # Trade model
│   ├── stake.py          # Stake model
│   └── user.py           # User model
│
├── schemas/               # Request/Response schemas
│   ├── market.py         # Market schemas
│   ├── tournament.py     # Tournament schemas
│   └── stake.py          # Stake schemas
│
├── routes/               # API endpoints
│   ├── markets.py       # Market endpoints
│   ├── tournaments.py   # Tournament endpoints
│   ├── staking.py       # Staking endpoints
│   └── ai.py           # AI endpoints
│
└── services/            # Business logic
    ├── algorand.py     # Algorand blockchain
    ├── ai_service.py   # AI predictions
    └── websocket.py    # Real-time updates
```

## Key Features Ready to Use

1. **Markets API** - Create, trade, resolve markets
2. **Tournaments API** - Competitive prediction tournaments
3. **Staking API** - Stake on insights with reasoning
4. **AI API** - Get predictions and recommendations
5. **WebSocket** - Real-time market updates
6. **Algorand Integration** - Smart contracts & ASAs

## Next Steps

1. Explore API at http://localhost:8000/docs
2. Read [README.md](README.md) for detailed documentation
3. Test endpoints using the interactive docs
4. Connect your frontend to the API
5. Deploy to production when ready

## Support

- Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- API Base: http://localhost:8000/api/v1

## Development Tips

- Use the interactive docs at `/docs` to test endpoints
- Check logs in terminal for debugging
- Use `--reload` flag for auto-reload during development
- All data is in-memory (resets on restart)
- Ready for database migration when needed

Happy building! 🚀
