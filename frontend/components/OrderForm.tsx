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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    let payload: any = {
      side,
      type,
      quantity: qty,
    };

    if (type === 'LIMIT') {
      const pr = parseFloat(price);
      if (!pr || pr <= 0) {
        setError('Price must be greater than zero for LIMIT orders');
        return;
      }
      payload.price = pr;
    }

    setIsSubmitting(true);
    try {
      await api.placeOrder(payload);

      // Clear inputs AFTER command accepted (not after execution)
      setQuantity('');
      if (type === 'LIMIT') setPrice('');
    } catch (err) {
      console.error('Failed to place order:', err);
      setError('Order rejected by backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6">Place Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BUY / SELL */}
        <div className="flex bg-zinc-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`flex-1 py-2 rounded-md font-bold transition-all ${
              side === 'BUY'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-400'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`flex-1 py-2 rounded-md font-bold transition-all ${
              side === 'SELL'
                ? 'bg-red-500 text-white'
                : 'text-zinc-400'
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
              onClick={() => setType(t)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                type === t
                  ? 'border-zinc-400 bg-zinc-700 text-white'
                  : 'border-zinc-800 text-zinc-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {type === 'LIMIT' && (
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Quantity
          </label>
          <input
            type="number"
            step="0.0001"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs font-medium text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-red-600 hover:bg-red-500'
          } text-white disabled:opacity-50`}
        >
          {isSubmitting ? 'Sending Order...' : `${side} ORDER`}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
