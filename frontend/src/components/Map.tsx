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

export default function Map({ activeTool, isEditing, onDrawStart, onDrawEnd, onCancel }: MapProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { layers } = useLayerStore();
  
  const mapRef = useRef<L.Map | null>(null);
  
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
        // Fetch layers
        const layersData: any = await apiClient.get('/layers');
        
        // Fetch features
        const featuresData: any = await apiClient.get('/features');
        setFeatures(featuresData.features || []);
        
        console.log('✅ Loaded features:', featuresData.features.length);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, features.length]);

  // Get visible layers
  const visibleLayers = layers.filter((layer: any) => layer.is_visible);

  // Filter features by visible layers
  const visibleFeatures = features.filter((feature) =>
    visibleLayers.some((layer: any) => layer.id === feature.layerId)
  );

  // Handle feature selection
  const handleFeatureClick = useCallback((feature: Feature) => {
    setSelectedFeature(feature);
    setIsEditing(false);
    setIsDeleting(false);
    setEditForm({
      name: feature.attributes?.name || '',
      description: feature.attributes?.description || '',
      attributes: Object.entries(feature.attributes || {})
        .filter(([key]) => !['name', 'description'].includes(key))
        .map(([key, value]) => ({ key, value: String(value) })),
    });
    console.log('✅ Selected feature:', feature.attributes?.name);
  }, []);

  // Handle feature update
  const handleUpdateFeature = async () => {
    if (!selectedFeature || !editForm.name.trim()) return;

    setIsSubmitting(true);

    try {
      const attributes: any = {
        name: editForm.name,
        description: editForm.description || null,
      };
      
      // Add custom attributes
      editForm.attributes.forEach(attr => {
        if (attr.key && attr.value) {
          attributes[attr.key] = attr.value;
        }
      });

      const updateData = { attributes };

      await apiClient.put(`/features/${selectedFeature.id}`, updateData);

      // Refresh features
      const featuresData: any = await apiClient.get('/features');
      setFeatures(featuresData.features || []);

      // Update selected feature in state
      const updatedFeature = featuresData.features?.find((f: Feature) => f.id === selectedFeature.id);
      setSelectedFeature(updatedFeature || null);
      setIsEditing(false);

      console.log('✅ Feature updated successfully');
    } catch (error: any) {
      console.error('Failed to update feature:', error);
      alert(`فشل تحديث الميزة: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle feature delete
  const handleDeleteFeature = async () => {
    if (!selectedFeature) return;

    setIsSubmitting(true);

    try {
      await apiClient.delete(`/features/${selectedFeature.id}`);

      // Refresh features
      const featuresData: any = await apiClient.get('/features');
      setFeatures(featuresData.features || []);

      // Clear selection
      setSelectedFeature(null);
      setIsDeleting(false);

      console.log('✅ Feature deleted successfully');
      alert('تم حذف النقطة بنجاح');
    } catch (error: any) {
      console.error('Failed to delete feature:', error);
      alert(`فشل حذف الميزة: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new attribute field
  const handleAddAttribute = () => {
    setEditForm(prev => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: '' }],
    }));
  };

  // Update attribute
  const handleUpdateAttribute = (index: number, field: 'key' | 'value', value: string) => {
    setEditForm(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  // Remove attribute
  const handleRemoveAttribute = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  // Handle created feature from drawing
  const handleFeatureCreated = useCallback((e: any) => {
    const layer = e.layer;
    const geoJSON = layer.toGeoJSON();
    
    console.log('✅ New feature drawn:', geoJSON);
    
    // For now, just log - will implement save flow in next step
    onDrawEnd(geoJSON);
    
    // In production:
    // 1. Open form popup
    // 2. Fill in attributes
    // 3. POST /api/features
    // 4. Convert to permanent feature
  }, [onDrawEnd]);

  // Handle deleted features
  const handleFeatureDeleted = useCallback((e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      const featureId = layer.feature?.id;
      if (featureId) {
        console.log('✅ Feature deleted:', featureId);
      }
    });
  }, []);

  // Handle drawing start
  const handleDrawStart = useCallback(() => {
    setIsDrawing(true);
    onDrawStart();
    console.log('✏️ Drawing started');
  }, [onDrawStart]);

  // Handle drawing stop
  const handleDrawStop = useCallback(() => {
    setIsDrawing(false);
    console.log('✏️ Drawing stopped');
  }, []);

  // Filter layers by geometry type for drawing
  const getLayersForDrawing = (geometryType: string) => {
    return visibleLayers.filter((layer: any) => 
      layer.geometry_type === geometryType && !layer.is_readonly
    );
  };

  // Build EditControl draw options based on active tool
  const buildDrawOptions = useCallback(() => {
    const drawOptions: any = {
      polyline: false,
      polygon: false,
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false,
    };

    if (activeTool === 'marker') {
      drawOptions.marker = {
        icon: L.divIcon({
          className: 'custom-marker-icon',
          html: `<div style="background: #EF4444; border: 2px solid white; border-radius: 50%; width: 25px; height: 25px;"></div>`,
          iconSize: [25, 25],
          iconAnchor: [12.5, 12.5],
        }),
      };
    } else if (activeTool === 'polyline') {
      drawOptions.polyline = {
        shapeOptions: {
          color: '#3B82F6',
          weight: 3,
        },
      };
    } else if (activeTool === 'polygon') {
      drawOptions.polygon = {
        shapeOptions: {
          color: '#3B82F6',
          weight: 2,
          fillColor: '#3B82F6',
          fillOpacity: 0.3,
        },
      };
    }

    return drawOptions;
  }, [activeTool]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const drawOptions = buildDrawOptions();

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full relative">
        <MapContainer
          center={MAP_CENTER}
          zoom={DEFAULT_ZOOM}
          className="w-full h-full z-0"
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(mapInstance: L.Map) => {
            mapRef.current = mapInstance;
            (window as any).map = mapInstance;
          }}
        >
          {/* Base Layer - OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={20}
            minZoom={1}
          />

          {/* Render Existing Features */}
          {visibleFeatures.map((feature) => {
            const layer = layers.find((l: any) => l.id === feature.layerId);
            const style = layer?.style || {};

            const geoJsonStyle = () => {
              return {
                color: style.color || '#3B82F6',
                opacity: style.opacity || 0.7,
                weight: style.line_width || 2,
                fillColor: style.fill_color || '#3B82F6',
                fillOpacity: style.fill_opacity || 0.3,
                radius: style.marker_size || 8,
              };
            };

            return (
              <GeoJSON
                key={feature.id}
                data={feature.geometry}
                style={geoJsonStyle}
                onEachFeature={(featureLayer, layerItem) => {
                  const leafletLayer = layerItem as L.GeoJSON<any>;
                  leafletLayer.on('click', () => handleFeatureClick(feature));
                }}
              />
            );
          })}

          {/* Drawing Controls - react-leaflet-draw */}
          {canModify && activeTool && (
            <EditControl
              position="topright"
              onCreated={handleFeatureCreated}
              onDeleted={handleFeatureDeleted}
              onDrawStart={handleDrawStart}
              onDrawStop={handleDrawStop}
              edit={{
                featureGroup: new L.FeatureGroup(),
              }}
              draw={drawOptions}
            />
          )}
        </MapContainer>

        {/* Custom Map Controls */}
        <MapControls onResetView={() => {
          setSelectedFeature(null);
          setIsEditing(false);
          setIsDeleting(false);
          setSelectedLayerId(null);
        }} />

        {/* Drawing Status Indicator */}
        {isDrawing && activeTool && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-blue-500 text-white text-sm px-4 py-2 rounded-full shadow-md">
            {activeTool === 'marker' && '📍 رسم نقطة...'}
            {activeTool === 'polyline' && '〰 رسم خط...'}
            {activeTool === 'polygon' && '🔷 رسم منطقة...'}
            <button
              onClick={onCancel}
              className="mr-2 hover:bg-white/20 rounded-full p-1"
              title="إلغاء"
            >
              ✕
            </button>
          </div>
        )}

        {/* Feature Popup (when a feature is selected) */}
        {selectedFeature && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 max-w-md max-h-[80vh] overflow-y-auto">
              {/* Header: Title + Close Button */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                      placeholder="اسم الميزة *"
                    />
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900">
                        {selectedFeature.attributes?.name || selectedFeature.layer?.name_ar || 'Feature'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedFeature.geometry?.type} • {selectedFeature.layer?.name_ar}
                      </p>
                    </>
                  )}
                </div>
                {/* Edit/Delete/Close buttons */}
                <div className="flex items-center gap-1 ml-2">
                  {!isEditing && !isDeleting && canModify && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-gray-100 rounded-md text-gray-600"
                        title="تعديل"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.662 3.712 1.875 1.875 0 001.887-1.688l-3.736-3.736a1.875 1.875 0 01-.887.062L5.25 4.251l-3.736 3.736a1.875 1.875 000-1-2-2h-2.25v13.5A2.25 2.25 0 007.5 21h9a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsDeleting(true)}
                        className="p-2 hover:bg-red-50 rounded-md text-red-600"
                        title="حذف"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsDeleting(false);
                      setSelectedFeature(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-md text-gray-600"
                    title={isEditing ? 'إلغاء' : 'إغلا'}
                  >
                    {isEditing ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Delete Confirmation Dialog */}
              {isDeleting && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  <p className="text-sm text-red-800 mb-3">
                    هل أنت متأكد من حذف هذه الميزة؟
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteFeature}
                      disabled={isSubmitting}
                      className="btn btn-danger text-sm"
                    >
                      {isSubmitting ? 'جاري الحذف...' : 'نعم، احذف'}
                    </button>
                    <button
                      onClick={() => setIsDeleting(false)}
                      className="btn btn-secondary text-sm"
                      disabled={isSubmitting}
                    >
                      لا
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              {isEditing && (
                <div className="space-y-3">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="أدخل اسم الميزة"
                    />
                    {isSubmitting && !editForm.name.trim() && (
                      <p className="text-red-600 text-xs mt-1">الاسم مطلوب</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف (اختياري)
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="أدخل وصف الميزة"
                    />
                  </div>

                  {/* Custom Attributes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        السمات المخصصة
                      </label>
                      <button
                        onClick={handleAddAttribute}
                        className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        إضافة
                      </button>
                    </div>

                    {/* Attribute Fields */}
                    <div className="space-y-2">
                      {editForm.attributes.map((attr, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <input
                            type="text"
                            placeholder="اسم السمة"
                            value={attr.key}
                            onChange={(e) => handleUpdateAttribute(index, 'key', e.target.value)}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="القيمة"
                            value={attr.value}
                            onChange={(e) => handleUpdateAttribute(index, 'value', e.target.value)}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            onClick={() => handleRemoveAttribute(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                            title="حذف السمة"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpdateFeature}
                      disabled={isSubmitting || !editForm.name.trim()}
                      className="btn btn-primary text-sm flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary text-sm"
                      disabled={isSubmitting}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* View Mode: Show Attributes */}
              {!isEditing && !isDeleting && selectedFeature.attributes && selectedFeature.id && (
                <div className="text-sm text-gray-700 border-t border-gray-200 pt-3">
                  {selectedFeature.attributes.name && (
                    <div className="mb-2">
                      <span className="font-medium">الاسم:</span>
                      <span className="mr-2">{selectedFeature.attributes.name}</span>
                    </div>
                  )}
                  {selectedFeature.attributes.description && (
                    <div className="mb-2">
                      <span className="font-medium">الوصف:</span>
                      <span className="mr-2">{selectedFeature.attributes.description}</span>
                    </div>
                  )}
                  
                  {/* Custom Attributes */}
                  {Object.entries(selectedFeature.attributes || {})
                    .filter(([key]) => !['name', 'description'].includes(key))
                    .length > 0 && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-2">السمات:</h4>
                      <table className="w-full">
                        <tbody>
                          {Object.entries(selectedFeature.attributes || {})
                            .filter(([key]) => !['name', 'description'].includes(key))
                            .map(([key, value]) => (
                              <tr key={key} className="border-b border-gray-200 last:border-0">
                                <td className="py-1 px-2 font-semibold text-gray-900">{key}</td>
                                <td className="py-1 px-2 text-gray-600">{String(value)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
