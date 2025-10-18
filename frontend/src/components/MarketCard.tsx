import { Link } from 'react-router-dom';
import { TrendingUp, Clock } from 'lucide-react';
import type { Market } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface MarketCardProps {
  market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
  const outcomeAPercent = market.outcomeAPrice ? Math.round(market.outcomeAPrice * 100) : 50;
  const outcomeBPercent = 100 - outcomeAPercent;

  return (
    <Link to={`/markets/${market.appId}`} className="block">
      <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
            {market.title}
          </h3>
          {market.isResolved ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Resolved
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Active
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {market.description}
        </p>

        {/* Outcomes */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">{market.outcomeAName}</span>
              <span className="text-algorand font-bold">{outcomeAPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-algorand h-2 rounded-full transition-all duration-300"
                style={{ width: `${outcomeAPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">{market.outcomeBName}</span>
              <span className="text-blue-600 font-bold">{outcomeBPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${outcomeBPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>
              {market.totalVolume 
                ? `${(market.totalVolume / 1_000_000).toFixed(1)}K` 
                : '0'} ALGO
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>
              {market.resolutionTime
                ? `Resolves ${formatDistanceToNow(new Date(market.resolutionTime), { addSuffix: true })}`
                : 'TBD'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
