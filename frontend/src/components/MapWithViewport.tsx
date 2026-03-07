'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getBboxFromBounds, buildFeaturesUrl } from '../lib/spatial';

interface Feature {
  id: string;
  layerId: string;
  geometry: any;
  attributes: any;
  layer: {
    id: string;
    name_ar: string;
    name_fr: string;
    geometry_type: string;
    style: any;
  };
}

interface FeaturesResponse {
  features: Feature[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  spatialFilter: boolean;
}

export default function MapWithViewport() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch features based on current viewport
  const loadFeatures = useCallback(async (bbox?: string) => {
    // Debounce to avoid too many requests
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }

    const newTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        // Build URL with bbox parameter
        const url = buildFeaturesUrl(
          process.env.NEXT_PUBLIC_API_URL + '/api/features',
          bbox,
          1, // page
          200 // limit - adjust based on needs
        );

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data: FeaturesResponse = await response.json();
          setFeatures(data.features);
          console.log(
            `Loaded ${data.features.length} features with spatial filter: ${data.spatialFilter}`
          );
        }
      } catch (error) {
        console.error('Error loading features:', error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    setLoadTimeout(newTimeout);
  }, [loadTimeout]);

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

          // Initial load features without bbox (first page)
          loadFeatures();

          // Add viewport change listener
          mapInstance.current.on('moveend', () => {
            const bbox = getBboxFromBounds(mapInstance.current.getBounds());
            loadFeatures(bbox);
          });

          // Add zoom change listener
          mapInstance.current.on('zoomend', () => {
            const bbox = getBboxFromBounds(mapInstance.current.getBounds());
            loadFeatures(bbox);
          });
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loadFeatures, loadTimeout]);

  // Add features to map
  useEffect(() => {
    if (!mapInstance.current || !isMapLoaded || features.length === 0) return;

    const addFeaturesToMap = async () => {
      const L = await import('leaflet');

      // Clear existing layers (if any)
      mapInstance.current.eachLayer((layer: any) => {
        if (layer !== mapInstance.current.getTileLayer) {
          mapInstance.current.removeLayer(layer);
        }
      });

      // Add features based on geometry type
      features.forEach((feature) => {
        const { geometry, layer } = feature;
        const style = layer.style || {};

        let layer: any;

        switch (feature.layer.geometry_type) {
          case 'POINT':
            layer = L.marker([geometry.coordinates[1], geometry.coordinates[0]]);
            break;
          case 'LINE':
            layer = L.polyline(
              geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
              {
                color: style.color || '#3B82F6',
                weight: style.line_width || 2,
                opacity: style.opacity || 0.7,
              }
            );
            break;
          case 'POLYGON':
            layer = L.polygon(
              geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]),
              {
                color: style.color || '#3B82F6',
                fillColor: style.fill_color || '#3B82F6',
                fillOpacity: style.fill_opacity || 0.3,
                weight: style.line_width || 2,
                opacity: style.opacity || 0.7,
              }
            );
            break;
          default:
            console.warn('Unknown geometry type:', feature.layer.geometry_type);
            return;
        }

        if (layer) {
          layer.bindPopup(`
            <div>
              <strong>${layer.name_ar || layer.name_fr}</strong>
              <p>Feature ID: ${feature.id}</p>
              ${Object.entries(feature.attributes || {})
                .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                .join('')}
            </div>
          `);
          layer.addTo(mapInstance.current);
        }
      });
    };

    addFeaturesToMap();
  }, [features, isMapLoaded]);

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

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-[1000]">
          <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-3 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span className="text-sm text-gray-700">Loading features...</span>
          </div>
        </div>
      )}

      {/* Feature count */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-3">
          <span className="text-sm text-gray-700">
            {features.length} features loaded
          </span>
        </div>
      </div>
    </div>
  );
}
