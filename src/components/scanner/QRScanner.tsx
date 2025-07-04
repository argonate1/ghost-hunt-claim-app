import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
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

  const handleScan = async (result: any) => {
    if (!result || !result.text || isProcessing) return;
    
    setIsProcessing(true);
    setIsScanning(false);

    try {
      // Extract drop ID from QR code
      const dropId = result.text;
      
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
  };

  const handleError = (error: any) => {
    // Only show toast for actual camera permission errors, not scanning behavior
    // Most scanning "errors" are just normal operation (no QR code detected)
    const isCameraPermissionError = error?.name === 'NotAllowedError' || 
                                   error?.name === 'NotFoundError' ||
                                   error?.name === 'NotReadableError' ||
                                   (error?.message && (
                                     error.message.includes('Permission denied') ||
                                     error.message.includes('NotAllowed') ||
                                     error.message.includes('camera not available') ||
                                     error.message.includes('getUserMedia')
                                   ));
    
    if (isCameraPermissionError) {
      console.error('QR Scanner camera permission error:', error);
      toast({
        title: "Camera Permission Required",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive"
      });
    }
    // Ignore all other errors (scanning behavior, no codes detected, etc.)
  };

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
              <QrReader
                onResult={(result, error) => {
                  if (error) {
                    handleError(error);
                  } else if (result) {
                    handleScan(result);
                  }
                }}
                constraints={{ facingMode: 'environment' }}
                className="w-full h-full"
              />
              <div className="absolute inset-0 border-4 border-primary/50 rounded-lg animate-pulse"></div>
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