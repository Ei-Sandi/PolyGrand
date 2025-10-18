# PolyGrand Frontend

Modern React + TypeScript frontend for the PolyGrand prediction market platform on Algorand.

## 🚀 Features

- **Wallet Integration**: Seamless connection with Pera Wallet
- **Market Discovery**: Browse and search prediction markets
- **Trading Interface**: Buy outcome tokens with real-time pricing
- **Portfolio Management**: Track positions and trading history
- **Market Creation**: Launch your own prediction markets
- **Responsive Design**: Beautiful UI with TailwindCSS

## 🛠 Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS 3
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Blockchain**: Algorand SDK + Pera Wallet
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Algorand wallet (Pera Wallet recommended)
- Backend API running (see `/backend`)

## 🔧 Installation

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
   VITE_NETWORK=testnet
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   App will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   └── MarketCard.tsx  # Market preview cards
├── pages/              # Route pages
│   ├── Home.tsx        # Landing page
│   ├── Markets.tsx     # Market browsing
│   ├── MarketDetail.tsx # Trading interface
│   ├── Profile.tsx     # User portfolio
│   └── CreateMarket.tsx # Market creation
├── hooks/              # Custom React hooks
│   └── useWallet.ts    # Wallet connection logic
├── services/           # External integrations
│   ├── api.ts          # Backend API client
│   └── algorand.ts     # Algorand SDK wrapper
├── types/              # TypeScript definitions
│   └── index.ts        # All type definitions
├── config/             # Configuration
│   └── constants.ts    # App constants
├── App.tsx             # Root component with routing
├── main.tsx            # App entry point
└── index.css           # Global styles + Tailwind
```

## 🎨 Key Pages

### Home (`/`)
- Platform statistics
- Featured markets
- Call-to-action for wallet connection

### Markets (`/markets`)
- Browse all markets
- Search and filter
- Category navigation

### Market Detail (`/markets/:id`)
- Market information
- Outcome pricing
- Trading interface
- Buy outcome tokens

### Profile (`/profile`)
- Wallet balance
- Active positions
- Trading history
- Portfolio analytics

### Create Market (`/create`)
- Market creation form
- Outcome configuration
- Initial liquidity setup
- Resolution date setting

## 🔌 Wallet Integration

The app uses Pera Wallet for Algorand integration:

```typescript
import { useWallet } from './hooks/useWallet';

function Component() {
  const { connect, disconnect, account, isConnected } = useWallet();
  
  return (
    <button onClick={isConnected ? disconnect : connect}>
      {isConnected ? `Connected: ${account.address}` : 'Connect Wallet'}
    </button>
  );
}
```

## 🔗 API Integration

Backend API client with React Query:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getMarkets } from './services/api';

function Markets() {
  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarkets,
  });
  
  return <div>{markets?.map(m => <MarketCard market={m} />)}</div>;
}
```

## 🎯 Trading Flow

1. **Connect Wallet**: Click "Connect Wallet" and approve in Pera Wallet
2. **Browse Markets**: Navigate to /markets and find interesting predictions
3. **Select Outcome**: Choose which outcome you believe will occur
4. **Enter Amount**: Specify how much ALGO to bet
5. **Confirm Trade**: Review estimated tokens and confirm transaction
6. **Sign Transaction**: Approve in Pera Wallet
7. **Track Position**: View your holdings in /profile

## 🏗 Building for Production

```bash
npm run build
```

Outputs to `dist/` directory. Deploy to any static hosting (Vercel, Netlify, etc.)

## 🐛 Known Issues

- WalletConnect v1 vulnerabilities (using --legacy-peer-deps)
- Backend API returns mock data until implemented
- Some TypeScript lint warnings (cosmetic only)

## 🚧 TODO

- [ ] Real-time market updates via WebSocket
- [ ] Advanced charting with historical data
- [ ] Social features (comments, sharing)
- [ ] Portfolio analytics and ROI tracking
- [ ] Mobile app with React Native
- [ ] Market resolution interface
- [ ] Liquidity provider functionality

## 📚 Resources

- [Algorand Developer Docs](https://developer.algorand.org/)
- [Pera Wallet SDK](https://github.com/perawallet/pera-web-wallet)
- [React Query Docs](https://tanstack.com/query/latest)
- [TailwindCSS](https://tailwindcss.com/)

---

**PolyGrand** - Democratizing Prediction Markets on Algorand 🚀
