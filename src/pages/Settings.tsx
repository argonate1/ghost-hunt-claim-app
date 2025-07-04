import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setWalletAddress(data.wallet_address || '');
      }
      setInitialLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSaveWallet = async () => {
    if (!user) return;

    // Basic Ethereum address validation
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum wallet address (0x...)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress || null })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update wallet address. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Wallet Updated! 👻",
        description: "Your wallet address has been saved successfully.",
      });
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen pb-20 p-4 flex items-center justify-center">
        <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center glow-primary pulse-glow">
          <span className="text-3xl">⚙️</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </header>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="bg-card/90 backdrop-blur-sm border-border glow-ethereal">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <div className="mt-1 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Card */}
        <Card className="bg-card/90 backdrop-blur-sm border-border glow-ethereal">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <span>🔗</span>
              Ethereum Wallet
            </CardTitle>
            <CardDescription>
              Set your wallet address to receive Ghostcoin rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wallet" className="text-sm font-medium text-foreground">
                Wallet Address
              </Label>
              <Input
                id="wallet"
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="mt-1 bg-background/50 border-border focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your Ethereum wallet address (starts with 0x)
              </p>
            </div>
            
            <Button
              onClick={handleSaveWallet}
              disabled={loading}
              className="w-full"
              variant="ghost"
            >
              {loading ? 'Saving...' : 'Save Wallet Address'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions Card */}
        <Card className="bg-card/90 backdrop-blur-sm border-border glow-ethereal">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <MobileNavigation />
    </div>
  );
}