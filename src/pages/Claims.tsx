import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ClaimWithDrop {
  id: string;
  status: string;
  claimed_at: string;
  admin_notes: string | null;
  drop: {
    title: string;
    description: string | null;
  };
}

export default function Claims() {
  const [claims, setClaims] = useState<ClaimWithDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClaims = async () => {
      console.log('Claims page: user state:', user);
      if (!user) {
        console.log('Claims page: No user found, skipping fetch');
        setLoading(false);
        return;
      }

      console.log('Claims page: Fetching claims for user:', user.id);
      const { data, error } = await supabase
        .from('claims')
        .select(`
          id,
          status,
          claimed_at,
          admin_notes,
          drop_id,
          drops!claims_drop_id_fkey (
            title,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: false });

      console.log('Claims page: Query result:', { data, error });

      if (!error && data) {
        setClaims(data.map(claim => ({
          ...claim,
          drop: claim.drops || { title: 'Unknown Drop', description: null }
        })));
      } else if (error) {
        console.error('Claims query error:', error);
      }
      setLoading(false);
    };

    fetchClaims();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30';
      case 'paid': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'paid': return '✅';
      case 'rejected': return '❌';
      default: return '👻';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 p-4 flex items-center justify-center">
        <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center glow-primary pulse-glow">
          <span className="text-3xl">👻</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          My Claims
        </h1>
        <p className="text-muted-foreground">Track your ghost hunt rewards</p>
      </header>

      <div className="space-y-4">
        {claims.length === 0 ? (
          <Card className="text-center py-12 bg-card/50 backdrop-blur-sm border-border glow-ethereal">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center glow-primary opacity-50">
                <span className="text-3xl">👻</span>
              </div>
              <p className="text-muted-foreground mb-2">No claims yet</p>
              <p className="text-sm text-muted-foreground">Start scanning QR codes to claim ghost rewards!</p>
            </CardContent>
          </Card>
        ) : (
          claims.map((claim) => (
            <Card key={claim.id} className="bg-card/90 backdrop-blur-sm border-border glow-ethereal">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground">
                      {claim.drop.title}
                    </CardTitle>
                    {claim.drop.description && (
                      <CardDescription className="mt-1">
                        {claim.drop.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className={`ml-3 ${getStatusColor(claim.status)} border`}>
                    <span className="mr-1">{getStatusIcon(claim.status)}</span>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Claimed {formatDistanceToNow(new Date(claim.claimed_at))} ago
                  </span>
                </div>
                
                {claim.admin_notes && (
                  <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Admin Note:</span> {claim.admin_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MobileNavigation />
    </div>
  );
}