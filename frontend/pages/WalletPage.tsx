import React, { useState } from 'react';
import { api } from '../services/api';
import { Landmark, ArrowUpRight, ShieldCheck, History } from 'lucide-react';
import { useWallet } from '../services/WalletContext'; 

const WalletPage: React.FC = () => {
  const { wallet } = useWallet(); 

  const [topUpAmount, setTopUpAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);
    try {
      await api.topUp(amount);
      setTopUpAmount('');
    } catch (err) {
      console.error('Top-up failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currency = 'USD';

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto w-full relative z-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-md">My Wallet</h1>
        <p className="text-zinc-400">Manage your digital assets and funding.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-emerald-950/40 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden group transition-all duration-500 hover:border-emerald-500/40">
          <Landmark className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 group-hover:text-emerald-500/20 transition-all duration-700" />
          <p className="text-emerald-400/80 text-sm font-medium mb-1 relative z-10">Available Balance</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
              ${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-emerald-400/80 text-sm font-bold uppercase tracking-widest">{currency}</span>
          </div>
        </div>

        {/* Locked in Orders */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-black/50 border border-white/5 flex items-center justify-center text-zinc-400 shadow-inner">
              <ShieldCheck size={20} />
            </div>
            <p className="text-zinc-400 text-sm font-medium">Locked in Orders</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-zinc-100">
              ${wallet.locked.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{currency}</span>
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-black/50 border border-white/5 flex items-center justify-center text-zinc-400 shadow-inner">
              <History size={20} />
            </div>
            <p className="text-zinc-400 text-sm font-medium">Net Worth</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-zinc-100">
              ${(wallet.balance + wallet.locked).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{currency}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Funds Form */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-zinc-100">
            <ArrowUpRight className="text-emerald-500" /> Deposit Funds
          </h3>
          <form onSubmit={handleTopUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Amount to Deposit ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1,000.00"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-xl font-medium text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-zinc-700"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !topUpAmount}
              className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {isSubmitting ? 'Simulating Transfer...' : 'Instant Deposit'}
            </button>
          </form>
        </div>


        <div className="bg-black/20 backdrop-blur-sm border border-dashed border-white/10 rounded-3xl p-8 flex flex-col justify-center transition-colors hover:bg-black/30">
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