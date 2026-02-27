'use client';

import { useState, useEffect } from 'react';
import { useLayerStore } from '../store/layer-store';
import { apiClient } from '../lib/api-client';

interface LayerPanelProps {
  onClose: () => void;
}

export default function LayerPanel({ onClose }: LayerPanelProps) {
  const { layers, setLayers, toggleLayerVisibility, isVisible, togglePanel } = useLayerStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateLayer, setShowCreateLayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLayer, setNewLayer] = useState({
    name_ar: '',
    name_fr: '',
    geometry_type: 'POINT' as 'POINT' | 'LINE' | 'POLYGON',
    is_visible: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Fetch layers on mount
  useEffect(() => {
    fetchLayers();
  }, []);

  const fetchLayers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data: any = await apiClient.get('/layers');
      setLayers(data.layers);
    } catch (err: any) {
      setError('Failed to load layers');
      console.error('Failed to load layers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter layers by search query
  const filteredLayers = layers.filter((layer) =>
    searchQuery === '' ||
    layer.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    layer.name_fr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const data: any = await apiClient.post('/layers', newLayer);
      
      // Refresh layers
      await fetchLayers();
      
      // Reset form
      setNewLayer({
        name_ar: '',
        name_fr: '',
        geometry_type: 'POINT',
        is_visible: true,
      });
      setShowCreateLayer(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create layer');
    } finally {
      setIsCreating(false);
    }
  };

  if (showCreateLayer) {
    return (
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-20 flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">إنشاء طبقة جديدة</h2>
          <button
            onClick={() => setShowCreateLayer(false)}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-600"
            title="إلغاء"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Create Layer Form */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateLayer} className="space-y-4">
            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم (العربية)
              </label>
              <input
                type="text"
                value={newLayer.name_ar}
                onChange={(e) => setNewLayer({ ...newLayer, name_ar: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="مثال: أنابيب المياه"
              />
            </div>

            {/* French Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={newLayer.name_fr}
                onChange={(e) => setNewLayer({ ...newLayer, name_fr: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Ex: conduites d'eau"
              />
            </div>

            {/* Geometry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع العنصر
              </label>
              <select
                value={newLayer.geometry_type}
                onChange={(e) => setNewLayer({ ...newLayer, geometry_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="POINT">نقطة</option>
                <option value="LINE">خط</option>
                <option value="POLYGON">منطقة</option>
              </select>
            </div>

            {/* Visibility */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isVisible"
                checked={newLayer.is_visible}
                onChange={(e) => setNewLayer({ ...newLayer, is_visible: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-700">
                ظاهر في الخريطة
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCreating || !newLayer.name_ar || !newLayer.name_fr}
              className="w-full btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'جاري الإنشاء...' : 'إنشاء طبقة'}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setShowCreateLayer(false)}
              className="w-full btn btn-secondary text-sm"
            >
              إلغاء
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-20 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">الطبقات</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateLayer(true)}
            className="p-2 hover:bg-gray-100 rounded-md text-primary"
            title="إضافة طبقة"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-600"
            title="إغلاق"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث في الطبقات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM12.293 12.707a1 1 0 001.414 0l-4-3.996M13.5 13.5l-2.007-2.007a1 1 0 00-1.414-1.414l3.007-3.007 3.007 3.007a1 1 0 001.414 1.414z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 10h.005l-.01-5.005M1 10a5 5 0 110 10h16a5 5 0 110-10z" />
                <path d="M1 10a9 9 0 1118-9 9 0 011-18z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">جاري تحميل الطبقات...</p>
          </div>
        ) : filteredLayers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">
              {searchQuery ? '🔍' : '🗺️'}
            </div>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد طبقات حالياً'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateLayer(true)}
                className="mt-4 btn btn-primary text-sm"
              >
                + إنشاء طبقة
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLayers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => toggleLayerVisibility(layer.id)}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={layer.is_visible}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />

                {/* Icon based on geometry type */}
                <div className="flex-shrink-0">
                  {layer.geometry_type === 'POINT' && (
                    <span className="text-lg">📍</span>
                  )}
                  {layer.geometry_type === 'LINE' && (
                    <span className="text-lg">〰</span>
                  )}
                  {layer.geometry_type === 'POLYGON' && (
                    <span className="text-lg">🔷</span>
                  )}
                </div>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {layer.name_ar}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {layer.feature_count || 0} ميزات • {layer.geometry_type}
                  </p>
                </div>

                {/* Visibility Indicator */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    layer.is_visible ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && filteredLayers.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowCreateLayer(true)}
            className="w-full btn btn-primary text-sm"
          >
            + إضافة طبقة
          </button>
        </div>
      )}

      {/* Search info */}
      {searchQuery && filteredLayers.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 text-center border-t border-gray-200">
          {filteredLayers.length} من {layers.length} طبقات
        </div>
      )}
    </div>
  );
}
