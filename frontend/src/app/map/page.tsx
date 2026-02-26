'use client';

import { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { useAuthStore } from '../../store/auth-store';
import { useLayerStore } from '../../store/layer-store';
import Map from '../../components/Map';
import LayerPanel from '../../components/LayerPanel';
import { TokenRefresh } from '../../components/TokenRefresh';
import { apiClient } from '../../lib/api-client';

// Geometry types constants
const GEOMETRY_TYPES = {
  POINT: 'POINT',
  LINE: 'LINE',
  POLYGON: 'POLYGON',
} as const;

type GeometryType = typeof GEOMETRY_TYPES[keyof typeof GEOMETRY_TYPES];

interface Attribute {
  key: string;
  value: string;
}

export default function MapPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isVisible: isLayerPanelVisible, togglePanel } = useLayerStore();
  const { layers } = useLayerStore();
  
  const [activeTool, setActiveTool] = useState<'marker' | 'polyline' | 'polygon' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedLayerType, setSelectedLayerType] = useState<GeometryType>('POINT');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store the drawn geometry
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    attributes: Attribute[];
  }>({
    name: '',
    description: '',
    attributes: [],
  });

  // Check if user can draw
  const canDraw = user?.role === 'EDITOR' || user?.role === 'ADMIN';

  // Handle logout
  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      setActiveTool(null);
      setIsEditing(false);
      setIsFormOpen(false);
      logout();
    }
  };

  // Handle drawing start
  const handleDrawStart = useCallback(() => {
    console.log('✏️ Drawing started');
    setDrawnGeometry(null); // Clear previous geometry
  }, []);

  // Handle drawing end - capture the feature geometry
  const handleDrawEnd = useCallback((feature: any) => {
    console.log('✅ Drawing completed:', feature);
    
    // Capture the geometry for later save
    setDrawnGeometry(feature.geometry || feature);
    
    // Open form for user input
    setIsFormOpen(true);
    setFormData({
      name: '',
      description: '',
      attributes: [],
    });
    
    // Disable drawing mode temporarily while user fills form
    setActiveTool(null);
  }, []);

  // Handle drawing cancel
  const handleDrawCancel = useCallback(() => {
    setActiveTool(null);
    setIsEditing(false);
    setIsFormOpen(false);
    setDrawnGeometry(null);
    setFormData({
      name: '',
      description: '',
      attributes: [],
    });
    console.log('✏️ Drawing canceled');
  }, []);

  // Handle layer selection for drawing
  const handleLayerSelect = useCallback((layer: any) => {
    const geometryType = layer.geometry_type as GeometryType;
    setSelectedLayerId(layer.id);
    setSelectedLayerType(geometryType);
    
    // Set active tool based on geometry type
    if (geometryType === 'POINT') {
      setActiveTool('marker');
    } else if (geometryType === 'LINE') {
      setActiveTool('polyline');
    } else if (geometryType === 'POLYGON') {
      setActiveTool('polygon');
    }
    
    console.log('✅ Selected layer for drawing:', layer.name_ar, `(${geometryType})`);
  }, []);

  // Handle attribute management
  const handleAddAttribute = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: '' }],
    }));
  }, []);

  const handleUpdateAttribute = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  }, []);

  const handleRemoveAttribute = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  }, []);

  // Handle form submission - API call to save feature
  const handleFormSubmit = useCallback(async () => {
    if (!selectedLayerId || !drawnGeometry) {
      console.error('Missing required data:', { selectedLayerId, drawnGeometry });
      return;
    }

    // Validate name is required
    if (!formData.name.trim()) {
      alert('❌ الاسم مطلوب!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build attributes object
      const attributes: Record<string, any> = {
        name: formData.name.trim(),
      };

      if (formData.description) {
        attributes.description = formData.description.trim();
      }

      // Add custom attributes
      formData.attributes.forEach(attr => {
        if (attr.key && attr.value) {
          attributes[attr.key.trim()] = attr.value.trim();
        }
      });

      // Prepare API request
      const createFeatureRequest = {
        layer_id: selectedLayerId,
        geometry: drawnGeometry,
        attributes,
      };

      console.log('📤 Creating feature:', createFeatureRequest);

      // Call backend API
      const response = await apiClient.post<{ message: string; feature: any }>('/features', createFeatureRequest);

      console.log('✅ Feature created successfully:', response.feature);

      // Show success message
      alert(
        `✅ تم حفظ الميزة بنجاح!\n\n` +
        `الاسم: ${formData.name}\n` +
        `الطبقة: ${layers.find((l: any) => l.id === selectedLayerId)?.name_ar || 'غير محدد'}\n` +
        `النوع: ${selectedLayerType}\n` +
        `ID: ${response.feature.id}`
      );

      // Close form and reset
      setIsFormOpen(false);
      setDrawnGeometry(null);
      setFormData({
        name: '',
        description: '',
        attributes: [],
      });
      setSelectedLayerId(null);

      // Force refresh the map component by triggering a page reload
      // In production, you'd have better state management
      window.location.reload();
    } catch (error: any) {
      console.error('❌ Failed to create feature:', error);
      
      // Show user-friendly error message
      const errorMessage = error?.message || ' فشل حفظ الميزة. حاول مرة أخرى.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedLayerId, selectedLayerType, drawnGeometry, formData, layers]);

  // Get layers that can be drawn (writable layers)
  const getWritableLayers = useCallback(() => {
    return layers.filter((layer: any) => !layer.is_readonly && layer.is_visible);
  }, [layers]);

  // Find a POINT layer to auto-select when drawing starts
  const findDefaultLayer = useCallback(() => {
    const pointLayers = getWritableLayers().filter((l: any) => l.geometry_type === 'POINT');
    if (pointLayers.length > 0) {
      return pointLayers[0];
    }
    // Fallback to first writable layer
    const writableLayers = getWritableLayers();
    return writableLayers.length > 0 ? writableLayers[0] : null;
  }, [getWritableLayers]);

  // Get writable layers for the selected geometry type
  const getLayersForGeometryType = useCallback((type: GeometryType) => {
    return getWritableLayers().filter((layer: any) => layer.geometry_type === type);
  }, [getWritableLayers]);

  // Handle drawing tool toggle
  const handleToolToggle = useCallback((tool: 'marker' | 'polyline' | 'polygon' | null) => {
    if (tool === null) {
      setActiveTool(null);
      setIsEditing(false);
      setIsFormOpen(false);
      setSelectedLayerId(null);
      setDrawnGeometry(null);
    } else {
      const defaultLayer = findDefaultLayer();
      if (defaultLayer) {
        handleLayerSelect(defaultLayer);
      } else {
        togglePanel(); // Open layer panel to create layer
        alert('لا توجد طبقة متاحة للرسم! قم بإنشاء طبقة أولاً.');
      }
    }
  }, [findDefaultLayer, handleLayerSelect, togglePanel]);

  // Get current drawing status text
  const getDrawingStatusText = useCallback(() => {
    if (!activeTool) return null;
    
    const layer = layers.find((l: any) => l.id === selectedLayerId);
    const layerName = layer?.name_ar || 'غير محدد';
    
    if (activeTool === 'marker') return `📍 رسم نقطة على ${layerName}`;
    if (activeTool === 'polyline') return `〰 رسم خط على ${layerName}`;
    if (activeTool === 'polygon') return `🔷 رسم منطقة على ${layerName}`;
    
    return null;
  }, [activeTool, layers, selectedLayerId]);

  return (
    <>
      {/* Token Refresh Component */}
      <TokenRefresh />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            SIG Maps V2
          </h1>
          <div className="flex items-center gap-4">
            {/* Draw Toggle Button */}
            {canDraw && (
              <button
                onClick={() => handleToolToggle(activeTool ? null : 'marker')}
                className={`btn text-sm ${
                  activeTool !== null ? 'btn-primary' : 'btn-secondary'
                }`}
                title={activeTool !== null ? 'إلغاء الرسم' : 'رسم نقطة'}
              >
                {activeTool === 'marker' && '📍'}
                {activeTool === 'polyline' && '〰'}
                {activeTool === 'polygon' && '🔷'}
                {!activeTool && '📍 رسم'}
              </button>
            )}

            {/* Layer Panel Toggle Button */}
            <button
              onClick={togglePanel}
              className={`btn text-sm ${isLayerPanelVisible ? 'btn-primary' : 'btn-secondary'}`}
              title={isLayerPanelVisible ? 'إخفاء الطبقات' : 'إظهار الطبقات'}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {user?.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
              title="تسجيل الخروج"
            >
              <span className="hidden sm:inline">تسجيل الخروج</span>
              <span className="sm:hidden">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h9a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Layer Panel Drawer */}
      {isLayerPanelVisible && <LayerPanel onClose={togglePanel} />}

      {/* Map Container */}
      <div className="h-[calc(100vh-64px)] relative">
        <Map
          activeTool={activeTool}
          isEditing={isEditing}
          onDrawStart={handleDrawStart}
          onDrawEnd={handleDrawEnd}
          onCancel={handleDrawCancel}
        />

        {/* Drawing Status Indicator */}
        {getDrawingStatusText() && !isFormOpen && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-blue-500 text-white text-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
              <span>{getDrawingStatusText()}</span>
              <button
                onClick={handleDrawCancel}
                className="hover:bg-white/20 rounded-full p-1 ml-2"
                title="إلغاء"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Layer Selection for Drawing (when active and no form open) */}
        {activeTool && getWritableLayers().length > 0 && !isFormOpen && (
          <div className="absolute top-20 left-4 z-10">
            <div className="bg-white rounded-lg shadow-md p-4 max-w-xs">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                اختر طبقة للرسم
              </h4>
              <div className="space-y-2">
                {getWritableLayers().map((layer: any) => {
                  const isSelected = layer.id === selectedLayerId;
                  const isCompatibleLayer =
                    (activeTool === 'marker' && layer.geometry_type === 'POINT') ||
                    (activeTool === 'polyline' && layer.geometry_type === 'LINE') ||
                    (activeTool === 'polygon' && layer.geometry_type === 'POLYGON');

                  if (!isCompatibleLayer) return null; // Skip incompatible layers

                  return (
                    <button
                      key={layer.id}
                      onClick={() => handleLayerSelect(layer)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md border transition-colors flex items-center gap-2 ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 hover:border-primary/50 text-gray-700'
                      }`}
                    >
                      <span>
                        {layer.geometry_type === 'POINT' && '📍'}
                        {layer.geometry_type === 'LINE' && '〰'}
                        {layer.geometry_type === 'POLYGON' && '🔷'}
                      </span>
                      <span className="truncate">{layer.name_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Drawing Form */}
        {isFormOpen && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                إدخال تفاصيل الميزة
              </h3>

              {/* Layer Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">الطبقة:</span>{' '}
                  {layers.find((l: any) => l.id === selectedLayerId)?.name_ar || 'غير محدد'}
                  <span className="ml-2 text-xs text-gray-500">
                    ({selectedLayerType === 'POINT' && 'نقطة'}
                    {selectedLayerType === 'LINE' && 'خط'}
                    {selectedLayerType === 'POLYGON' && 'منطقة'})
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم * <span className="text-red-500">(مطلوب)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="أدخل اسم الميزة"
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف <span className="text-gray-500">(اختياري)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="أدخل وصف الميزة"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Custom Attributes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      السمات المخصصة <span className="text-gray-500">(اختياري)</span>
                    </label>
                    <button
                      onClick={handleAddAttribute}
                      className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                      disabled={isSubmitting || formData.attributes.length >= 10}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      إضافة سمة
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {formData.attributes.map((attr, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <input
                          type="text"
                          placeholder="اسم السمة"
                          value={attr.key}
                          onChange={(e) => handleUpdateAttribute(index, 'key', e.target.value)}
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isSubmitting}
                        />
                        <input
                          type="text"
                          placeholder="القيمة"
                          value={attr.value}
                          onChange={(e) => handleUpdateAttribute(index, 'value', e.target.value)}
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isSubmitting}
                        />
                        <button
                          onClick={() => handleRemoveAttribute(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                          title="حذف السمة"
                          disabled={isSubmitting}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleFormSubmit}
                    disabled={isSubmitting || !formData.name.trim()}
                    className="btn btn-primary text-sm flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:not-allowed"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ الميزة'}
                  </button>
                  <button
                    onClick={handleDrawCancel}
                    className="btn btn-secondary text-sm"
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
