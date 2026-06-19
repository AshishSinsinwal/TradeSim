import React from 'react';
import { Order } from '../types';

interface OpenOrdersProps {
  orders: Order[];
}

const OpenOrders: React.FC<OpenOrdersProps> = ({ orders }) => {
  const activeOrders = orders.filter(
    (order) => order.status === 'OPEN' || order.status === 'PARTIAL'
  );

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl overflow-hidden flex flex-col h-full relative">
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/20">
        <h2 className="font-semibold text-zinc-100 drop-shadow-md">Open Orders</h2>
        <span className="text-xs bg-black/40 border border-white/10 px-2 py-1 rounded text-zinc-400">
          {activeOrders.length} active
        </span>
      </div>

      <div className="overflow-auto flex-1 no-scrollbar">
        {activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-10">
            <p className="text-sm">No open orders</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase border-b border-white/5 sticky top-0 bg-zinc-900/90 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Side</th>
                <th className="px-6 py-4 font-medium tracking-wider">Type</th>
                <th className="px-6 py-4 font-medium tracking-wider">Price</th>
                <th className="px-6 py-4 font-medium tracking-wider">Quantity</th>
                <th className="px-6 py-4 font-medium tracking-wider">Filled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeOrders.map((order) => {
                const filled = order.quantity - order.remaining;
                const fillPercent = (filled / order.quantity) * 100;

                return (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          order.side === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {order.side}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-zinc-300 font-medium">
                      {order.type}
                    </td>

                    <td className="px-6 py-4 text-zinc-200">
                      {order.type === 'MARKET'
                        ? 'Market'
                        : `$${order.price?.toLocaleString()}`}
                    </td>

                    <td className="px-6 py-4 text-zinc-200">
                      {order.quantity}
                    </td>

                    <td className="px-6 py-4">
                      <div className="w-full bg-black/50 border border-white/5 h-1.5 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-zinc-400 h-full transition-all duration-300 shadow-[0_0_5px_currentColor]"
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
                        {filled} / {order.quantity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OpenOrders;