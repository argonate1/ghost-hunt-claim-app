import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/scanner/QRScanner';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export default function Scanner() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen pb-20 p-4 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-full flex items-center justify-center glow-primary ghost-float">
          <span className="text-6xl">📱</span>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ghost Scanner</h1>
          <p className="text-muted-foreground">Scan QR codes to claim ghost rewards</p>
        </div>

        <Button
          variant="scan"
          size="lg"
          onClick={() => setShowScanner(true)}
          className="w-full max-w-xs"
        >
          Start Scanning
        </Button>
      </div>

      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}

      <MobileNavigation />
    </div>
  );
}