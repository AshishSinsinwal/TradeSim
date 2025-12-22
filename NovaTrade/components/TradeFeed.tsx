import React from 'react';
import { Trade } from '../types';

interface TradeFeedProps {
  trades: Trade[];
}

const TradeFeed: React.FC<TradeFeedProps> = ({ trades }) => {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="font-semibold">Recent Trades</h2>
      </div>

      <div className="overflow-auto flex-1 no-scrollbar">
        <table className="w-full text-xs text-left">
          <thead className="text-zinc-500 uppercase border-b border-zinc-800 sticky top-0 bg-zinc-900">
            <tr>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Qty</th>
              <th className="px-6 py-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {trades.map((trade, index) => (
              <tr
                key={`${trade.buyOrderId}-${trade.sellOrderId}-${trade.timestamp}-${index}`}
                className="hover:bg-zinc-800/30 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <td className="px-6 py-3 font-medium text-zinc-200">
                  ${trade.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-3 text-zinc-300">
                  {trade.quantity.toFixed(4)}
                </td>
                <td className="px-6 py-3 text-zinc-500 text-right">
                  {new Date(trade.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeFeed;
