import React, { useEffect, useState, useCallback } from 'react';
import OrderForm from '../components/OrderForm';
import OpenOrders from '../components/OpenOrders';
import TradeFeed from '../components/TradeFeed';
import { Order, Trade } from '../types';
import { socketService } from '../services/socket';
import { api } from "../services/api";

// --- Types ---
type SocketError = {
  code?: string;
  message: string;
  orderId?: string;
};

type NotificationType = 'success' | 'error' | 'info' | 'trade';

type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};

const TradingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [connected, setConnected] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
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
        showNotification("Failed to load initial data", "error");
      }
    };

    initSync();
    setConnected(socketService.isConnected());

    const handleConnect = () => {
      setConnected(true);
      showNotification("Connected to trading engine", "success");
    };

    const handleDisconnect = (reason: string) => {
      setConnected(false);
      showNotification(`Disconnected: ${reason}`, "error");
    };

    const handleOrderError = (err: SocketError) => {
      console.error('❌ Order error:', err);
      showNotification(err.message || "Failed to place order", "error");
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    socketService.on<Order>('order_updated', (order) => {
      if (order.status === 'OPEN') {
        showNotification(`${order.side} Order Placed: ${order.quantity} @ $${order.price}`, "success");
      }

      setOrders((prev) => {
        const index = prev.findIndex((o) => String(o.id) === String(order.id));
        if (index === -1) return [...prev, order];
        const copy = [...prev];
        copy[index] = order;
        return copy;
      });
    });

    socketService.on<Trade>('trade_executed', (trade) => {
      showNotification(`Trade Filled: ${trade.quantity} units @ $${trade.price}`, "trade");
      setTrades((prev) => [trade, ...prev].slice(0, 50));
    });

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
  }, [showNotification]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto p-4 lg:p-6 gap-6 relative z-10">
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border border-white/10 backdrop-blur-xl text-sm font-medium transition-all animate-in slide-in-from-right-8 fade-in duration-300
              ${note.type === 'success' ? 'bg-emerald-950/40 text-emerald-400' : ''}
              ${note.type === 'error' ? 'bg-red-950/40 text-red-400' : ''}
              ${note.type === 'trade' ? 'bg-blue-950/40 text-blue-400' : ''}
              ${note.type === 'info' ? 'bg-zinc-900/50 text-zinc-300' : ''}
            `}
          >
            {note.type === 'success' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {note.type === 'error' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {note.type === 'trade' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {note.type === 'info' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            
            <p className="tracking-wide">{note.message}</p>
            
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== note.id))}
              className="ml-4 opacity-40 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Left Column: Form and Status */}
      <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
        <OrderForm />

        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl p-6">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            Market Status
          </h3>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-300">Connection</span>
            <span className={`font-medium flex items-center gap-1.5 ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Center Column: Orders */}
      <div className="flex-1 min-w-0 flex flex-col">
        <OpenOrders orders={orders} />
      </div>

      {/* Right Column: Trade Feed */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <TradeFeed trades={trades} />
      </div>
    </div>
  );
};

export default TradingPage;