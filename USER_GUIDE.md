# PolyGrand User Guide 🎯

## Overview
PolyGrand is a decentralized prediction market platform built on Algorand. Users can create markets, trade on outcomes, and earn rewards for accurate predictions.

## Features Implemented ✅

### 1. **Home Page** (`/`)
- Platform statistics dashboard
- Featured markets showcase
- Quick navigation to browse markets or create new ones
- Real-time metrics:
  - Total Markets
  - Total Volume (ALGO)
  - Active Traders
  - Resolved Markets

### 2. **Browse Markets** (`/markets`)
- View all available prediction markets
- **Search functionality**: Find markets by title or description
- **Filter options**:
  - All Markets
  - Active (currently trading)
  - Resolved (completed)
- Market cards display:
  - Title and description
  - Current YES/NO probabilities
  - Visual probability bars
  - Total volume
  - Time until resolution
  - Market status (Active/Resolved)

### 3. **Create Market** (`/create`)
Complete market creation interface with:

**Required Fields:**
- **Market Title**: Clear, concise question (e.g., "Will Bitcoin reach $100,000 by end of 2024?")
- **Description**: Detailed context and resolution criteria
- **Category**: Politics, Crypto, Sports, Finance, Technology, Entertainment, Other
- **Resolution Date**: When the market will be resolved
- **Outcomes**: 2-10 possible outcomes (default: 2 for YES/NO markets)
- **Initial Liquidity**: ALGO amount to bootstrap trading (minimum 1 ALGO)

**Features:**
- Wallet connection required
- Balance verification
- Dynamic outcome management (add/remove)
- Fee estimation display
- Form validation
- Character limits for inputs

### 4. **Market Detail & Trading** (`/markets/:id`)
Full trading interface for each market:

**Market Information:**
- Full title and description
- Current status (Active/Resolved)
- Total volume traded
- Time until resolution
- Smart contract App ID

**Outcome Display:**
- Visual probability bars for each outcome
- Current percentage odds
- Token supply information
- Real-time price updates

**Trading Panel:**
- **Outcome Selection**: Choose YES or NO (or custom outcomes)
- **Amount Input**: Enter ALGO amount to bet
- **Balance Display**: Current wallet balance
- **Estimated Returns Calculator**:
  - Shows bet amount
  - Calculates potential return
  - Displays potential profit
- **Trade Execution**: One-click betting with wallet signature
- **Transaction Status**: Real-time feedback on trade execution

**For Resolved Markets:**
- Display winning outcome
- Claim winnings functionality
- Historical data

### 5. **User Profile** (`/profile`)
Personal trading dashboard:
- Wallet address display
- ALGO balance
- Active positions across markets
- Trading history
- Performance metrics

### 6. **Navigation & Layout**
Professional layout with:
- Responsive navigation bar
- Logo and branding
- Quick access to all sections:
  - Home
  - Markets
  - Create Market
  - Profile
- **Wallet Connection**:
  - Connect/Disconnect button
  - Balance display
  - Address display with truncation
  - Connection status indicator
- Mobile-responsive menu
- Sticky navigation

## How to Use PolyGrand

### Getting Started

1. **Start the Application**
   ```bash
   ./start.sh
   ```
   This will start both:
   - Backend API: http://localhost:8000
   - Frontend App: http://localhost:3000

2. **Access the Platform**
   - Open http://localhost:3000 in your browser
   - You'll see the home page with platform statistics

### Creating a Market

1. **Navigate to Create Market**
   - Click "Create Market" in the navigation bar or on the home page

2. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Approve the Pera Wallet connection
   - Ensure you have at least 1.1 ALGO (1 for liquidity + 0.1 for fees)

3. **Fill Out Market Details**
   - Enter a clear, specific question as the title
   - Provide detailed description with resolution criteria
   - Select appropriate category
   - Set resolution date (must be in the future)
   - Define outcomes (default YES/NO, or customize)
   - Set initial liquidity (minimum 1 ALGO)

4. **Review & Submit**
   - Check the fee breakdown
   - Click "Create Market"
   - Sign the transaction in your wallet
   - Wait for blockchain confirmation

5. **Success!**
   - You'll be redirected to your new market
   - Market is now live and tradable

### Trading on Markets

