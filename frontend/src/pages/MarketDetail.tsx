import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getMarket } from '../services/api';
import { useWallet } from '../hooks/useWallet';
import { microAlgosToAlgos, algosToMicroAlgos } from '../services/algorand';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export default function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const { account, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0);
  const [betAmount, setBetAmount] = useState('');

  const { data: market, isLoading } = useQuery({
    queryKey: ['market', id],
    queryFn: () => getMarket(id!),
    enabled: !!id,
  });

  const tradeMutation = useMutation({
    mutationFn: async ({ outcome, amount }: { outcome: string; amount: number }) => {
      const response = await axios.post(
        `${API_BASE_URL}/markets/${id}/trade`,
        {
          outcome,
          amount: algosToMicroAlgos(amount),
          trader_address: account?.address,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Refresh market data
      queryClient.invalidateQueries({ queryKey: ['market', id] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      // Clear form
      setBetAmount('');
      alert('Trade executed successfully!');
    },
    onError: (error: any) => {
      console.error('Trade failed:', error);
      alert(error.response?.data?.detail || 'Trade failed. Please try again.');
    },
  });

  const handleTrade = async () => {
    if (!isConnected || !account || !market) {
      alert('Please connect your wallet');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > microAlgosToAlgos(account.balance)) {
      alert('Insufficient balance');
      return;
    }

    // Determine outcome name based on selection
    const outcomeName = selectedOutcome === 0 ? market.outcomeAName : market.outcomeBName;

    tradeMutation.mutate({ outcome: outcomeName, amount });
  };

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="card text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Market not found</h3>
        <p className="text-gray-600">This market does not exist or has been removed.</p>
      </div>
    );
  }

  const outcomeAPercent = market.outcomeAPrice ? Math.round(market.outcomeAPrice * 100) : 50;
  const outcomeBPercent = 100 - outcomeAPercent;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Market Header */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex-1 pr-4">
              {market.title}
            </h1>
            {market.isResolved ? (
              <span className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-full flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Resolved</span>
              </span>
            ) : (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-full">
                Active
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{market.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-500">Total Volume</div>
              <div className="text-xl font-bold text-gray-900">
                {market.totalVolume 
                  ? `${microAlgosToAlgos(market.totalVolume).toFixed(2)} ALGO`
                  : '0 ALGO'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Resolution</div>
              <div className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>
                  {market.resolutionTime
                    ? formatDistanceToNow(new Date(market.resolutionTime), { addSuffix: true })
                    : 'TBD'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">App ID</div>
              <div className="text-xl font-bold text-gray-900">
                #{market.appId}
              </div>
            </div>
          </div>
        </div>

        {/* Outcomes */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Outcomes</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-900">{market.outcomeAName}</span>
                <span className="text-2xl font-bold text-algorand">{outcomeAPercent}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3">
                <div
                  className="bg-algorand h-3 rounded-full transition-all duration-300"
                  style={{ width: `${outcomeAPercent}%` }}
                />
              </div>
              {market.outcomeASupply && (
                <div className="text-sm text-gray-600 mt-2">
                  Supply: {microAlgosToAlgos(market.outcomeASupply).toFixed(2)} tokens
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-900">{market.outcomeBName}</span>
                <span className="text-2xl font-bold text-blue-600">{outcomeBPercent}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${outcomeBPercent}%` }}
                />
              </div>
              {market.outcomeBSupply && (
                <div className="text-sm text-gray-600 mt-2">
                  Supply: {microAlgosToAlgos(market.outcomeBSupply).toFixed(2)} tokens
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trading Sidebar */}
      <div className="lg:col-span-1">
        <div className="card sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Place Bet</h2>

          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Connect your wallet to trade</p>
            </div>
          ) : market.isResolved ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">This market has been resolved</p>
              {market.winningOutcome !== null && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Winning Outcome:</div>
                  <div className="text-lg font-bold text-green-600">
                    {market.winningOutcome === 0 ? market.outcomeAName : market.outcomeBName}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Outcome Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Outcome
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedOutcome(0)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors ${
                      selectedOutcome === 0
                        ? 'border-algorand bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{market.outcomeAName}</span>
                      <span className="text-algorand font-bold">{outcomeAPercent}%</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedOutcome(1)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors ${
                      selectedOutcome === 1
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{market.outcomeBName}</span>
                      <span className="text-blue-600 font-bold">{outcomeBPercent}%</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bet Amount (ALGO)
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.1"
                  className="input"
                />
                {account && (
                  <div className="text-sm text-gray-500 mt-1">
                    Balance: {microAlgosToAlgos(account.balance).toFixed(2)} ALGO
                  </div>
                )}
              </div>

              {/* Estimated Returns */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Bet Amount:</span>
                    <span className="font-medium">{parseFloat(betAmount).toFixed(2)} ALGO</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Potential Return:</span>
                    <span className="font-medium text-algorand">
                      {selectedOutcome === 0
                        ? (parseFloat(betAmount) / (outcomeAPercent / 100)).toFixed(2)
                        : (parseFloat(betAmount) / (outcomeBPercent / 100)).toFixed(2)} ALGO
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Potential Profit:</span>
                    <span className="font-medium text-green-600">
                      +{(selectedOutcome === 0
                        ? (parseFloat(betAmount) / (outcomeAPercent / 100)) - parseFloat(betAmount)
                        : (parseFloat(betAmount) / (outcomeBPercent / 100)) - parseFloat(betAmount)
                      ).toFixed(2)} ALGO
                    </span>
                  </div>
                </div>
              )}

              {/* Trade Button */}
              <button
                onClick={handleTrade}
                disabled={tradeMutation.isPending || !betAmount || parseFloat(betAmount) <= 0}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tradeMutation.isPending ? 'Processing...' : 'Place Bet'}
              </button>

              {tradeMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  Trade failed. Please try again.
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                Transactions are secured by the Algorand blockchain
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
