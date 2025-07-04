import React from 'react';
import { QRScanner } from '@/components/scanner/QRScanner';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export default function Scanner() {
  return (
    <div className="min-h-screen pb-20">
      <QRScanner onClose={() => window.history.back()} />
      <MobileNavigation />
    </div>
  );
}