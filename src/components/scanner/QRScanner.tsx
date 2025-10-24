import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface QRScannerProps {
  onClose: () => void;
}

export function QRScanner({ onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'qr-reader';

  const handleScan = useCallback(async (decodedText: string) => {
    if (!decodedText || isProcessing) return;

    setIsProcessing(true);
    setIsScanning(false);

    try {
      // Stop scanning while processing
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      // Extract drop ID from QR code
      const dropId = decodedText;
      
      // First, get the user's profile to check for wallet address
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('user_id', user?.id)
        .single();

      if (profileError || !profile?.wallet_address) {
        toast({
          title: "Wallet Required",
          description: "Please set your wallet address in Settings before claiming rewards.",
          variant: "destructive"
        });
        onClose();
        return;
      }

      // Check if drop exists and is valid
      const { data: drop, error: dropError } = await supabase
        .from('drops')
        .select('*')
        .eq('drop_id', dropId)
        .single();

      if (dropError || !drop) {
        toast({
          title: "Invalid QR Code",
          description: "This QR code doesn't match any active ghost drops.",
          variant: "destructive"
        });
        onClose();
        return;
      }

      // Check if drop is expired
      if (drop.expires_at && new Date(drop.expires_at) < new Date()) {
        toast({
          title: "Ghost Vanished",
          description: "This ghost drop has expired and can no longer be claimed.",
          variant: "destructive"
        });
        onClose();
        return;
      }

      // Check if already claimed
      const { data: existingClaim } = await supabase
        .from('claims')
        .select('*')
        .eq('drop_id', drop.id)
        .single();

      if (existingClaim) {
        toast({
          title: "Already Claimed",
          description: "Sorry, this ghost has already been claimed by another hunter.",
          variant: "destructive"
        });
        onClose();
        return;
      }

      // Create the claim
      const { error: claimError } = await supabase
        .from('claims')
        .insert({
          drop_id: drop.id,
          user_id: user?.id,
          wallet_address: profile.wallet_address,
          status: 'pending'
        });

      if (claimError) {
        toast({
          title: "Claim Failed",
          description: "Unable to claim this ghost. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Ghost Captured! 👻",
          description: `You've successfully claimed "${drop.title}". Rewards will be sent to your wallet after verification.`,
        });
      }

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, user, toast, onClose]);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(qrRegionId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          handleScan,
          () => {
            // Error callback - fires continuously when no QR code is detected
            // We ignore these errors as they're normal during scanning
          }
        );
      } catch (err: any) {
        console.error('QR Scanner initialization error:', err);
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions.",
          variant: "destructive"
        });
      }
    };

    if (isScanning && !isProcessing) {
      startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning, isProcessing, handleScan, toast]);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border glow-ethereal">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span className="text-2xl">📱</span>
            Ghost Scanner
          </CardTitle>
          <CardDescription>
            {isProcessing 
              ? 'Processing your ghost claim...'
              : 'Point your camera at a ghost QR code to claim rewards'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isScanning && !isProcessing && (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-primary glow-primary">
              <div id={qrRegionId} className="w-full h-full" />
            </div>
          )}

          {isProcessing && (
            <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center glow-primary pulse-glow">
                  <span className="text-2xl">👻</span>
                </div>
                <p className="text-foreground">Claiming ghost...</p>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="mobile"
            onClick={onClose}
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Cancel'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}