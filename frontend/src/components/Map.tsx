'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import { useAuthStore } from '../../store/auth-store';
import { useLayerStore } from '../../store/layer-store';
import { apiClient } from '../../lib/api-client';
import MapControls from './MapControls';
import DrawingManager from './DrawingManager';
import DrawingToolbar from './DrawingToolbar';

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

interface Attribute {
  key: string;
  value: string;
}

interface MapProps {
  activeTool: 'marker' | 'polyline' | 'polygon' | null;
  isEditing: boolean;
  onDrawStart: () => void;
  onDrawEnd: (feature: any) => void;
  onCancel: () => void;
}

export default function Map({ activeTool, isEditing: parentIsEditing, onDrawStart, onDrawEnd, onCancel }: MapProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { layers } = useLayerStore();

  const mapRef = useRef<L.Map | null>(null);

  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; description: string; attributes: Attribute[] }>({
    name: '',
    description: '',
    attributes: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Check if user can modify features
  const canModify = user?.role === 'EDITOR' || user?.role === 'ADMIN';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Fetch layers and features
  useEffect(() => {
    if (!isAuthenticated || features.length > 0) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [layersRes, featuresRes] = await Promise.all([
          apiClient.get('/api/layers'),
          apiClient.get('/api/features'),
        ]);

        if (layersRes.data.success) {
          // Filter layers by visibility
          const visibleLayers = layersRes.data.data.filter((layer: any) => layer.is_visible);
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
    const layerTypeValue = layerType === 'marker' ? 'point' : layerType;

    const feature: Feature = {
      id: `temp-${Date.now()}`,
      layerId: selectedLayerId || '',
      geometry: layer.toGeoJSON(),
      attributes: { name: `New ${layerType}` },
    };

    // Save to backend
    const saveFeature = async () => {
      setIsSubmitting(true);
      try {
        const response = await apiClient.post('/api/features', {
          layer_id: selectedLayerId,
          geometry: layer.toGeoJSON(),
          attributes: { name: `New ${layerType}` },
        });

        if (response.data.success) {
          // Update local state with the saved feature
          setFeatures((prev) => [...prev.filter((f) => f.id !== feature.id), response.data.data]);
          onDrawEnd(response.data.data);
        }
      } catch (error) {
        console.error('Error saving feature:', error);
        // Remove the layer if save failed
        mapRef.current?.removeLayer(layer);
      } finally {
        setIsSubmitting(false);
      }
    };

    saveFeature();
    onDrawDrawEnd();
  }, [mapRef, selectedLayerId, onDrawEnd]);

  const handleFeatureSelect = (feature: Feature) => {
    setSelectedFeature(feature);
    setEditForm({
      name: feature.attributes?.name || '',
      description: feature.attributes?.description || '',
      attributes: feature.attributes?.extra || [],
    });
    onDrawStart();
  };

  const handleFeatureDelete = async () => {
    if (!selectedFeature) return;

    setIsSubmitting(true);
    try {
      await apiClient.delete(`/api/features/${selectedFeature.id}`);
      setFeatures((prev) => prev.filter((f) => f.id !== selectedFeature.id));
      setSelectedFeature(null);
      onCancel();
    } catch (error) {
      console.error('Error deleting feature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttributeChange = (index: number, key: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => (i === index ? { key, value } : attr)),
    }));
  };

  const handleAddAttribute = () => {
    setEditForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: '' }],
    }));
  };

  const handleRemoveAttribute = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
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
          extra: editForm.attributes,
        },
      });

      if (response.data.success) {
        setFeatures((prev) =>
          prev.map((f) => (f.id === selectedFeature.id ? response.data.data : f)),
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

  const eachFeatureData = (feature: Feature, layer: any) => {
    if (feature.layer?.style) {
      layer.setStyle(feature.layer.style);
    }
  };

  const onFeatureClick = (e: any) => {
    const layer = e.target;
    const featureData = layer.feature.properties as Feature;
    handleFeatureSelect(featureData);
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
      {/* Main Map Area */}
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
              edit={{
                remove: isDeleting,
              }}
            />
          )}

          {features.map((feature) => (
            <GeoJSON
              key={feature.id}
              data={feature.geometry}
              onEachFeature={eachFeatureData}
              eventHandlers={{
                click: onFeatureClick,
              }}
            />
          ))}
        </MapContainer>

        {/* Map Controls */}
        <MapControls
          onLayerSelect={handleLayerSelect}
          layers={layers}
          selectedLayerId={selectedLayerId}
          isEditing={parentIsEditing}
        />

        {/* Drawing Manager */}
        <DrawingManager
          activeTool={activeTool}
          isEditing={parentIsEditing}
          onDrawStart={onDrawStart}
          onDrawEnd={onDrawEnd}
          selectedLayerId={selectedLayerId}
        />

        {/* Drawing Toolbar */}
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

      {/* Feature Edit Panel */}
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
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Attributes</label>
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Attribute
                  </button>
                </div>

                <div className="space-y-2">
                  {editForm.attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Key"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(index, e.target.value, attr.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, attr.key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={() => handleRemoveAttribute(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {canModify && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleFeatureDelete}
                    disabled={isSubmitting || !canModify}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
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

let layer: any;
function onDrawDrawEnd() {
  if (layer) {
    layer.addTo(layer._map);
  }
}
