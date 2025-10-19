import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Dummy market data
const DUMMY_MARKETS = [
  {
    id: 1,
    title: "Will Bitcoin reach $100,000 by end of 2025?",
    description: "Market will resolve YES if Bitcoin (BTC/USD) reaches or exceeds $100,000 at any point before December 31, 2025 11:59 PM UTC.",
    category: "Crypto",
    yesPrice: 0.67,
    noPrice: 0.33,
    volume: 45230,
    endDate: "2025-12-31",
    status: "active"
  },
  {
    id: 2,
    title: "Will AI replace 10% of jobs by 2026?",
    description: "Resolves YES if credible studies show that AI has directly replaced at least 10% of total global employment by end of 2026.",
    category: "Technology",
    yesPrice: 0.42,
    noPrice: 0.58,
    volume: 32100,
    endDate: "2026-12-31",
    status: "active"
  },
  {
    id: 3,
    title: "Will SpaceX land on Mars before 2030?",
    description: "Market resolves YES if SpaceX successfully lands a spacecraft on Mars with humans on board before January 1, 2030.",
    category: "Space",
    yesPrice: 0.28,
    noPrice: 0.72,
    volume: 67890,
    endDate: "2029-12-31",
    status: "active"
  }
];

// Simple Layout
function SimpleLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PolyGrand</span>
            </Link>
            
            <div className="flex items-center space-x-1">
              <Link to="/" className={`px-4 py-2 rounded-lg font-medium transition-colors ${location.pathname === '/' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Home
              </Link>
              <Link to="/markets" className={`px-4 py-2 rounded-lg font-medium transition-colors ${location.pathname === '/markets' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Markets
              </Link>
              <Link to="/create" className={`px-4 py-2 rounded-lg font-medium transition-colors ${location.pathname === '/create' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Create
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

// Market Card Component
function MarketCard({ market }: { market: typeof DUMMY_MARKETS[0] }) {
  return (
    <Link to={`/markets/${market.id}`}>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
            {market.title}
          </h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {market.status === 'active' ? 'Active' : 'Closed'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {market.description}
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">YES</span>
              <span className="text-green-600 font-bold">{Math.round(market.yesPrice * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${market.yesPrice * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">NO</span>
              <span className="text-blue-600 font-bold">{Math.round(market.noPrice * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${market.noPrice * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <span>📊</span>
            <span>${(market.volume / 1000).toFixed(1)}K volume</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⏰</span>
            <span>Ends {market.endDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Home Page
function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Predict. Trade. Win.
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Decentralized prediction markets on Algorand. Trade on future events and earn rewards for accurate predictions.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/markets" className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-lg">
            Browse Markets
          </Link>
          <Link to="/create" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Create Market
          </Link>
        </div>
      </div>

      {/* Platform Stats */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Platform Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">3</div>
            <div className="text-gray-600">Active Markets</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">$145K</div>
            <div className="text-gray-600">Total Volume</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">1.2K</div>
            <div className="text-gray-600">Active Traders</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">0</div>
            <div className="text-gray-600">Resolved Markets</div>
          </div>
        </div>
      </div>

      {/* Featured Markets */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Featured Markets</h2>
          <Link to="/markets" className="text-green-500 hover:text-green-600 flex items-center space-x-1 font-medium">
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_MARKETS.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Markets Page
function MarketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Prediction Markets</h1>
        <p className="text-gray-600">Browse and trade on active prediction markets</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search markets..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
          <option value="all">All Markets</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div>
        <div className="text-sm text-gray-600 mb-4">
          Showing {DUMMY_MARKETS.length} markets
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_MARKETS.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Market Detail Page
function MarketDetailPage() {
  const { id } = useParams();
  const market = DUMMY_MARKETS.find(m => m.id === Number(id));

  if (!market) {
    return (
      <div className="card text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Market not found</h3>
        <p className="text-gray-600 mb-4">This market does not exist.</p>
        <Link to="/markets" className="text-green-500 hover:text-green-600">← Back to Markets</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/markets" className="text-green-500 hover:text-green-600 mb-4 inline-block">← Back to Markets</Link>
      
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex-1 pr-4">
            {market.title}
          </h1>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-full">
            Active
          </span>
        </div>

        <p className="text-gray-600 mb-8">{market.description}</p>

        <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-gray-200">
          <div>
            <div className="text-sm text-gray-500">Total Volume</div>
            <div className="text-2xl font-bold text-gray-900">${(market.volume / 1000).toFixed(1)}K</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Category</div>
            <div className="text-2xl font-bold text-gray-900">{market.category}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Ends</div>
            <div className="text-2xl font-bold text-gray-900">{market.endDate}</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Odds</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-900">YES</span>
              <span className="text-2xl font-bold text-green-600">{Math.round(market.yesPrice * 100)}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${market.yesPrice * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-900">NO</span>
              <span className="text-2xl font-bold text-blue-600">{Math.round(market.noPrice * 100)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${market.noPrice * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">Connect wallet to place bets (feature coming soon)</p>
        </div>
      </div>
    </div>
  );
}

// Create Market Page
function CreateMarketPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Market</h1>
        <p className="text-gray-600 mb-4">
          Create your own prediction market and earn fees from trading activity.
        </p>
        <p className="text-sm text-gray-500">
          Note: Wallet connection required. This feature will be available once wallet integration is complete.
        </p>
      </div>
    </div>
  );
}

function App() {
  console.log('=== PolyGrand App Starting ===');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SimpleLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/markets/:id" element={<MarketDetailPage />} />
            <Route path="/create" element={<CreateMarketPage />} />
          </Routes>
        </SimpleLayout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

