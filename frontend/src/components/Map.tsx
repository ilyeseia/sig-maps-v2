'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '../../store/auth-store';
import { apiClient } from '../../lib/api-client';

// Algiers coordinates
const MAP_CENTER: [number, number] = [36.7538, 3.0588];
const DEFAULT_ZOOM = 12;

interface Feature {
  id: string;
  layerId: string;
  geometry: any;
  attributes: any;
  layer?: {
    id: string;
    name_ar: string;
    name_fr: string;
    geometry_type: string;
    style?: any;
  };
}

export default function Map() {
  const { isAuthenticated } = useAuthStore();
  const mapRef = useRef<L.Map | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [layers, setLayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Fetch layers and features
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch layers
        const layersData: any = await apiClient.get('/layers');
        setLayers(layersData.layers);

        // Fetch features
        const featuresData: any = await apiClient.get('/features');
        setFeatures(featuresData.features || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Get visible layers
  const visibleLayers = layers.filter((layer) => layer.is_visible);

  // Filter features by visible layers
  const visibleFeatures = features.filter((feature) =>
    visibleLayers.some((layer) => layer.id === feature.layerId)
  );

  // Handle feature click
  const handleFeatureClick = (feature: any) => {
    setSelectedFeature(feature);
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full relative">
        <MapContainer
          center={MAP_CENTER}
          zoom={DEFAULT_ZOOM}
          className="w-full h-full z-0"
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map: L.Map) => {
            mapRef.current = map;
            (window as any).map = map;
          }}
        >
          {/* Base Layer - OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={20}
            minZoom={1}
          />

          {/* Render Features */}
          {visibleFeatures.map((feature) => {
            const layer = layers.find((l) => l.id === feature.layerId);
            const style = layer?.style || {};

            const geoJsonStyle = (feature: any) => {
              const baseStyle = {
                color: style.color || '#3B82F6',
                opacity: style.opacity || 0.7,
                weight: style.line_width || 2,
                fillColor: style.fill_color || '#3B82F6',
                fillOpacity: style.fill_opacity || 0.3,
                radius: style.marker_size || 8,
              };

              // Apply base style
              return baseStyle;
            };

            return (
              <GeoJSON
                key={feature.id}
                data={feature.geometry}
                style={geoJsonStyle}
                onEachFeature={(featureLayer, layer) => {
                  const leafletLayer = layer as L.GeoJSON<any>;
                  leafletLayer.on('click', () => handleFeatureClick(feature));
                }}
              />
            );
          })}
        </MapContainer>

        {/* Feature Popup (when a feature is selected) */}
        {selectedFeature && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 max-w-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedFeature.attributes?.name || selectedFeature.layer?.name_ar || 'Feature'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedFeature.geometry?.type}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="p-2 hover:bg-gray-100 rounded-md text-gray-600"
                  title="إغلاق"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedFeature.attributes && (
                <div className="text-sm text-gray-700">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(selectedFeature.attributes).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-200">
                          <td className="py-1 px-2 font-medium text-gray-900">{key}</td>
                          <td className="py-1 px-2 text-gray-600">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
