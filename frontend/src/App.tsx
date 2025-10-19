import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, type ReactNode } from 'react';
import { useWallet } from './hooks/useWallet';
import { getMarkets, createMarket as createMarketApi, getPlatformStats } from './services/api';
import MarketDetail from './pages/MarketDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Wallet Connect Modal Component (simulates Pera Wallet)
function WalletModal({ isOpen, onClose, onConnect }: { isOpen: boolean; onClose: () => void; onConnect: () => Promise<void> }) {
  if (!isOpen) return null;

  const handleWalletClick = async (walletType: 'mobile' | 'web') => {
    console.log(`Connecting via Pera Wallet ${walletType}...`);
    onClose(); // Close modal immediately when user clicks
    await onConnect(); // Then connect in background
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🥑</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pera Wallet</h2>
          <p className="text-gray-600 text-sm">Connect your Algorand wallet</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleWalletClick('mobile')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-xl">📱</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Pera Wallet Mobile</div>
                <div className="text-xs text-gray-500">Scan QR with mobile app</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleWalletClick('web')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-xl">💻</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Pera Wallet Web</div>
                <div className="text-xs text-gray-500">Connect with browser extension</div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <span>🔒</span>
          <span>Secure connection • Mock Demo Mode</span>
        </div>
      </div>
    </div>
  );
}

// Wallet Connect Button Component
function WalletButton() {
  const { account, isConnected, isConnecting, error, showModal, connect, disconnect, setShowModal, connectWallet } = useWallet();

  const handleOpenModal = () => {
    connect(); // Just opens the modal
  };

  const handleConnect = async () => {
    try {
      await connectWallet(); // Actually connects after user clicks wallet type
    } catch (error) {
      console.error('Connection error:', error);
      setShowModal(false);
    }
  };

  if (isConnecting) {
    return (
      <>
        <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onConnect={handleConnect} />
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed flex items-center space-x-2"
        >
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </button>
      </>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-3">
        <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <span className="text-green-500">●</span>
            <span>{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {account.balance.toFixed(2)} ALGO
          </div>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onConnect={handleConnect} />
      <button
        onClick={handleOpenModal}
        className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
      >
        <span>🔗</span>
        <span>Connect Wallet</span>
      </button>
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm max-w-xs z-10">
          {error}
        </div>
      )}
    </div>
  );
}

