import React, { useEffect, useState } from 'react';
import OrderForm from '../components/OrderForm';
import OpenOrders from '../components/OpenOrders';
import TradeFeed from '../components/TradeFeed';
import { Order, Trade } from '../types';
import { socketService } from '../services/socket';
import {api} from "../services/api";

const TradingPage: React.FC = () => {

  type SocketError = {
  code?: string;
  message: string;
  orderId?: string;
};

const [errors, setErrors] = useState<SocketError[]>([]);


  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [connected, setConnected] = useState(false);
useEffect(() => {
  // 🟢 1. Sync Initial State from Database
  const initSync = async () => {
    try {
      const [openOrders, recentTrades] = await Promise.all([
        api.getOpenOrders(),
        api.getRecentTrades()
      ]);
      setOrders(openOrders);
      setTrades(recentTrades);
    } catch (err) {
      console.error("Failed to sync initial trading data:", err);
    }
  };

  initSync();

  setConnected(socketService.isConnected());

  const handleConnect = () => {
    console.log('🟢 Socket connected');
    setConnected(true);
  };

  const handleDisconnect = (reason: string) => {
    console.warn('🔴 Socket disconnected:', reason);
    setConnected(false);
  };

  const handleOrderError = (err: SocketError) => {
    console.error('❌ Order error from backend:', err);
    setErrors((prev) => [err, ...prev].slice(0, 10));
  };

  socketService.on('connect', handleConnect);
  socketService.on('disconnect', handleDisconnect);

  socketService.on<Order>('order_updated', (order) => {
    console.log('📥 Order update:', order);

    setOrders((prev) => {
      const index = prev.findIndex((o) => String(o.id) === String(order.id));
      if (index === -1) return [...prev, order];

      const copy = [...prev];
      copy[index] = order;
      return copy;
    });
  });

  socketService.on<Trade>('trade_executed', (trade) => {
    console.log('💥 Trade executed:', trade);
    setTrades((prev) => [trade, ...prev].slice(0, 50));
  });

  // 🔥 NEW
  socketService.on<SocketError>('order_error', handleOrderError);
  socketService.on<SocketError>('socket_error', handleOrderError);

  return () => {
    socketService.off('connect', handleConnect);
    socketService.off('disconnect', handleDisconnect);
    socketService.off('order_updated');
    socketService.off('trade_executed');
    socketService.off('order_error', handleOrderError);
    socketService.off('socket_error', handleOrderError);
  };
}, []);



  return (
    <div className="flex-1 flex flex-col lg:flex-row  overflow-y-auto p-6 gap-6">
      {/* Left Column */}
      <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
        <OrderForm />

        {/* Market Status */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hidden lg:block">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
            Market Status
          </h3>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Connection</span>
            <span
              className={`font-medium flex items-center gap-1.5 ${
                connected ? 'text-emerald-500' : 'text-red-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'
                }`}
              />
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

{errors.length > 0 && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">
    <h4 className="font-bold text-red-400 mb-2">Errors</h4>
    <ul className="space-y-1 text-red-300">
      {errors.map((e, i) => (
        <li key={i}>
          {e.code && <strong>[{e.code}] </strong>}
          {e.message}
        </li>
      ))}
    </ul>
  </div>
)}


      {/* Center Column */}
      <div className="flex-1 min-w-0 flex flex-col min-h-[400px]">
        <OpenOrders orders={orders} />
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-72 flex-shrink-0 min-h-[400px]">
        <TradeFeed trades={trades} />
      </div>
    </div>
  );
};

export default TradingPage;
