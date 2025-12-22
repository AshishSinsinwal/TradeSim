import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wallet, 
  LogOut, 
  TrendingUp, 
  PanelLeftClose, 
  PanelLeftOpen, 
} from 'lucide-react';
import { socketService } from '../services/socket';
import { useAuth } from '@/services/authContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    socketService.disconnect();
    window.location.href = '/';
  };

  const navItems = [
    { path: '/', label: 'Trading', icon: <TrendingUp size={20} /> },
    { path: '/wallet', label: 'Wallet', icon: <Wallet size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-200 font-sans">
      {/* --- SIDEBAR RAIL --- */}
      <aside 
        className={`bg-black border-r border-zinc-800 transition-all duration-300 ease-in-out flex flex-col z-50
          ${isExpanded ? 'w-[220px]' : 'w-[68px]'}`}
      >
        {/* Brand + Toggle Header */}
        <div className={`p-4 h-16 flex items-center border-b border-zinc-900 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded && (
            <span className="text-xl font-bold tracking-tight text-white">
              Trade<span className="text-emerald-500">Sim</span>
            </span>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            {isExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-3 py-3 rounded-md transition-all ${
                location.pathname === item.path 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-zinc-900 space-y-2">
          <div className={`flex items-center gap-3 px-3 py-3 rounded-md ${isExpanded ? 'bg-zinc-900/40' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-zinc-100">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-all ${!isExpanded && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isExpanded && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-auto no-scrollbar bg-[#050505] p-6">
        <div className="max-w-[1600px] mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;