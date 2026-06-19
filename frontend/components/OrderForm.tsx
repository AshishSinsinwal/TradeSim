import React, { useState } from 'react';
import { OrderSide, OrderType } from '../types';
import { api } from '../services/api';

const OrderForm: React.FC = () => {
  const [side, setSide] = useState<OrderSide>('BUY');
  const [type, setType] = useState<OrderType>('LIMIT');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isValid = () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return false;

    if (type === 'LIMIT') {
      const pr = parseFloat(price);
      if (isNaN(pr) || pr <= 0) return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValid()) return;

    const qty = parseFloat(quantity);
    let payload: any = {
      side,
      type,
      quantity: qty,
    };

    if (type === 'LIMIT') {
      payload.price = parseFloat(price);
    }

    setIsSubmitting(true);
    try {
      await api.placeOrder(payload);
      setQuantity('');
      if (type === 'LIMIT') setPrice('');
    } catch (err) {
      console.error('Failed to place order:', err);
      setError('Insufficient funds.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6 text-zinc-100 drop-shadow-md">Place Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BUY / SELL */}
        <div className="flex bg-black/40 border border-white/5 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`flex-1 py-2 rounded-md font-bold transition-all ${
              side === 'BUY'
                ? 'bg-emerald-500/90 text-white shadow-lg'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`flex-1 py-2 rounded-md font-bold transition-all ${
              side === 'SELL'
                ? 'bg-red-500/90 text-white shadow-lg'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            SELL
          </button>
        </div>

        {/* LIMIT / MARKET */}
        <div className="flex gap-2">
          {(['LIMIT', 'MARKET'] as OrderType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setError('');
              }}
              
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                type === t
                  ? 'border-zinc-500 bg-zinc-800/80 text-white shadow-inner'
                  : 'border-white/5 bg-black/20 text-zinc-500 hover:bg-black/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Price Input */}
        {type === 'LIMIT' && (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 placeholder-zinc-600 transition-all"
              placeholder="0.00"
            />
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Quantity
          </label>
          <input
            type="number"
            step="0.0001"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 placeholder-zinc-600 transition-all"
            placeholder="0.0000"
          />
        </div>

        {/* Error Display */}
        {error && (
          <p className="text-red-400 text-xs font-medium text-center bg-red-950/40 py-2 rounded-lg border border-red-500/20">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isValid()}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
            !isValid() || isSubmitting
              ? 'bg-black/40 text-zinc-600 cursor-not-allowed border border-white/5'
              : side === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] border border-emerald-400/50'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/50'
          }`}
        >
          {isSubmitting ? 'Sending Order...' : `${side} ORDER`}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;