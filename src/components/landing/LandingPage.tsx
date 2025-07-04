import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Trophy, Award, Scan, Users, Zap, MapPin } from 'lucide-react';
import DropsMap from '@/components/map/DropsMap';
import { useWallet } from '@/contexts/WalletConnectContext';
import { WalletConnection } from '@/components/wallet/WalletConnection';

interface Winner {
  wallet_address: string;
  claimed_at: string;
  title: string;
  prize: string;
  email?: string;
}

interface UpcomingDrop {
  title: string;
  prize: string;
  description: string;
  expires_at: string | null;
  drop_id: string;
  min_ghox_required: number | null;
}

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [upcomingDrops, setUpcomingDrops] = useState<UpcomingDrop[]>([]);
  const [filteredUpcomingDrops, setFilteredUpcomingDrops] = useState<UpcomingDrop[]>([]);
  const { walletAddress, hasMinimumGhox } = useWallet();

  useEffect(() => {
    fetchWinners();
    fetchUpcomingDrops();
  }, []);

  useEffect(() => {
    // Filter upcoming drops based on GHOX requirements
    const filtered = upcomingDrops.filter(drop => {
      const requiredGhox = drop.min_ghox_required || 0;
      if (requiredGhox === 0) return true; // No requirement, show to everyone
      return walletAddress && hasMinimumGhox(requiredGhox);
    });
    setFilteredUpcomingDrops(filtered);
  }, [upcomingDrops, walletAddress, hasMinimumGhox]);

  const fetchWinners = async () => {
    const { data } = await supabase
      .from('claims')
      .select(`
        wallet_address,
        claimed_at,
        user_id,
        drop_id
      `)
      .eq('status', 'approved')
      .order('claimed_at', { ascending: false })
      .limit(10);
    
    if (data) {
      // Fetch related data separately due to schema constraints
      const claimsWithDetails = await Promise.all(
        data.map(async (claim) => {
          const [dropResult, profileResult] = await Promise.all([
            supabase.from('drops').select('title, prize').eq('id', claim.drop_id).single(),
            supabase.from('profiles').select('email').eq('user_id', claim.user_id).single()
          ]);
          
          return {
            wallet_address: claim.wallet_address,
            claimed_at: claim.claimed_at,
            title: dropResult.data?.title || '',
            prize: dropResult.data?.prize || '',
            email: profileResult.data?.email
          };
        })
      );
      
      setWinners(claimsWithDetails);
    }
  };

  const fetchUpcomingDrops = async () => {
    const { data } = await supabase
      .from('drops')
      .select('title, prize, description, expires_at, drop_id, min_ghox_required')
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) {
      setUpcomingDrops(data);
    }
  };

  const handleAuthClick = (signUp: boolean) => {
    setIsSignUp(signUp);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-ghost">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-primary rounded-full flex items-center justify-center glow-primary ghost-float p-4">
              <img src="/lovable-uploads/bd75dab4-c683-46eb-947e-050d35a0f536.png" alt="Ghostcoin Logo" className="w-full h-full object-contain" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-cosmic bg-clip-text text-transparent">
              Ghostcoin
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Hunt for hidden hauntings in the real world. Scan spectral QR codes, claim mysterious rewards, and join the ghost-fueled treasure hunt revolution.
            </p>
            
            <div className="flex justify-center mb-12">
              <Button 
                size="mobile" 
                variant="cosmic"
                className="text-lg px-8 py-6"
                onClick={() => handleAuthClick(true)}
              >
                <Gift className="mr-2 h-5 w-5" />
                Start Hunting
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating ghost elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-primary-glow rounded-full opacity-30 ghost-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-10 w-12 h-12 bg-secondary-glow rounded-full opacity-20 ghost-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-accent rounded-full opacity-25 ghost-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-primary bg-clip-text text-transparent">
            How the Hunt Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-border glow-ethereal text-center">
              <CardContent className="pt-8">
                <div className="text-4xl mb-4">👻</div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Find & Scan</h3>
                <p className="text-muted-foreground">
                  Seek out hidden hauntings—QR codes placed in real-world locations by the Ghostcoin team and community. Use your phone to scan them before anyone else.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border glow-ethereal text-center">
              <CardContent className="pt-8">
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Claim Rewards</h3>
                <p className="text-muted-foreground">
                  Be the first to scan a haunting and win its prize. Rewards range from GHOX tokens to exclusive merch and mysterious surprises.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border glow-ethereal text-center">
              <CardContent className="pt-8">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Become a Legend</h3>
                <p className="text-muted-foreground">
                  Climb the leaderboard, unlock rare hauntings, and prove yourself among the world's top ghost hunters.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ghost Drops Map */}
      <section className="py-20 px-4 bg-muted/10">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Discover Ghost Locations
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Explore the interactive map to find approximate locations of hidden ghost drops. 
            Each floating ghost marks where mysterious QR codes await discovery.
          </p>
          
          <div className="max-w-6xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-border glow-ethereal overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[500px] relative">
                  <DropsMap disableInteractions={true} />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-foreground font-medium">
                          {filteredUpcomingDrops.length} Active Drop{filteredUpcomingDrops.length !== 1 ? 's' : ''} Available
                        </span>
                      </div>
                    </div>
                    
                    {/* Wallet connection prompt for map */}
                    {upcomingDrops.length > 0 && filteredUpcomingDrops.length === 0 && !walletAddress && (
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
                        <WalletConnection compact={true} />
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Click on any floating ghost to see drop details and prizes
            </p>
          </div>
        </div>
      </section>

      {/* Recent Winners */}
      {winners.length > 0 && (
        <section className="py-20 px-4 bg-muted/10">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-secondary bg-clip-text text-transparent">
              Recent Ghost Hunters
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {winners.slice(0, 5).map((winner, index) => (
                <Card key={index} className="bg-card/60 backdrop-blur-sm border-border hover:glow-green transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {winner.email ? winner.email.split('@')[0] : `Hunter ${winner.wallet_address.slice(0, 6)}...`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Claimed "{winner.title}" • {new Date(winner.claimed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {winner.prize && (
                        <Badge variant="secondary" className="bg-secondary-glow/20 text-secondary">
                          {winner.prize}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {winners.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-muted-foreground">+ {winners.length - 5} more ghost hunters</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Drops */}
      {upcomingDrops.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-cosmic bg-clip-text text-transparent">
              Active Ghost Drops
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredUpcomingDrops.map((drop, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border-border glow-ethereal hover:glow-primary transition-smooth">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">{drop.title}</CardTitle>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Active
                      </Badge>
                    </div>
                    <CardDescription className="text-muted-foreground">
                      {drop.description || 'Mysterious ghost drop waiting to be discovered'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {drop.prize && (
                      <div className="flex items-center gap-2 mb-3">
                        <Gift className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{drop.prize}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Wallet connection prompt for drops */}
            {upcomingDrops.length > 0 && filteredUpcomingDrops.length === 0 && !walletAddress && (
              <div className="text-center mt-8">
                <Card className="bg-card/80 backdrop-blur-sm border-border glow-ethereal max-w-md mx-auto">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Connect Wallet for Exclusive Drops</h3>
                    <p className="text-muted-foreground mb-4">
                      Some drops require a minimum $GHOX balance. Connect your wallet to see all available rewards.
                    </p>
                    <WalletConnection compact={false} />
                  </CardContent>
                </Card>
              </div>
            )}
            
            {upcomingDrops.length > 0 && filteredUpcomingDrops.length === 0 && walletAddress && (
              <div className="text-center mt-8">
                <p className="text-muted-foreground">No drops available at your current GHOX level</p>
                <p className="text-sm text-muted-foreground">Acquire more $GHOX tokens to unlock premium drops</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{winners.length}+</div>
              <p className="text-muted-foreground">Successful Claims</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">{filteredUpcomingDrops.length}</div>
              <p className="text-muted-foreground">Active Drops</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">∞</div>
              <p className="text-muted-foreground">Possibilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Ready to Join the Hunt?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your ghost hunting adventure today. Create your account and discover what mysteries await.
          </p>
          <Button 
            size="mobile" 
            variant="cosmic"
            className="text-lg px-12 py-6"
            onClick={() => handleAuthClick(true)}
          >
            <Zap className="mr-2 h-5 w-5" />
            Begin Your Journey
          </Button>
        </div>
      </section>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultSignUp={isSignUp}
      />
    </div>
  );
}