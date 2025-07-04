import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalletContextType {
  walletAddress: string | null;
  ghoxBalance: string;
  isConnected: boolean;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  hasMinimumGhox: (required: number) => boolean;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ghoxBalance, setGhoxBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const isConnected = walletAddress !== null;

  useEffect(() => {
    // Load wallet from storage on app start
    loadWalletFromStorage();
  }, []);

  const loadWalletFromStorage = async () => {
    try {
      const savedWallet = await AsyncStorage.getItem('wallet_address');
      if (savedWallet) {
        setWalletAddress(savedWallet);
        await refreshBalance();
      }
    } catch (error) {
      console.error('Error loading wallet from storage:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate wallet connection
      // In a real app, this would integrate with WalletConnect or similar
      const mockWallet = '0x1234567890123456789012345678901234567890';
      setWalletAddress(mockWallet);
      await AsyncStorage.setItem('wallet_address', mockWallet);
      await refreshBalance();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setWalletAddress(null);
      setGhoxBalance('0');
      await AsyncStorage.removeItem('wallet_address');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const refreshBalance = async () => {
    if (!walletAddress) return;
    
    try {
      // Mock GHOX balance - in a real app, this would fetch from blockchain
      const mockBalance = '1000';
      setGhoxBalance(mockBalance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setGhoxBalance('0');
    }
  };

  const hasMinimumGhox = (required: number): boolean => {
    const balance = parseFloat(ghoxBalance);
    return balance >= required;
  };

  const value: WalletContextType = {
    walletAddress,
    ghoxBalance,
    isConnected,
    loading,
    connectWallet,
    disconnectWallet,
    hasMinimumGhox,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 