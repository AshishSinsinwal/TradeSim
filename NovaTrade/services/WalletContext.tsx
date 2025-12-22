import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { socketService } from './socket';

interface WalletState {
  balance: number;
  locked: number;
}

interface WalletContextType {
  wallet: WalletState;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({ balance: 0, locked: 0 });

  const refreshWallet = async () => {
    try {
      const data = await api.getWallet();
      setWallet(data);
    } catch (err) {
      console.error("Failed to fetch wallet snapshot", err);
    }
  };

  useEffect(() => {
    refreshWallet(); // Initial fetch on load

    const handleWalletUpdate = (updatedWallet: WalletState) => {
      console.log('💰 Global Wallet Update:', updatedWallet);
      setWallet(updatedWallet);
    };

    socketService.on('wallet_updated', handleWalletUpdate);

    return () => {
      socketService.off('wallet_updated', handleWalletUpdate);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};