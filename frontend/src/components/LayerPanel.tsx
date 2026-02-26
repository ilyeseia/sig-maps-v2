'use client';

import { useLayerStore } from '../../store/layer-store';

interface LayerPanelProps {
  onClose: () => void;
}

export default function LayerPanel({ onClose }: LayerPanelProps) {
  const { layers, toggleLayerVisibility } = useLayerStore();

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-20 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">الطبقات</h2>
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

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-4">
        {layers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-500 text-sm">لا توجد طبقات حالياً</p>
            <p className="text-xs text-gray-400 mt-1">
              يمكنك إنشاء طبقات جديدة من لوحة التحكم
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={layer.isVisible}
                  onChange={() => toggleLayerVisibility(layer.id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />

                {/* Icon based on geometry type */}
                <div className="flex-shrink-0">
                  {layer.geometryType === 'POINT' && (
                    <span className="text-lg">📍</span>
                  )}
                  {layer.geometryType === 'LINE' && (
                    <span className="text-lg">〰</span>
                  )}
                  {layer.geometryType === 'POLYGON' && (
                    <span className="text-lg">🔷</span>
                  )}
                </div>

                {/* Layer Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {layer.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {layer.description || layer.geometryType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full btn btn-primary text-sm">
          + إضافة طبقة
        </button>
      </div>
    </div>
  );
}
