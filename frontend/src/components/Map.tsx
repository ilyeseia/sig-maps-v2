'use client';

import { useEffect, useRef, useState } from 'react';

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        
        if (typeof L === 'undefined') {
          console.error('Leaflet failed to load');
          return;
        }

        if (!mapInstance.current) {
          mapInstance.current = L.map(mapRef.current, {
            center: [36.7538, 3.0588] as [number, number],
            zoom: 12,
            zoomControl: true,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
          }).addTo(mapInstance.current);

          setIsMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

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
