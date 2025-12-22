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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="font-semibold">Open Orders</h2>
        <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">
          {activeOrders.length} active
        </span>
      </div>

      <div className="overflow-auto flex-1 no-scrollbar">
        {activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 py-10">
            <p className="text-sm">No open orders</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <tr>
                <th className="px-6 py-3 font-medium">Side</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Quantity</th>
                <th className="px-6 py-3 font-medium">Filled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {activeOrders.map((order) => {
                const filled = order.quantity - order.remaining;
                const fillPercent = (filled / order.quantity) * 100;

                return (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.side === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {order.side}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-zinc-300">
                      {order.type}
                    </td>

                    <td className="px-6 py-4 text-zinc-300">
                      {order.type === 'MARKET'
                        ? 'Market'
                        : `$${order.price?.toLocaleString()}`}
                    </td>

                    <td className="px-6 py-4 text-zinc-300">
                      {order.quantity}
                    </td>

                    <td className="px-6 py-4">
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-zinc-400 h-full transition-all duration-300"
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500">
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
