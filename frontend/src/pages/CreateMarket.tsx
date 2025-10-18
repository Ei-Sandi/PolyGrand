import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Calendar, DollarSign, FileText, PlusCircle, MinusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { createMarket } from '../services/api';
import { microAlgosToAlgos, algosToMicroAlgos } from '../services/algorand';

interface OutcomeInput {
  id: string;
  name: string;
}

export default function CreateMarket() {
  const { account, isConnected } = useWallet();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('politics');
  const [resolutionDate, setResolutionDate] = useState('');
  const [outcomes, setOutcomes] = useState<OutcomeInput[]>([
    { id: '1', name: '' },
    { id: '2', name: '' },
  ]);
  const [initialLiquidity, setInitialLiquidity] = useState('100');

  const createMarketMutation = useMutation({
    mutationFn: createMarket,
    onSuccess: (data) => {
      navigate(`/markets/${data.id}`);
    },
  });

  const addOutcome = () => {
    if (outcomes.length < 10) {
      setOutcomes([...outcomes, { id: Date.now().toString(), name: '' }]);
    }
  };

  const removeOutcome = (id: string) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter(o => o.id !== id));
    }
  };

  const updateOutcome = (id: string, name: string) => {
    setOutcomes(outcomes.map(o => o.id === id ? { ...o, name } : o));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !account) {
      alert('Please connect your wallet first');
      return;
    }

    const validOutcomes = outcomes.filter(o => o.name.trim());
    if (validOutcomes.length < 2) {
      alert('Please provide at least 2 outcomes');
      return;
    }

    const liquidityMicroAlgos = algosToMicroAlgos(parseFloat(initialLiquidity));

    createMarketMutation.mutate({
      title,
      description,
      category,
      outcomes: validOutcomes.map(o => o.name),
      resolutionDate: new Date(resolutionDate).toISOString(),
      initialLiquidity: liquidityMicroAlgos,
      creatorAddress: account.address,
    });
  };

  if (!isConnected || !account) {
    return (
      <div className="card text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600">Connect your wallet to create a new market</p>
      </div>
    );
  }

  const minBalance = 1.1; // Minimum ALGO required (1 for contract + 0.1 for fees)
  const userBalance = microAlgosToAlgos(account.balance);
  const canCreate = userBalance >= minBalance;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Market</h1>
        <p className="text-gray-600 mb-6">
          Launch your own prediction market on PolyGrand
        </p>

        {!canCreate && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              You need at least {minBalance} ALGO to create a market. 
              Current balance: {userBalance.toFixed(2)} ALGO
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Market Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-algorand-blue focus:border-transparent"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the market, resolution criteria, and data sources..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-algorand-blue focus:border-transparent"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/1000 characters
            </div>
          </div>

          {/* Category & Resolution Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-algorand-blue focus:border-transparent"
              >
                <option value="politics">Politics</option>
                <option value="crypto">Crypto</option>
                <option value="sports">Sports</option>
                <option value="finance">Finance</option>
                <option value="technology">Technology</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Resolution Date *
              </label>
              <input
                type="datetime-local"
                required
                value={resolutionDate}
                onChange={(e) => setResolutionDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-algorand-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Outcomes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outcomes * (2-10)
            </label>
            <div className="space-y-3">
              {outcomes.map((outcome, index) => (
                <div key={outcome.id} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={outcome.name}
                      onChange={(e) => updateOutcome(outcome.id, e.target.value)}
                      placeholder={`Outcome ${index + 1}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-algorand-blue focus:border-transparent"
                      maxLength={100}
                    />
                  </div>
                  {outcomes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOutcome(outcome.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {outcomes.length < 10 && (
              <button
                type="button"
                onClick={addOutcome}
                className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-algorand-blue hover:bg-blue-50 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Outcome
              </button>
            )}
          </div>

          {/* Initial Liquidity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Initial Liquidity (ALGO) *
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={initialLiquidity}
              onChange={(e) => setInitialLiquidity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-algorand-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 1 ALGO. This will be locked in the market contract to bootstrap trading.
            </p>
          </div>

          {/* Fee Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Transaction Fees</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Contract Deployment: ~0.1 ALGO</li>
              <li>• Initial Liquidity: {initialLiquidity} ALGO</li>
              <li>• Total Required: ~{(parseFloat(initialLiquidity) + 0.1).toFixed(2)} ALGO</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canCreate || createMarketMutation.isPending}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMarketMutation.isPending ? 'Creating...' : 'Create Market'}
            </button>
          </div>

          {createMarketMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              Error creating market. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
