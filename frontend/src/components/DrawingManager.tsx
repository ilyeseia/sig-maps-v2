'use client';

import { useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import {
  FeatureGroup,
  EditControl,
  DrawMarker,
} from 'react-leaflet-draw';
import L from 'leaflet';

interface DrawingTool {
  type: 'marker' | 'polyline' | 'polygon' | 'rectangle' | 'circle';
  icon: string;
}

interface DrawingManagerProps {
  activeTool: DrawingTool['type'] | null;
  isEditing: boolean;
  onDrawStart: () => void;
  onDrawEnd: (feature: any) => void;
  onCancel: () => void;
}

export default function DrawingManager({
  activeTool,
  isEditing,
  onDrawStart,
  onDrawEnd,
  onCancel,
}: DrawingManagerProps) {
  const map = useMap();

  const onCreated = useCallback((e: any) => {
    const { layerType, layer } = e;    const feature = layer.toGeoJSON();

    onDrawEnd(feature);
  }, [onDrawEnd]);

  const onEdited = useCallback((e: any) => {
    const { layer } = e;
    const feature = layer.toGeoJSON();

    onDrawEnd(feature);
  }, [onDrawEnd]);

  const onDeleted = useCallback((e: any) => {
    console.log('Feature deleted:', e);
    // Note: In production, this should delete from backend via API
  }, []);

  // Disable drawing when not active or editing
  if (!activeTool || isEditing) {
    return null;
  }

  // Render appropriate drawing tool based on active tool
  return (
    <>
      {/* Draw Marker Tool */}
      {activeTool === 'marker' && (
        <EditControl
          position="topleft"
          onCreated={onCreated}
          onEdited={onEdited}
          onDeleted={onDeleted}
          draw={
            <DrawMarker />
          }
        />
      )}

      {/* Draw Line Tool - TO DO in future stories */}
      {activeTool === 'polyline' && (
        <EditControl
          position="topleft"
          onCreated={onCreated}
          onEdited={onEdited}
          onDeleted={onDeleted}
          draw={
            <EditControl.Polyline />
          }
        />
      )}

      {/* Draw Polygon Tool - TO DO in future stories */}
      {activeTool === 'polygon' && (
        <EditControl
          position="topleft"
          onCreated={onCreated}
          onEdited={onEdited}
          onDeleted={onDeleted}
          draw={
            <EditControl.Polygon />
          }
        />
      )}
    </>
  );
}
