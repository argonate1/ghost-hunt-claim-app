import React from 'react';
import DropsMap from '@/components/map/DropsMap';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export default function Map() {
  return (
    <div className="min-h-screen pb-20 p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Ghost Drops Map
          </h1>
          <p className="text-muted-foreground">
            Discover ghost drops near you. Glowing areas indicate approximate locations where QR codes are hidden.
          </p>
        </header>
        
        <DropsMap />
      </div>
      
      <MobileNavigation />
    </div>
  );
}