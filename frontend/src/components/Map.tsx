'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '../../store/auth-store';
import { useLayerStore } from '../../store/layer-store';
import MapControls from './MapControls';

// Algiers coordinates
const MAP_CENTER: [number, number] = [36.7538, 3.0588];
const DEFAULT_ZOOM = 12;

export default function Map() {
  const { isAuthenticated } = useAuthStore();
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

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
        </MapContainer>

        {/* Map Controls */}
        <MapControls />

        {/* Map Info */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              الموقع: العاصمة الجزائر
            </span>
            <span className="text-xs text-gray-500">
              •
            </span>
            <span className="text-sm text-gray-600">
              Zoom: {DEFAULT_ZOOM}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
