import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { formatDistanceToNow } from 'date-fns';
import { MapPin } from 'lucide-react';
import DropsMap from '@/components/map/DropsMap';

interface Drop {
  id: string;
  title: string;
  description: string;
  prize?: string;
  created_at: string;
  expires_at?: string;
  min_ghox_required?: number;
  latitude?: number;
  longitude?: number;
}

interface DropCardProps {
  drop: Drop;
}

export function DropCard({ drop }: DropCardProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const isExpired = drop.expires_at && new Date(drop.expires_at) < new Date();
  const timeAgo = formatDistanceToNow(new Date(drop.created_at), { addSuffix: true });
  
  // Check if drop has location coordinates
  const hasLocation = drop.latitude && drop.longitude;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border hover:glow-ethereal transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl ghost-float">👻</span>
            <div className="flex-1">
              <CardTitle className="text-lg text-foreground">{drop.title}</CardTitle>
              {drop.prize && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {drop.prize}
                  </span>
                </div>
              )}
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {timeAgo}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasLocation && (
              <Drawer open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DrawerTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle className="text-center">
                      📍 {drop.title} Location
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4 h-full">
                    <DropsMap 
                      disableInteractions={false}
                      dropFilter={drop.id}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-foreground text-sm leading-relaxed">
          {drop.description}
        </p>
        
        {drop.expires_at && !isExpired && (
          <div className="mt-3 text-xs text-muted-foreground">
            Expires {formatDistanceToNow(new Date(drop.expires_at), { addSuffix: true })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}