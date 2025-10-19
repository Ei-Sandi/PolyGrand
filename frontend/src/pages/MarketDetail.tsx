import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { getMarket, executeTrade } from '../services/api';
import { useWallet } from '../hooks/useWallet';
import { microAlgosToAlgos } from '../services/algorand';
import { formatDistanceToNow } from 'date-fns';

export default function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const { account, isConnected, connect } = useWallet();
  const queryClient = useQueryClient();
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0);
  const [betAmount, setBetAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: market, isLoading } = useQuery({
    queryKey: ['market', id],
    queryFn: () => getMarket(id!),
    enabled: !!id,
  });

  const tradeMutation = useMutation({
    mutationFn: async ({ outcome, amount }: { outcome: string; amount: number }) => {
      if (!account?.address) {
        throw new Error('Wallet not connected');
      }
      
      return await executeTrade(
        id!, // market ID
        account.address, // trader address
        outcome, // outcome name
        amount // amount in ALGO
      );
    },
    onSuccess: (data) => {
      // Refresh market data
      queryClient.invalidateQueries({ queryKey: ['market', id] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      
      // Show success message
      setShowSuccess(true);
      setBetAmount('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
      console.log('✅ Trade successful:', data);
    },
    onError: (error: any) => {
      console.error('❌ Trade failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Trade failed. Please try again.';
      alert(errorMessage);
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

    // account.balance is already in ALGO from the mock wallet
    if (amount > account.balance) {
      alert(`Insufficient balance. You have ${account.balance.toFixed(2)} ALGO available.`);
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
      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold">Bet Placed Successfully! 🎉</div>
              <div className="text-sm opacity-90">Your trade has been executed</div>
            </div>
          </div>
        </div>
      )}
      
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
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 bg-algorand bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-algorand" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Connect your wallet to start trading on this market
              </p>
              <button
                onClick={connect}
                className="btn bg-algorand hover:bg-green-600 text-white w-full py-3 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Demo mode: Connects to a simulated wallet
              </p>
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
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 transform ${
                      selectedOutcome === 0
                        ? 'border-algorand bg-green-50 shadow-md scale-[1.02] ring-2 ring-algorand ring-opacity-30'
                        : 'border-gray-200 hover:border-algorand hover:bg-green-50/50 hover:shadow-sm active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {selectedOutcome === 0 && (
                          <div className="w-2 h-2 bg-algorand rounded-full animate-pulse" />
                        )}
                        <span className={`font-medium ${selectedOutcome === 0 ? 'text-algorand' : 'text-gray-700'}`}>
                          {market.outcomeAName}
                        </span>
                      </div>
                      <span className={`font-bold text-lg ${selectedOutcome === 0 ? 'text-algorand' : 'text-gray-500'}`}>
                        {outcomeAPercent}%
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedOutcome(1)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 transform ${
                      selectedOutcome === 1
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02] ring-2 ring-blue-500 ring-opacity-30'
                        : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-sm active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {selectedOutcome === 1 && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                        <span className={`font-medium ${selectedOutcome === 1 ? 'text-blue-600' : 'text-gray-700'}`}>
                          {market.outcomeBName}
                        </span>
                      </div>
                      <span className={`font-bold text-lg ${selectedOutcome === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                        {outcomeBPercent}%
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bet Amount (ALGO)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.1"
                    className="input pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => account && setBetAmount((account.balance / 2).toFixed(2))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    Half
                  </button>
                </div>
                {account && (
                  <div className="text-sm text-gray-500 mt-1 flex justify-between">
                    <span>Balance: {account.balance.toFixed(2)} ALGO</span>
                    <button
                      type="button"
                      onClick={() => setBetAmount(account.balance.toFixed(2))}
                      className="text-algorand hover:underline text-xs"
                    >
                      Max
                    </button>
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
                className={`btn w-full transition-all duration-200 font-semibold text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                  tradeMutation.isPending
                    ? 'bg-gray-400 cursor-wait'
                    : selectedOutcome === 0
                    ? 'bg-algorand hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {tradeMutation.isPending ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Trade...</span>
                  </span>
                ) : (
                  `Place Bet on ${selectedOutcome === 0 ? market.outcomeAName : market.outcomeBName}`
                )}
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
