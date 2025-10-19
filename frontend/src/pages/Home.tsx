import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, PlusCircle, ArrowRight } from 'lucide-react';
import { getMarkets, getPlatformStats } from '../services/api';
import MarketCard from '../components/MarketCard';
import { microAlgosToAlgos } from '../services/algorand';

export default function Home() {
  console.log('Home component rendering');
  
  const { data: markets, isLoading, error: marketsError } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarkets,
    retry: false,
  });

  const { data: stats, error: statsError } = useQuery({
    queryKey: ['stats'],
    queryFn: getPlatformStats,
    retry: false,
  });

  console.log('Markets:', markets, 'Error:', marketsError);
  console.log('Stats:', stats, 'Error:', statsError);

  // Show only first 6 markets on home page
  const featuredMarkets = markets?.slice(0, 6) || [];

  if (marketsError || statsError) {
    console.error('API Errors:', { marketsError, statsError });
  }

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
          <Link to="/markets" className="btn btn-primary flex items-center space-x-2 shadow-lg">
            <TrendingUp className="w-5 h-5" />
            <span>Browse Markets</span>
          </Link>
          <Link to="/create" className="btn btn-secondary flex items-center space-x-2 shadow-lg">
            <PlusCircle className="w-5 h-5" />
            <span>Create Market</span>
          </Link>
        </div>
      </div>

      {/* Platform Stats */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Platform Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-4xl font-bold text-algorand mb-2">{stats?.totalMarkets || 0}</div>
            <div className="text-gray-600">Total Markets</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-algorand mb-2">
              {stats?.totalVolume ? `${microAlgosToAlgos(stats.totalVolume).toFixed(0)}` : '0'}
            </div>
            <div className="text-gray-600">Total Volume (ALGO)</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-algorand mb-2">{stats?.activeUsers || 0}</div>
            <div className="text-gray-600">Active Traders</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-algorand mb-2">{stats?.resolvedMarkets || 0}</div>
            <div className="text-gray-600">Resolved Markets</div>
          </div>
        </div>
      </div>

      {/* Featured Markets */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Featured Markets</h2>
          <Link to="/markets" className="text-algorand hover:text-algorand-dark flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : featuredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No markets yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create a prediction market!</p>
            <Link to="/create" className="btn btn-primary inline-flex items-center space-x-2">
              <PlusCircle className="w-5 h-5" />
              <span>Create First Market</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
