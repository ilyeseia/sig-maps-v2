// @ts-nocheck
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
    geometryType: string;
    style: any;
  };
}

interface FeaturesResponse {
  features: Feature[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  spatialFilter: boolean;
}

export default function MapWithViewport() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const featuresLayerRef = useRef<any>(null);

  const loadFeatures = useCallback(async (bbox?: string) => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    loadTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      try {
        const url = buildFeaturesUrl(
          process.env.NEXT_PUBLIC_API_URL + '/features',
          bbox,
          1,
          200
        );
        console.log('Fetching features from:', url);
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, { headers });
        console.log('API response status:', response.status);
        if (response.ok) {
          const data: FeaturesResponse = await response.json();
          console.log('API response data:', data);
          console.log('Setting features:', data.features.length, 'features');
          setFeatures(data.features);
          console.log(`Loaded ${data.features.length} features with spatial filter: ${data.spatialFilter}`);
          setError('');
        } else if (response.status === 401) {
          setError('Please login to view features');
          setFeatures([]);
        } else {
          console.error('Error loading features:', response.status);
          setError('Failed to load features');
          setFeatures([]);
        }
      } catch (error) {
        console.error('Error loading features:', error);
        setError('Failed to load features');
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    let isMounted = true;

    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        if (typeof L === 'undefined') {
          if (isMounted) setError('Failed to load map library');
          return;
        }

        // Store Leaflet reference for later use
        leafletRef.current = L;

        if (mapInstance.current) {
          setIsMapLoaded(true);
          return;
        }
        if (!isMounted) return;

        const map = L.map(mapRef.current, {
          center: [36.7538, 3.0588] as [number, number],
          zoom: 12,
          zoomControl: true,
        });

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        });
        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;
        mapInstance.current = map;

        // Create a layer group for features
        featuresLayerRef.current = L.layerGroup().addTo(map);

        const handleMoveEnd = () => {
          if (isMounted && mapInstance.current) {
            const bbox = getBboxFromBounds(mapInstance.current.getBounds());
            loadFeatures(bbox);
          }
        };
        const handleZoomEnd = () => {
          if (isMounted && mapInstance.current) {
            const bbox = getBboxFromBounds(mapInstance.current.getBounds());
            loadFeatures(bbox);
          }
        };
        map.on('moveend', handleMoveEnd);
        map.on('zoomend', handleZoomEnd);

        if (isMounted) {
          setIsMapLoaded(true);
          loadFeatures();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted) setError('Failed to initialize map');
      }
    };
    loadMap();

    return () => {
      isMounted = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loadFeatures]);

    console.log("=== FEATURES DEBUG ===", { hasL: !!leafletRef.current, hasMap: !!mapInstance.current, hasLayer: !!featuresLayerRef.current, count: features.length });
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstance.current;
    const featuresLayer = featuresLayerRef.current;

    console.log("=== RENDER ===", {L:!!L, map:!!map, layer:!!featuresLayer, count:features.length});
    if (!L || !map || !featuresLayer) { console.log("Missing deps"); return; }
    if (features.length === 0) { console.log("No features yet"); return; }
    console.log("Rendering", features.length, "features");

    // Clear previous features
    featuresLayer.clearLayers();

    features.forEach((feature) => {
      const { geometry, layer: featureLayer } = feature;
      const style = featureLayer.style || {};
      let leafletLayer: any;

      switch (featureLayer.geometryType) {
        case 'POINT':
          leafletLayer = L.marker([geometry.coordinates[1], geometry.coordinates[0]]);
          break;
        case 'LINE':
          leafletLayer = L.polyline(
            geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
            {
              color: style.color || '#3B82F6',
              weight: style.line_width || 2,
              opacity: style.opacity || 0.7,
            }
          );
          break;
        case 'POLYGON':
          leafletLayer = L.polygon(
            geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]),
            {
              color: style.color || '#3B82F6',
              fillColor: style.fill_color || style.color,
              fillOpacity: style.fill_opacity || 0.3,
              weight: style.line_width || 2,
              opacity: style.opacity || 0.7,
            }
          );
          break;
        default:
          return;
      }

      if (leafletLayer) {
        leafletLayer.bindPopup(`
          <div>
            <strong>${featureLayer.name_ar || featureLayer.name_fr}</strong>
            <p>Feature ID: ${feature.id}</p>
            ${Object.entries(feature.attributes || {})
              .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
              .join('')}
          </div>
        `);
        leafletLayer.addTo(featuresLayer);
      }
    });
  }, [features]);

  if (!isMapLoaded) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-700 font-medium">جاري تحميل الخريطة...</p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-sm text-gray-700">
          <p className="font-semibold">الحالة</p>
          <p className="mt-1">{loading ? 'جاري التحميل...' : `الميزات: ${features.length}`}</p>
          {error && <p className="text-red-600 mt-1 text-xs">{error}</p>}
        </div>
      </div>
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-sm text-gray-700">
          <p className="font-semibold">SIG Maps V2</p>
          <p className="text-xs text-gray-500">تحريك، بان، ثم تكبير لعرض المزيد</p>
        </div>
      </div>
    </div>
  );
}
