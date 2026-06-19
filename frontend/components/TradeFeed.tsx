import React from 'react';
import { Trade } from '../types';

interface TradeFeedProps {
  trades: Trade[];
}

const TradeFeed: React.FC<TradeFeedProps> = ({ trades }) => {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl overflow-hidden flex flex-col h-full relative">
      <div className="px-6 py-4 border-b border-white/5 bg-black/20">
        <h2 className="font-semibold text-zinc-100 drop-shadow-md">Recent Trades</h2>
      </div>

      <div className="overflow-auto flex-1 no-scrollbar">
        <table className="w-full text-xs text-left">
          <thead className="text-zinc-400 uppercase border-b border-white/5 sticky top-0 bg-zinc-900/90 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Price</th>
              <th className="px-6 py-4 font-medium tracking-wider">Qty</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {trades.map((trade, index) => (
              <tr
                key={`${trade.buyOrderId}-${trade.sellOrderId}-${trade.timestamp}-${index}`}
                className="hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <td className="px-6 py-3 font-medium text-zinc-200">
                  ${trade.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-3 text-zinc-300">
                  {trade.quantity.toFixed(4)}
                </td>
                <td className="px-6 py-3 text-zinc-500 text-right font-medium">
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