1. **Find a Market**
   - Browse from home page featured markets
   - Or go to "Markets" to see all markets
   - Use search to find specific topics
   - Filter by status (Active/Resolved)

2. **View Market Details**
   - Click on any market card
   - Review the question and description
   - Check current probability odds
   - See total volume and resolution time

3. **Connect Wallet** (if not already connected)
   - Click "Connect Wallet" in the top right
   - Approve connection in Pera Wallet

4. **Place a Bet**
   - Select your outcome (YES or NO)
   - Enter amount in ALGO
   - Review estimated returns:
     - Shows potential total return
     - Calculates profit
   - Click "Place Bet"
   - Sign transaction in wallet

5. **Track Your Position**
   - Go to Profile to see all your positions
   - View your active bets
   - Check trading history

### Browsing & Searching

1. **Search Markets**
   - On the Markets page, use the search bar
   - Type keywords from title or description
   - Results update in real-time

2. **Filter Markets**
   - Use the dropdown filter
   - Select "Active" for tradable markets
   - Select "Resolved" for completed markets
   - Select "All" to see everything

3. **Market Information**
   - Each card shows:
     - Title and description preview
     - Current YES/NO percentages
     - Visual probability bars
     - Trading volume
     - Time until resolution

### Viewing Your Profile

1. **Navigate to Profile**
   - Click "Profile" in navigation bar
   - Must be connected to view

2. **Dashboard Shows**
   - Your wallet address
   - Current ALGO balance
   - Active positions in markets
   - Trading history
   - Performance statistics

## Technical Details

### Frontend Architecture
- **Framework**: React 19 + TypeScript
- **Routing**: React Router v7
- **State Management**: 
  - React Query for server state
  - Zustand for wallet state
- **Styling**: Tailwind CSS
- **Wallet**: Pera Wallet Connect
- **Blockchain**: Algorand SDK

### API Endpoints Used
- `GET /api/v1/markets/` - List all markets
- `GET /api/v1/markets/:id` - Get market details
- `POST /api/v1/markets/` - Create new market
- `POST /api/v1/markets/:id/trade` - Execute trade
- `GET /api/v1/stats/platform` - Platform statistics

### Key Components
- `Home.tsx` - Landing page with stats and featured markets
- `Markets.tsx` - Full market listing with search/filter
- `MarketDetail.tsx` - Individual market view and trading
- `CreateMarket.tsx` - Market creation form
- `MarketCard.tsx` - Reusable market display component
- `Layout.tsx` - Navigation and wallet integration
- `Profile.tsx` - User dashboard

### Trading Logic
- Uses Automated Market Maker (AMM) pricing
- Prices adjust based on trading volume
- Outcomes are represented as tokens (ASAs)
- Trades are executed as Algorand transactions
- Wallet signature required for all transactions

## Tips for Best Experience

1. **Wallet Balance**: Always keep at least 1 ALGO in your wallet for transaction fees
2. **Market Research**: Read market descriptions carefully before trading
3. **Resolution Time**: Check when markets resolve before placing bets
4. **Start Small**: Test with small amounts first to understand the platform
5. **Network**: Ensure you're on Algorand TestNet for testing

## Troubleshooting

### "Address already in use" Error
```bash
# Kill process on port 8000
lsof -i :8000 | grep LISTEN
kill <PID>
# Then restart with ./start.sh
```

### Wallet Won't Connect
- Ensure Pera Wallet extension is installed
- Check you're on the correct network (TestNet)
- Try refreshing the page

### Market Not Loading
- Check your internet connection
- Verify backend is running on port 8000
- Check browser console for errors

### Trade Failing
- Ensure sufficient ALGO balance
- Check market is still active
- Verify wallet is connected
- Try reducing trade amount

## Summary

You now have a fully functional Polymarket-style prediction market platform with:
- ✅ Market creation with custom outcomes
- ✅ Comprehensive market browsing with search/filter
- ✅ Full trading interface with YES/NO betting
- ✅ Real-time probability display
- ✅ Wallet integration with Pera Wallet
- ✅ User profiles and trading history
- ✅ Responsive design for mobile and desktop
- ✅ Professional UI with Tailwind CSS

All features are integrated with your Algorand backend and ready to use! 🚀
