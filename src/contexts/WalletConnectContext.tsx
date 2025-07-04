import React, { createContext, useContext, useEffect, useState } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useDisconnect, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { config, projectId } from '@/config/walletconnect';

// GHOX token contract address
const GHOX_CONTRACT_ADDRESS = '0xaF17f5e5AfeB515cA3e3C170658f3cb072b14108';

// ERC-20 ABI for balance checking
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

interface WalletContextType {
  walletAddress: string | null;
  ghoxBalance: bigint;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  hasMinimumGhox: (required: number) => boolean;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Create a query client
const queryClient = new QueryClient();

// Create the Web3Modal instance immediately when this module loads
const modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: false
});

// Inner component that uses wagmi hooks
function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  
  const [ghoxBalance, setGhoxBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = () => {
    // Use the modal instance directly
    modal.open();
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const refreshBalance = async () => {
    if (!address || !publicClient) {
      setGhoxBalance(0n);
      return;
    }

    try {
      setIsLoading(true);
      const balance = await publicClient.readContract({
        address: GHOX_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      
      setGhoxBalance(balance as bigint);
    } catch (error) {
      console.error('Error fetching GHOX balance:', error);
      setGhoxBalance(0n);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMinimumGhox = (required: number): boolean => {
    if (!ghoxBalance) return required === 0;
    
    // Convert required amount to wei (assuming 18 decimals for GHOX)
    const requiredWei = BigInt(required) * BigInt(10 ** 18);
    return ghoxBalance >= requiredWei;
  };

  // Refresh balance when address changes
  useEffect(() => {
    if (isConnected && address) {
      refreshBalance();
    } else {
      setGhoxBalance(0n);
    }
  }, [address, isConnected, publicClient]);

  const value: WalletContextType = {
    walletAddress: address || null,
    ghoxBalance,
    isConnected,
    isLoading,
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

// Main provider component with all necessary providers
export function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProviderInner>
          {children}
        </WalletProviderInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletConnectProvider');
  }
  return context;
}