import React, { useEffect, useState } from 'react';
import { DropCard } from '@/components/drops/DropCard';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    const fetchDrops = async () => {
      const { data } = await supabase
        .from('drops')
        .select('id, title, description, prize, created_at, expires_at, min_ghox_required, latitude, longitude')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setDrops(data || []);
    };

    fetchDrops();
  }, []);

  return (
    <div className="min-h-screen pb-20 p-4">
      <header className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Ghost Feed
            </h1>
            <p className="text-muted-foreground">Latest ghost drops waiting to be claimed</p>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {drops.map((drop: any) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>

      <MobileNavigation />
    </div>
  );
}