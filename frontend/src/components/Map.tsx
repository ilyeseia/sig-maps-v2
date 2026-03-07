'use client';

import { useEffect, useRef, useState } from 'react';

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const eventListenersRef = useRef<Array<() => void>>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    const loadMap = async () => {
      try {
        const L = await import('leaflet');

        if (typeof L === 'undefined') {
          console.error('Leaflet failed to load');
          return;
        }

        // Prevent double initialization
        if (mapInstance.current) {
          console.warn('Map already initialized');
          setIsMapLoaded(true);
          return;
        }

        if (!isMounted) {
          console.warn('Component unmounted during map loading');
          return;
        }

        // Initialize map
        const map = L.map(mapRef.current, {
          center: [36.7538, 3.0588] as [number, number],
          zoom: 12,
          zoomControl: true,
        });

        // Add tile layer
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        });

        tileLayer.addTo(map);

        // Store references for cleanup
        mapInstance.current = map;
        tileLayerRef.current = tileLayer;

        // Add event listeners
        const handleMoveEnd = () => {
          console.log('Map moved:', map.getBounds());
        };

        const handleZoomEnd = () => {
          console.log('Map zoomed:', map.getZoom());
        };

        map.on('moveend', handleMoveEnd);
        map.on('zoomend', handleZoomEnd);

        // Store cleanup functions
        eventListenersRef.current.push(() => {
          map.off('moveend', handleMoveEnd);
          map.off('zoomend', handleZoomEnd);
        });

        if (isMounted) {
          setIsMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    // Cleanup function
    return () => {
      isMounted = false;

      // Remove all event listeners
      eventListenersRef.current.forEach(cleanup => cleanup());
      eventListenersRef.current = [];

      // Remove tile layer
      if (tileLayerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }

      // Remove map instance
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (error) {
          console.error('Error removing map instance:', error);
        } finally {
          mapInstance.current = null;
        }
      }
    };
  }, []); // Empty dependency array - run only on mount

  if (!isMapLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
