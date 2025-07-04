import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletConnectContext';

import { useToast } from '@/hooks/use-toast';
import { formatUnits } from 'viem';
import { Wallet, Coins, Power } from 'lucide-react';

interface WalletConnectionProps {
  showBalance?: boolean;
  compact?: boolean;
  onConnect?: () => void;
}

export function WalletConnection({ showBalance = true, compact = false, onConnect }: WalletConnectionProps) {
  const { walletAddress, ghoxBalance, isConnected, disconnectWallet, connectWallet } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      connectWallet();
      onConnect?.();
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to open wallet selection. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isConnected && walletAddress ? (
          <>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Coins className="h-3 w-3 mr-1" />
              {formatUnits(ghoxBalance, 18)} $GHOX
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDisconnect}
              className="text-muted-foreground hover:text-destructive"
            >
              <Power className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleConnect}
            className="text-primary border-primary/20 hover:bg-primary/10"
          >
            <Wallet className="h-3 w-3 mr-1" />
            Connect Wallet
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          GHOX Wallet
        </CardTitle>
        <CardDescription>
          Connect your wallet to check your GHOX balance and access exclusive drops
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && walletAddress ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Address:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </code>
            </div>
            {showBalance && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">GHOX Balance:</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Coins className="h-3 w-3 mr-1" />
                  {formatUnits(ghoxBalance, 18)}
                </Badge>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </>
        ) : (
          <Button
            onClick={handleConnect}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </CardContent>
    </Card>
  );
}