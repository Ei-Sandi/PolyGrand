import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Trophy } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { getUserPositions, getUserTrades } from '../services/api';
import { microAlgosToAlgos } from '../services/algorand';
import { formatDistanceToNow } from 'date-fns';

export default function Profile() {
  const { account, isConnected } = useWallet();

  const { data: positions } = useQuery({
    queryKey: ['positions', account?.address],
    queryFn: () => getUserPositions(account!.address),
    enabled: !!account,
  });

  const { data: trades } = useQuery({
    queryKey: ['trades', account?.address],
    queryFn: () => getUserTrades(account!.address),
    enabled: !!account,
  });

  if (!isConnected || !account) {
    return (
      <div className="card text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600">Connect your wallet to view your profile and positions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600 mb-6">
          {account.address.slice(0, 10)}...{account.address.slice(-8)}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {microAlgosToAlgos(account.balance).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">ALGO Balance</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {positions?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Active Positions</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {trades?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Trades</div>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Positions</h2>
        
        {positions && positions.length > 0 ? (
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">Market #{position.marketId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Value</div>
                    <div className="font-bold text-gray-900">
                      {microAlgosToAlgos(position.outcomeABalance + position.outcomeBBalance).toFixed(2)} tokens
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Outcome A</div>
                    <div className="font-medium">{microAlgosToAlgos(position.outcomeABalance).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Outcome B</div>
                    <div className="font-medium">{microAlgosToAlgos(position.outcomeBBalance).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No active positions
          </div>
        )}
      </div>

      {/* Trade History */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trade History</h2>
        
        {trades && trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Market</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Outcome</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tokens</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm">#{trade.marketId}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        trade.outcome === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {trade.outcome === 0 ? 'A' : 'B'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {microAlgosToAlgos(trade.amount).toFixed(2)} ALGO
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {microAlgosToAlgos(trade.tokens).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600">
                      {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No trade history
          </div>
        )}
      </div>
    </div>
  );
}
