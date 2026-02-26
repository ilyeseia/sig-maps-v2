import { create } from 'zustand';

interface Layer {
  id: string;
  name: string;
  description: string;
  geometryType: string;
  isVisible: boolean;
  zIndex: number;
}

interface LayerPanelState {
  layers: Layer[];
  isVisible: boolean;
  setLayers: (layers: Layer[]) => void;
  togglePanel: () => void;
  toggleLayerVisibility: (layerId: string) => void;
}

export const useLayerStore = create<LayerPanelState>((set) => ({
  layers: [],
  isVisible: false,
  setLayers: (layers) => set({ layers }),
  togglePanel: () => set((state) => ({ isVisible: !state.isVisible })),
  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, isVisible: !layer.isVisible } : layer
      ),
    })),
}));
