'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '../../store/auth-store';
import { apiClient } from '../../lib/api-client';
import MapControls from './MapControls';

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
  const { isAuthenticated, user } = useAuthStore();
  const mapRef = useRef<L.Map | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [layers, setLayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; description: string; }>({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user can modify features
  const canModify = user?.role === 'EDITOR' || user?.role === 'ADMIN';

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
    setIsEditing(false);
    setIsDeleting(false);
    setEditForm({
      name: feature.attributes?.name || '',
      description: feature.attributes?.description || '',
    });
  };

  // Handle feature update
  const handleUpdateFeature = async () => {
    if (!selectedFeature) return;

    setIsSubmitting(true);

    try {
      const updateData = {
        attributes: {
          ...selectedFeature.attributes,
          name: editForm.name,
          description: editForm.description,
        },
      };

      await apiClient.put(`/features/${selectedFeature.id}`, updateData);

      // Refresh features
      const featuresData: any = await apiClient.get('/features');
      setFeatures(featuresData.features || []);

      // Update selected feature in state
      const updatedFeature = featuresData.features?.find((f: Feature) => f.id === selectedFeature.id);
      setSelectedFeature(updatedFeature);
      setIsEditing(false);

      // Show success message (placeholder - could add toast later)
      console.log('✅ Feature updated successfully');
    } catch (error: any) {
      console.error('Failed to update feature:', error);
      alert('فشل تحديث الميزة: ' + (error.message || 'Unknown error'));
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

      // Show success message (placeholder)
      console.log('✅ Feature deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete feature:', error);
      alert('فشل حذف الميزة: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
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

            const geoJsonStyle = () => {
              const baseStyle = {
                color: style.color || '#3B82F6',
                opacity: style.opacity || 0.7,
                weight: style.line_width || 2,
                fillColor: style.fill_color || '#3B82F6',
                fillOpacity: style.fill_opacity || 0.3,
                radius: style.marker_size || 8,
              };
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

        {/* Custom Map Controls */}
        <MapControls onResetView={() => {
          setSelectedFeature(null);
          setIsEditing(false);
          setIsDeleting(false);
        }} />

        {/* Feature Popup (when a feature is selected) */}
        {selectedFeature && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 max-w-md">
              {/* Header: Title + Close Button */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                      placeholder="اسم الميزة"
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
                {/* Close button */}
                <div className="flex items-center gap-1 ml-2">
                  {!isEditing && !isDeleting && canModify && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-gray-100 rounded-md text-gray-600"
                        title="تعديل"
                      >
                        <svg className="w-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.662 3.712 1.875 1.875 0 001.887-1.688l-3.736-3.736a1.875 1.875 0 01-.887.062L5.25 4.251l-3.736 3.736a1.875 1.875 0 01-.887-3.736L9.97 2.414a1.875 1.875 0 002.505 4.251l6.746 6.747a1.875 1.875 0 003.712 2.648c.272.27.469.531.71.865.0 .396-.192.812-.312 1.187-.09.42.383-.795.763-1.126.077-.32.166-.648.233-1 .06-.063.353-.145.688-.239 1.07-.094.386-.214.736-.358 1.065-.144.33-.326.633-.565 1.063-.239.43-.45.96-.724 1.592-.324.665-.562 1.336-.708 1.965.144.63.297 1.308.699 2.015.399.706.706 1.373 1.996 0 2.057.043.552.038 1.294.007 1.876.052 2.459.062.845.031 1.488-.14 2.922-.393 4.258-.872 5.224 2.669 1.762 6.064 2.508 8.249.437 1.855.625 3.394.969 4.907.298 2.508 3.403.258 4.258.044 1.926.393 3.392 1.926 392 4.258 6.972 50.6 1.096 56.667 0 3.238-1.499 6.411-.27.555.518-1.475.953-1.475 1.977 0 .56.551 1.148.672 1.772 1.772.947 3.258 1.732 5.507 5.507 9.754 3.255 5.507-5.507 7.048 0-1.462.474-3.05.728-3.057 5.506 0 2.518.456 4.79-1.619 2.316-4.776-2.316-8.063 0-4.288 1.526-7.975 4.549-3.057 3.258-4.776 4.478-2.788z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsDeleting(true)}
                        className="p-2 hover:bg-red-50 rounded-md text-red-600"
                        title="حذف"
                      >
                        <svg className="w-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6a2.25 2.25 0 012.25 2.25h2.25M14.25 12v2.25m2.25-6.75a2.25 2.25 0 00-4.5 0V3.75m-1.0 0A2.25 2.25 0 00-3.75 6H3.75m.375 14.25a3.75 3.75 0 00-.75 7.5h.75m0 0a3.75 3.75 0 00-.75-7.5m.75 0a3.75 3.75 0 00-.75 7.5h-.75M12 20.625c-.58 0-1.125-.031-1.647-.088-.519-.057-.963-.148-1.342-.276-.38-.128-.71-.367-.997-.664-.286-.297-6.523.654-7.5.555z" />
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
                    title={isEditing ? 'إلغاء' : 'إغلاق'}
                  >
                    {isEditing ? (
                      <svg className="w-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {isDeleting && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="أدخل اسم الميزة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="أدخل وصف الميزة (اختياري)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateFeature}
                      disabled={isSubmitting || !editForm.name.trim()}
                      className="btn btn-primary text-sm flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Feature Attributes (not editing) */}
              {!isEditing && selectedFeature.attributes && (
                <div className="text-sm text-gray-700 border-t border-gray-200 pt-3">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(selectedFeature.attributes).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-200 last:border-0">
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
