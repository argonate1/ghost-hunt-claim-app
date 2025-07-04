import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/contexts/WalletConnectContext';
import { WalletConnection } from '@/components/wallet/WalletConnection';

interface Drop {
  id: string;
  title: string;
  description: string | null;
  prize: string | null;
  drop_id: string;
  latitude: number | null;
  longitude: number | null;
  min_ghox_required: number | null;
}

interface DropsMapProps {
  mapboxToken?: string;
  disableInteractions?: boolean;
  dropFilter?: string; // Filter to show only specific drop by ID
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGV2b2x2ZWRhaSIsImEiOiJjbWNubG9sMHIwOHhxMmtwdWkzMWNnOGNiIn0.emTow81IrSPSApDkLLEbwg';

export default function DropsMap({ mapboxToken = MAPBOX_TOKEN, disableInteractions = false, dropFilter }: DropsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [filteredDrops, setFilteredDrops] = useState<Drop[]>([]);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);
  const { walletAddress, hasMinimumGhox } = useWallet();

  useEffect(() => {
    fetchDropsWithCoordinates();
  }, []);

  useEffect(() => {
    // Filter drops based on GHOX requirements and optional drop filter
    let filtered = drops.filter(drop => {
      const requiredGhox = drop.min_ghox_required || 0;
      if (requiredGhox === 0) return true; // No requirement, show to everyone
      return walletAddress && hasMinimumGhox(requiredGhox);
    });
    
    // If dropFilter is provided, show only that specific drop
    if (dropFilter) {
      filtered = filtered.filter(drop => drop.id === dropFilter);
    }
    
    setFilteredDrops(filtered);
  }, [drops, walletAddress, hasMinimumGhox, dropFilter]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      zoom: 10,
      center: [-122.4194, 37.7749], // Default to San Francisco
      // Disable interactions if specified
      interactive: !disableInteractions,
      scrollZoom: !disableInteractions,
      boxZoom: !disableInteractions,
      dragRotate: !disableInteractions,
      dragPan: !disableInteractions,
      keyboard: !disableInteractions,
      doubleClickZoom: !disableInteractions,
      touchZoomRotate: !disableInteractions
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      addDropMarkers();
      addFloatingAnimation();
    });

    // Cleanup
    return () => {
      if (map.current && (map.current as any)._ghostAnimation) {
        cancelAnimationFrame((map.current as any)._ghostAnimation);
      }
      map.current?.remove();
    };
  }, [mapboxToken, filteredDrops]);

  const fetchDropsWithCoordinates = async () => {
    const { data } = await supabase
      .from('drops')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    setDrops(data || []);
  };

  const addDropMarkers = () => {
    if (!map.current) return;

    // Load ghost image
    map.current.loadImage('/lovable-uploads/1e3f2243-0025-4d35-8b63-1b74e7f3a4db.png', (error, image) => {
      if (error) throw error;
      if (!map.current || !image) return;
      
      // Add image to map
      map.current.addImage('ghost-marker', image);

      // Create individual sources and layers for each ghost
      filteredDrops.forEach((drop, index) => {
        const sourceId = `drops-${index}`;
        const layerId = `drop-ghost-${index}`;
        
        // Add individual source for each ghost
        map.current!.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [drop.longitude!, drop.latitude!]
              },
              properties: {
                id: drop.id,
                title: drop.title,
                prize: drop.prize,
                description: drop.description
              }
            }]
          }
        });

        // Add individual layer for each ghost
        map.current!.addLayer({
          id: layerId,
          type: 'symbol',
          source: sourceId,
          layout: {
            'icon-image': 'ghost-marker',
            'icon-size': {
              base: 1,
              stops: [
                [12, 0.1],
                [22, 0.3]
              ]
            },
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          }
        });

        // Add click handlers for each layer
        map.current!.on('click', layerId, (e) => {
          if (!e.features?.length) return;
          
          // Close any existing popup
          if (currentPopup.current) {
            currentPopup.current.remove();
          }
          
          const feature = e.features[0];
          const properties = feature.properties;
          
          const popup = new mapboxgl.Popup({ 
            closeButton: true,
            closeOnClick: true,
            maxWidth: '350px'
          })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-4 bg-gradient-to-br from-card/95 to-background/95 backdrop-blur-sm text-foreground rounded-xl border border-border shadow-2xl">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent pr-2">${properties?.title || 'Ghost Drop'}</h3>
                  <span class="text-2xl">👻</span>
                </div>
                
                ${properties?.prize ? `
                  <div class="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xl">🏆</span>
                      <span class="font-semibold text-primary">Prize</span>
                    </div>
                    <p class="text-sm font-medium">${properties.prize}</p>
                  </div>
                ` : ''}
                
                ${properties?.description ? `
                  <div class="mb-3">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm">📝</span>
                      <span class="text-sm font-medium text-muted-foreground">Description</span>
                    </div>
                    <p class="text-sm text-foreground/90 leading-relaxed">${properties.description}</p>
                  </div>
                ` : ''}
                
                <div class="space-y-2 pt-3 border-t border-border/50">
                  <div class="flex items-center gap-2">
                    <span class="text-xs">🔍</span>
                    <span class="text-xs text-muted-foreground">Scan the QR code in this area to claim your prize!</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs">📍</span>
                    <span class="text-xs text-muted-foreground">Ghost location is approximate</span>
                  </div>
                </div>
              </div>
            `)
            .addTo(map.current!);
            
          // Store the current popup reference and add cleanup listener
          currentPopup.current = popup;
          popup.on('close', () => {
            currentPopup.current = null;
          });
        });

        // Change cursor on hover for each layer
        map.current!.on('mouseenter', layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current!.on('mouseleave', layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      });
      
      // Fit to bounds if we have drops - moved inside the callback to ensure markers are loaded
      if (filteredDrops.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        filteredDrops.forEach(drop => {
          bounds.extend([drop.longitude!, drop.latitude!]);
        });
        // Increase padding to ensure all ghosts are fully visible
        map.current!.fitBounds(bounds, { 
          padding: { top: 150, bottom: 150, left: 150, right: 150 },
          maxZoom: 10 // Lower max zoom to show more area
        });
      }
    });
  };

  const addFloatingAnimation = () => {
    if (!map.current) return;
    
    let animationId: number;
    let startTime = Date.now();
    
    const animate = () => {
      const runtime = Date.now() - startTime;
      const seconds = runtime / 1000;
      
      // Create multiple layers for individual ghost animations
      filteredDrops.forEach((drop, index) => {
        const layerId = `drop-ghost-${index}`;
        
        if (map.current && map.current.getLayer(layerId)) {
          // Create unique phase offsets for each ghost
          const phaseOffsetX = index * 1.5;
          const phaseOffsetY = index * 2.1;
          const speedVariationX = 0.8 + (index * 0.3);
          const speedVariationY = 1.2 + (index * 0.4);
          
          const offsetX = Math.sin(seconds * speedVariationX + phaseOffsetX) * 8;
          const offsetY = Math.sin(seconds * speedVariationY + phaseOffsetY) * 5;
          
          // Apply individual transform to each ghost layer
          map.current.setPaintProperty(layerId, 'icon-translate', [offsetX, offsetY]);
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Store animation ID to clean up later
    (map.current as any)._ghostAnimation = animationId;
  };


  return (
    <div className="relative w-full h-[800px] overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* No drops message */}
      {drops.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-2">No drops with coordinates found</p>
            <p className="text-sm text-muted-foreground">Add coordinates to drops in the admin panel to see them on the map</p>
          </div>
        </div>
      )}
      
      {/* Wallet connection prompt */}
      {drops.length > 0 && filteredDrops.length === 0 && !walletAddress && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-3">Connect Wallet to See Drops</h3>
            <p className="text-muted-foreground mb-4">
              Some drops require a minimum $GHOX balance to view. Connect your wallet to see all available drops.
            </p>
            <WalletConnection compact={false} />
          </div>
        </div>
      )}
      
      {/* Insufficient GHOX message */}
      {drops.length > 0 && filteredDrops.length === 0 && walletAddress && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-2">No drops available at your current GHOX level</p>
            <p className="text-sm text-muted-foreground">Acquire more $GHOX tokens to unlock premium drops</p>
          </div>
        </div>
      )}
    </div>
  );
}