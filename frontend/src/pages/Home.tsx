import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, DollarSign, Trophy } from 'lucide-react';
import { getMarkets, getPlatformStats } from '../services/api';
import MarketCard from '../components/MarketCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const { data: markets, isLoading: marketsLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarkets,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getPlatformStats,
  });

  const featuredMarkets = markets?.slice(0, 3);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-8 px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Predict. Trade. <span className="text-algorand">Win.</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Next-generation prediction markets built on Algorand. 
          100x cheaper, 3x faster than Ethereum-based platforms.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link to="/markets" className="btn btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-shadow">
            Browse Markets
          </Link>
          <Link to="/create" className="btn btn-secondary px-8 py-3 text-lg shadow-md hover:shadow-lg transition-shadow">
            Create Market
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center hover:shadow-lg transition-shadow">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            {stats?.totalMarkets || 0}
          </div>
          <div className="text-sm text-gray-600">Total Markets</div>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${stats?.totalVolume ? (stats.totalVolume / 1_000_000).toFixed(1) : 0}M
          </div>
          <div className="text-sm text-gray-600">Total Volume</div>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.activeUsers || 0}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.resolvedMarkets || 0}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Featured Markets */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Featured Markets</h2>
          <Link to="/markets" className="text-algorand hover:text-algorand-dark font-medium">
            View all →
          </Link>
        </div>

        {marketsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMarkets?.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}

        {!marketsLoading && (!featuredMarkets || featuredMarkets.length === 0) && (
          <div className="card text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No markets yet</h3>
            <p className="text-gray-600 mb-4">Be the first to create a prediction market!</p>
            <Link to="/create" className="btn btn-primary">
              Create Market
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Why PolyGrand?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">100x Cheaper</h3>
            <p className="text-gray-600">
              $0.0002 transactions vs. $2-50 on Ethereum. Enable micro-predictions.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">3x Faster</h3>
            <p className="text-gray-600">
              4.5 second finality vs. 15+ seconds. Instant trading experience.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2">Carbon Neutral</h3>
            <p className="text-gray-600">
              2500x more energy efficient than Ethereum. Sustainable predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
