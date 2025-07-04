import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Calendar, Trophy, Zap, Info } from 'lucide-react';
import DropsMap from '@/components/map/DropsMap';
import { useIsMobile } from '@/hooks/use-mobile';

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
  drop_id?: string;
}

interface DropCardProps {
  drop: Drop;
}

export function DropCard({ drop }: DropCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const isMobile = useIsMobile();
  const isExpired = drop.expires_at && new Date(drop.expires_at) < new Date();
  const timeAgo = formatDistanceToNow(new Date(drop.created_at), { addSuffix: true });
  
  // Check if drop has location coordinates
  const hasLocation = drop.latitude && drop.longitude;

  const DropDetailsContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-3xl ghost-float">👻</span>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{drop.title}</h2>
          <p className="text-muted-foreground mt-1">{timeAgo}</p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="font-medium">Description</span>
        </div>
        <p className="text-foreground leading-relaxed pl-6">{drop.description}</p>
      </div>

      {/* Prize */}
      {drop.prize && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-medium">Prize</span>
          </div>
          <div className="pl-6">
            <span className="text-lg font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {drop.prize}
            </span>
          </div>
        </div>
      )}

      {/* Requirements */}
      {drop.min_ghox_required && drop.min_ghox_required > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">Requirements</span>
          </div>
          <div className="pl-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {drop.min_ghox_required} GHOX required
            </Badge>
          </div>
        </div>
      )}

      {/* Expiration */}
      {drop.expires_at && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">Expires</span>
          </div>
          <div className="pl-6">
            <span className={`text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
              {isExpired ? 'Expired' : `${formatDistanceToNow(new Date(drop.expires_at), { addSuffix: true })}`}
            </span>
          </div>
        </div>
      )}

      {/* Map */}
      {hasLocation && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">Location</span>
          </div>
          <div className="h-[300px] rounded-lg overflow-hidden border border-border">
            <DropsMap 
              disableInteractions={false}
              dropFilter={drop.id}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <h4 className="font-medium mb-2">How to claim:</h4>
        <ol className="text-sm text-muted-foreground space-y-1">
          <li>1. {hasLocation ? 'Visit the location shown on the map' : 'Find the QR code at the drop location'}</li>
          <li>2. Scan the QR code with your phone</li>
          <li>3. Complete the claim process</li>
          <li>4. Receive your prize! 🎉</li>
        </ol>
      </div>
    </div>
  );

  const TriggerCard = () => (
    <Card className="bg-card/80 backdrop-blur-sm border-border hover:glow-ethereal transition-smooth cursor-pointer">
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
              <MapPin className="h-4 w-4 text-primary" />
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
        <p className="text-foreground text-sm leading-relaxed line-clamp-2">
          {drop.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          {drop.expires_at && !isExpired && (
            <div className="text-xs text-muted-foreground">
              Expires {formatDistanceToNow(new Date(drop.expires_at), { addSuffix: true })}
            </div>
          )}
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DrawerTrigger asChild>
          <div>
            <TriggerCard />
          </div>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="text-center">
              Drop Details
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            <DropDetailsContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
      <DialogTrigger asChild>
        <div>
          <TriggerCard />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Drop Details</DialogTitle>
        </DialogHeader>
        <DropDetailsContent />
      </DialogContent>
    </Dialog>
  );
}