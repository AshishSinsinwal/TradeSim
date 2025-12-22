import React, { useState } from 'react';
import { api } from '../services/api';
import { Landmark, ArrowUpRight, ShieldCheck, History } from 'lucide-react';
import { useWallet } from '../services/WalletContext'; // 👈 Hook import

const WalletPage: React.FC = () => {
  // 👈 Get wallet from global context instead of local state
  const { wallet } = useWallet(); 

  const [topUpAmount, setTopUpAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🗑️ useEffect with socket listeners removed (now in WalletContext)

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);
    try {
      await api.topUp(amount);
      setTopUpAmount('');
      // ✅ No local state update needed. 
      // The global context will hear the 'wallet_updated' event and refresh the UI.
    } catch (err) {
      console.error('Top-up failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currency = 'USD';

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
        <p className="text-zinc-500">Manage your digital assets and funding.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Balance */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
          <Landmark className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          <p className="text-emerald-100/70 text-sm font-medium mb-1">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-white">
              ${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-emerald-200 text-sm font-bold uppercase tracking-widest">{currency}</span>
          </div>
        </div>

        {/* Locked */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <ShieldCheck size={20} />
            </div>
            <p className="text-zinc-500 text-sm font-medium">Locked in Orders</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-white">
              ${wallet.locked.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">{currency}</span>
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <History size={20} />
            </div>
            <p className="text-zinc-500 text-sm font-medium">Net Worth</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-white">
              ${(wallet.balance + wallet.locked).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">{currency}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <ArrowUpRight className="text-emerald-500" /> Deposit Funds
          </h3>
          <form onSubmit={handleTopUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-2">
                Amount to Deposit ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1,000.00"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl pl-10 pr-4 py-4 text-xl font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Simulating Transfer...' : 'Instant Deposit'}
            </button>
          </form>
        </div>

        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl p-8 flex flex-col justify-center">
          <h4 className="font-bold text-zinc-300 mb-2">Secure Storage</h4>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Your simulated funds are stored in the authoritative backend. All wallet
            updates arrive via real-time events after state commitment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;