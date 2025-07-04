import React from 'react';
import DropsMap from '@/components/map/DropsMap';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export default function Map() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-7xl mx-auto">
        <DropsMap />
      </div>
      
      <MobileNavigation />
    </div>
  );
}