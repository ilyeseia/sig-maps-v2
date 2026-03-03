'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import { useAuthStore } from '../store/auth-store';
import { useLayerStore } from '../store/layer-store';
import { apiClient } from '../lib/api-client';
import MapControls from './MapControls';
import DrawingManager from './DrawingManager';
import DrawingToolbar from './DrawingToolbar';

const MAP_CENTER: [number, number] = [36.7538, 3.0588];
const DEFAULT_ZOOM = 12;

export default function Map({ activeTool, isEditing: parentIsEditing, onDrawStart, onDrawEnd, onCancel }: any) {
  const { isAuthenticated, user } = useAuthStore();
  const { layers, setLayers } = useLayerStore();

  const mapRef = useRef<L.Map | null>(null);

  const [features, setFeatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({ name: '', description: '', attributes: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const canModify = user?.role === 'EDITOR' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || features.length > 0) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [layersRes, featuresRes] = await Promise.all<any>([
          apiClient.get('/api/layers'),
          apiClient.get('/api/features'),
        ]);

        if (layersRes.data.success) {
          const visibleLayers = layersRes.data.data.filter((layer: any) => layer.isVisible);
          setLayers(visibleLayers);
        }

        if (featuresRes.data.success) {
          setFeatures(featuresRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, features.length, setLayers]);

  const handleDrawCreated = useCallback((e: any) => {
    if (!mapRef.current) return;

    const { layer } = e;
    const layerType = layer instanceof L.Marker ? 'marker' : layer instanceof L.Polyline ? 'polyline' : 'polygon';

    const saveFeature = async () => {
      setIsSubmitting(true);
      try {
        const response = await apiClient.post('/api/features', {
          layerId: selectedLayerId,
          geometry: layer.toGeoJSON(),
          attributes: { name: `New ${layerType}` },
        });

        if (response.data.success) {
          setFeatures((prev: any[]) => [...prev, response.data.data]);
          onDrawEnd(response.data.data);
        }
      } catch (error) {
        console.error('Error saving feature:', error);
        mapRef.current?.removeLayer(layer);
      } finally {
        setIsSubmitting(false);
      }
    };

    saveFeature();
  }, [mapRef, selectedLayerId, onDrawEnd]);

  const handleFeatureDelete = async () => {
    if (!selectedFeature) return;

    setIsSubmitting(true);
    try {
      await apiClient.delete(`/api/features/${selectedFeature.id}`);
      setFeatures((prev: any[]) => prev.filter((f: any) => f.id !== selectedFeature.id));
      setSelectedFeature(null);
      onCancel();
    } catch (error) {
      console.error('Error deleting feature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFeature) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.put(`/api/features/${selectedFeature.id}`, {
        attributes: {
          ...selectedFeature.attributes,
          name: editForm.name,
          description: editForm.description,
        },
      });

      if (response.data.success) {
        setFeatures((prev: any[]) =>
          prev.map((f: any) => (f.id === selectedFeature.id ? response.data.data : f)),
        );
        setSelectedFeature(null);
        onCancel();
      }
    } catch (error) {
      console.error('Error updating feature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLayerSelect = (layerId: string) => {
    setSelectedLayerId(layerId);
  };

  const onFeatureClick = (e: any) => {
    const layer = e.target;
    const featureData: any = layer.feature.properties;
    setSelectedFeature(featureData);
    onDrawStart();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        <MapContainer
          center={MAP_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef as React.RefObject<L.Map>}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {canModify && (
            <EditControl
              position="topright"
              onCreated={handleDrawCreated}
              draw={{
                marker: true,
                polyline: true,
                polygon: true,
                rectangle: false,
                circle: false,
                circlemarker: false,
              }}
            />
          )}

          {features.map((feature: any) => (
            <GeoJSON
              key={feature.id}
              data={feature.geometry}
              eventHandlers={{
                click: onFeatureClick,
              }}
            />
          ))}
        </MapContainer>

        <MapControls
          onLayerSelect={handleLayerSelect}
          layers={layers}
          selectedLayerId={selectedLayerId}
          isEditing={parentIsEditing}
        />

        <DrawingManager
          activeTool={activeTool}
          isEditing={parentIsEditing}
          onDrawStart={onDrawStart}
          onDrawEnd={onDrawEnd}
          selectedLayerId={selectedLayerId}
        />

        {canModify && (
          <DrawingToolbar
            activeTool={activeTool}
            isEditing={parentIsEditing}
            onToolSelect={(tool) => {
              if (tool === null) {
                onCancel();
              }
            }}
          />
        )}
      </div>

      {selectedFeature && (
        <div className="w-96 bg-white shadow-xl overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Feature</h2>
              <button
                onClick={() => {
                  setSelectedFeature(null);
                  onCancel();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm((prev: any) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-3">
              {canModify && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleFeatureDelete}
                    disabled={isSubmitting || !canModify}
                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-center text-gray-600">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