// Simple Layout
function SimpleLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { initializeWallet, reconnectSession } = useWallet();

  useEffect(() => {
    // Initialize wallet on mount
    initializeWallet();
    
    // Try to reconnect to existing session
    reconnectSession();
  }, [initializeWallet, reconnectSession]);
  
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
            
            <div className="flex items-center space-x-4">
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
              
              <div className="border-l border-gray-300 pl-4 relative">
                <WalletButton />
              </div>
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
function MarketCard({ market }: { market: any }) {
  const yesPrice = market.outcomeAPrice || 0.5;
  const noPrice = market.outcomeBPrice || 0.5;
  const volume = market.totalVolume || 0;
  const endDate = market.resolutionTime ? new Date(market.resolutionTime).toISOString().split('T')[0] : 'TBD';
  
  return (
    <Link to={`/markets/${market.id}`}>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
            {market.title}
          </h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {market.isResolved ? 'Resolved' : 'Active'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {market.description}
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">{market.outcomeAName || 'YES'}</span>
              <span className="text-green-600 font-bold">{Math.round(yesPrice * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${yesPrice * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">{market.outcomeBName || 'NO'}</span>
              <span className="text-blue-600 font-bold">{Math.round(noPrice * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${noPrice * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <span>📊</span>
            <span>${(volume / 1000).toFixed(1)}K volume</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⏰</span>
            <span>Ends {endDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Home Page
function HomePage() {
  const { data: markets = [], isLoading: marketsLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarkets,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['platformStats'],
    queryFn: getPlatformStats,
  });

  const featuredMarkets = markets.slice(0, 3);

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
        {statsLoading ? (
          <div className="text-center text-gray-500">Loading stats...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">{stats?.totalMarkets || 0}</div>
              <div className="text-gray-600">Active Markets</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">${((stats?.totalVolume || 0) / 1000).toFixed(0)}K</div>
              <div className="text-gray-600">Total Volume</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">{stats?.activeUsers || 0}</div>
              <div className="text-gray-600">Active Traders</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">{stats?.resolvedMarkets || 0}</div>
              <div className="text-gray-600">Resolved Markets</div>
            </div>
          </div>
        )}
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
        
        {marketsLoading ? (
          <div className="text-center text-gray-500 py-12">Loading markets...</div>
        ) : featuredMarkets.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No markets available yet. Create one!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Markets Page
function MarketsPage() {
  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarkets,
  });

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
          {isLoading ? 'Loading...' : `Showing ${markets.length} markets`}
        </div>
        {isLoading ? (
          <div className="text-center text-gray-500 py-12">Loading markets...</div>
        ) : markets.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl mb-4">No markets available yet</p>
            <Link to="/create" className="text-green-500 hover:text-green-600 font-medium">
              Create the first market →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Market Detail Page
function MarketDetailPage() {
  const { id } = useParams();
  const { data: markets = [] } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarkets,
  });
  
  const market = markets.find(m => m.id.toString() === id);

  if (!market) {
    return (
      <div className="card text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Market not found</h3>
        <p className="text-gray-600 mb-4">This market does not exist or is still loading.</p>
        <Link to="/markets" className="text-green-500 hover:text-green-600">← Back to Markets</Link>
      </div>
    );
  }

  const yesPrice = market.outcomeAPrice || 0.5;
  const noPrice = market.outcomeBPrice || 0.5;
  const volume = market.totalVolume || 0;
  const endDate = market.resolutionTime ? new Date(market.resolutionTime).toISOString().split('T')[0] : 'TBD';

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/markets" className="text-green-500 hover:text-green-600 mb-4 inline-block">← Back to Markets</Link>
      
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex-1 pr-4">
            {market.title}
          </h1>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-full">
            {market.isResolved ? 'Resolved' : 'Active'}
          </span>
        </div>

        <p className="text-gray-600 mb-8">{market.description}</p>

        <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-gray-200">
          <div>
            <div className="text-sm text-gray-500">Total Volume</div>
            <div className="text-2xl font-bold text-gray-900">${(volume / 1000).toFixed(1)}K</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Category</div>
            <div className="text-2xl font-bold text-gray-900">{market.category}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Ends</div>
            <div className="text-2xl font-bold text-gray-900">{endDate}</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Odds</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-900">{market.outcomeAName || 'YES'}</span>
              <span className="text-2xl font-bold text-green-600">{Math.round(yesPrice * 100)}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${yesPrice * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-900">{market.outcomeBName || 'NO'}</span>
              <span className="text-2xl font-bold text-blue-600">{Math.round(noPrice * 100)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${noPrice * 100}%` }}
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
  const { isConnected, account } = useWallet();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    question: '',
    description: '',
    category: 'Crypto',
    endDate: '',
    initialLiquidity: 100,
    resolutionSource: 'Official sources and credible reports',
    outcomes: ['Yes', 'No']
  });

  const createMarketMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        question: data.question,
        description: data.description,
        category: data.category,
        outcomes: data.outcomes,
        end_time: new Date(data.endDate).toISOString(),
        resolution_source: data.resolutionSource,
        initial_liquidity: data.initialLiquidity,
        creator_address: account?.address || 'UNKNOWN',
      };
      return createMarketApi(payload);
    },
    onSuccess: () => {
      // Invalidate markets query to refetch
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['platformStats'] });
      
      // Redirect to markets page after 2 seconds
      setTimeout(() => {
        navigate('/markets');
      }, 2000);
    },
    onError: (error) => {
      console.error('Failed to create market:', error);
      alert('Failed to create market. Please try again.');
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    createMarketMutation.mutate(formData);
  };

  // If not connected, show wallet prompt
  if (!isConnected) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-12 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Wallet Required</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You need to connect your wallet to create a prediction market. Connect your Pera Wallet to get started.
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  // Success state
  if (createMarketMutation.isSuccess) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-12 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Market Created!</h1>
          <p className="text-gray-600 mb-4">
            Your prediction market has been successfully created and deployed to the blockchain.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to markets page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create a Market</h1>
        <p className="text-gray-600">Set up your prediction market in a few simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-green-500' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Question</span>
          </div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-500' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Details</span>
          </div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className={`flex items-center ${step >= 3 ? 'text-green-500' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Review</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        {/* Step 1: Market Question */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Question *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                placeholder="e.g., Will Bitcoin reach $100,000 by end of 2025?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                Ask a clear yes/no question about a future event
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="Crypto">Crypto</option>
                <option value="Technology">Technology</option>
                <option value="Sports">Sports</option>
                <option value="Politics">Politics</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Science">Science</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.question.trim()}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Market Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed resolution criteria. How will this market be resolved?"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Clear resolution criteria help traders make informed decisions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                When should this market be resolved?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Liquidity (ALGO) *
              </label>
              <input
                type="number"
                value={formData.initialLiquidity}
                onChange={(e) => handleInputChange('initialLiquidity', Number(e.target.value))}
                min={10}
                max={10000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Provide liquidity to enable trading (minimum 10 ALGO)
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.description.trim() || !formData.endDate}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Review Your Market</h3>
              <p className="text-sm text-blue-700">
                Please review all details carefully before submitting. Markets cannot be edited after creation.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Question</div>
                <div className="text-lg font-semibold text-gray-900">{formData.question}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Description</div>
                <div className="text-gray-900">{formData.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Category</div>
                  <div className="font-medium text-gray-900">{formData.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Resolution Date</div>
                  <div className="font-medium text-gray-900">{formData.endDate}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Initial Liquidity</div>
                <div className="font-medium text-gray-900">{formData.initialLiquidity} ALGO</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Creator Wallet</div>
                <div className="font-mono text-sm text-gray-900">
                  {account?.address.slice(0, 10)}...{account?.address.slice(-8)}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">💰 Transaction Details</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Initial liquidity: {formData.initialLiquidity} ALGO</li>
                <li>• Platform fee: 0.1 ALGO</li>
                <li>• You'll earn 0.5% fee on all trades</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                disabled={createMarketMutation.isPending}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMarketMutation.isPending}
                className="px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {createMarketMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Market...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Create Market</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="text-2xl mb-2">💎</div>
          <div className="font-semibold text-gray-900 mb-1">Earn Fees</div>
          <div className="text-sm text-gray-600">Earn 0.5% on every trade in your market</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="text-2xl mb-2">🔒</div>
          <div className="font-semibold text-gray-900 mb-1">Secure</div>
          <div className="text-sm text-gray-600">Smart contracts ensure fair resolution</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="text-2xl mb-2">⚡</div>
          <div className="font-semibold text-gray-900 mb-1">Fast</div>
          <div className="text-sm text-gray-600">Algorand enables instant trades</div>
        </div>
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
            <Route path="/markets/:id" element={<MarketDetail />} />
            <Route path="/create" element={<CreateMarketPage />} />
          </Routes>
        </SimpleLayout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

