import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateQRCodeWithLogo } from '@/utils/qrCodeGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Drop {
  id: string;
  title: string;
  description: string | null;
  prize: string | null;
  drop_id: string;
  created_at: string;
  expires_at: string | null;
}

interface ClaimWithUserAndDrop {
  id: string;
  status: string;
  claimed_at: string;
  admin_notes: string | null;
  wallet_address: string;
  user_id: string;
  drop: {
    title: string;
    drop_id: string;
  };
  profile: {
    email: string;
  };
}

export default function Admin() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [claims, setClaims] = useState<ClaimWithUserAndDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prize, setPrize] = useState('');
  const [dropId, setDropId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [minGhoxRequired, setMinGhoxRequired] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      // Check if user has admin role
      const { data: hasAdminRole } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (!hasAdminRole) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await Promise.all([fetchDrops(), fetchClaims()]);
      setLoading(false);
    };

    checkAdminAccess();
  }, [user, navigate, toast]);

  const fetchDrops = async () => {
    const { data } = await supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    setDrops(data || []);
  };

  const fetchClaims = async () => {
    // First fetch claims with drops
    const { data: claimsData, error: claimsError } = await supabase
      .from('claims')
      .select(`
        id,
        status,
        claimed_at,
        admin_notes,
        wallet_address,
        user_id,
        drop_id,
        drops (
          title,
          drop_id
        )
      `)
      .order('claimed_at', { ascending: false })
      .limit(50);

    console.log('Claims query result:', { data: claimsData, error: claimsError });

    if (claimsData && claimsData.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(claimsData.map(claim => claim.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      // Create a lookup map for profiles
      const profilesMap = Object.fromEntries(
        (profilesData || []).map(profile => [profile.user_id, profile])
      );

      // Combine the data
      const mappedClaims = claimsData.map(claim => ({
        ...claim,
        drop: claim.drops as any,
        profile: profilesMap[claim.user_id] || { email: 'Unknown' }
      }));
      
      console.log('Mapped claims:', mappedClaims);
      setClaims(mappedClaims);
    } else {
      setClaims([]);
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: string, notes?: string) => {
    const { error } = await supabase
      .from('claims')
      .update({ 
        status: newStatus,
        admin_notes: notes || null
      })
      .eq('id', claimId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update claim status.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Claim Updated",
        description: `Claim marked as ${newStatus}.`,
      });
      fetchClaims();
    }
  };

  const generateDropId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createDrop = async () => {
    if (!title.trim() || !dropId.trim() || !prize.trim()) {
      toast({
        title: "Validation Error",
        description: "Title, Prize, and Drop ID are required.",
        variant: "destructive"
      });
      return;
    }

    setCreateLoading(true);

    const { error } = await supabase
      .from('drops')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        prize: prize.trim() || null,
        drop_id: dropId.trim(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        min_ghox_required: minGhoxRequired ? parseFloat(minGhoxRequired) : 0,
        created_by: user!.id
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes('unique') 
          ? "Drop ID already exists. Please use a different ID."
          : "Failed to create drop. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Drop Created! 👻",
        description: "Ghost drop has been created successfully.",
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrize('');
      setDropId('');
      setExpiresAt('');
      setLatitude('');
      setLongitude('');
      setMinGhoxRequired('');
      setShowCreateForm(false);
      
      // Refresh drops
      fetchDrops();
    }

    setCreateLoading(false);
  };

  const downloadQRCode = async (dropId: string, dropTitle: string) => {
    try {
      const qrDataURL = await generateQRCodeWithLogo(dropId, undefined, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.href = qrDataURL;
      link.download = `qr-${dropId}-${dropTitle.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code Downloaded",
        description: `QR code for "${dropTitle}" has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive"
      });
    }
  };

  const deleteDrop = async (dropId: string, dropTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${dropTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('drops')
        .delete()
        .eq('id', dropId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete drop.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Drop Deleted",
        description: `"${dropTitle}" has been deleted successfully.`,
      });

      // Refresh the drops list
      fetchDrops();
      fetchClaims();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete drop.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'paid': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center glow-primary pulse-glow">
          <span className="text-3xl">👑</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">Manage drops and claims</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-primary hover:opacity-90"
              >
                {showCreateForm ? 'Cancel' : 'Create Drop'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to App
              </Button>
            </div>
          </div>
        </header>

        {/* Create Drop Form */}
        {showCreateForm && (
          <Card className="mb-8 bg-card/90 backdrop-blur-sm border-border glow-ethereal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>✨</span>
                Create New Drop
              </CardTitle>
              <CardDescription>Set up a new ghost drop with QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ghost Drop #1"
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="prize">Prize *</Label>
                  <Input
                    id="prize"
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                    placeholder="1000 $GHOX, $50 USDT, iPhone 16 Pro"
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="dropId">Drop ID *</Label>
                <div className="flex gap-2">
                  <Input
                    id="dropId"
                    value={dropId}
                    onChange={(e) => setDropId(e.target.value)}
                    placeholder="unique-drop-id"
                    className="bg-background/50 border-border focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDropId(generateDropId())}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A mysterious ghost awaits those who solve the riddle..."
                  className="bg-background/50 border-border focus:border-primary"
                />
              </div>
              
              <div>
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="bg-background/50 border-border focus:border-primary"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="37.7749"
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-122.4194"
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="minGhoxRequired">Minimum $GHOX Required (Optional)</Label>
                <Input
                  id="minGhoxRequired"
                  value={minGhoxRequired}
                  onChange={(e) => setMinGhoxRequired(e.target.value)}
                  placeholder="500"
                  type="number"
                  min="0"
                  className="bg-background/50 border-border focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Users must have this amount of $GHOX to see drop details and location
                </p>
              </div>
              
              <Button
                onClick={createDrop}
                disabled={createLoading}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                {createLoading ? 'Creating...' : 'Create Drop & Generate QR Code'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Drops */}
          <Card className="bg-card/90 backdrop-blur-sm border-border glow-ethereal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📦</span>
                Recent Drops
              </CardTitle>
              <CardDescription>Latest ghost drops in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {drops.map((drop) => (
                <div key={drop.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{drop.title}</h3>
                      {drop.prize && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">🏆</span>
                          <span className="text-sm font-medium text-primary">{drop.prize}</span>
                        </div>
                      )}
                      <code className="text-xs bg-background/50 px-2 py-1 rounded mt-1 inline-block">
                        {drop.drop_id}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQRCode(drop.drop_id, drop.title)}
                      >
                        📱 QR Code
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDrop(drop.id, drop.title)}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>
                  {drop.description && (
                    <p className="text-sm text-muted-foreground mb-2">{drop.description}</p>
                  )}
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Created: {new Date(drop.created_at).toLocaleDateString()}</span>
                    {drop.expires_at && (
                      <span className={`${new Date(drop.expires_at) < new Date() ? 'text-red-400' : ''}`}>
                        Expires: {new Date(drop.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Claims Management */}
          <Card className="bg-card/90 backdrop-blur-sm border-border glow-ethereal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📋</span>
                Recent Claims
              </CardTitle>
              <CardDescription>Manage user claims and payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {claims.map((claim) => (
                <div key={claim.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{claim.drop.title}</h3>
                      <p className="text-sm text-muted-foreground">{claim.profile.email}</p>
                      <p className="text-xs text-muted-foreground font-mono">{claim.wallet_address}</p>
                    </div>
                    <Badge className={`${getStatusColor(claim.status)} border`}>
                      {claim.status}
                    </Badge>
                  </div>

                  {claim.admin_notes && (
                    <div className="mb-3 p-2 rounded bg-background/50 border border-border">
                      <p className="text-xs text-muted-foreground">Notes: {claim.admin_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {claim.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateClaimStatus(claim.id, 'paid', 'Payment processed')}
                          className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                        >
                          Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateClaimStatus(claim.id, 'rejected', 'Claim rejected')}
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground self-center">
                      {new Date(claim.claimed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}