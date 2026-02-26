import React, { useMemo } from 'react';
import { Icon } from 'leaflet';

interface LayerIconProps {
  geometryType: 'POINT' | 'LINE' | 'POLYGON';
  color?: string;
  size?: number;
}

export default function LayerIcon({ geometryType, color = '#3B82F6', size = 16 }: LayerIconProps) {
  const icon: Icon = useMemo(() => {
    // Create a custom icon for the geometry type
    const className = 'layer-icon';
    
    if (geometryType === 'POINT') {
      // Point: circle
      const svgHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 3}" fill="${color}" />
        </svg>
      `;
      
      return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(svgHtml)}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
        className,
      });
    } else if (geometryType === 'LINE') {
      // Line: simple line icon
      const svgHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}" stroke="${color}" stroke-width="${size / 5}" />
        </svg>
      `;
      
      return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(svgHtml)}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
        className,
      });
    } else if (geometryType === 'POLYGON') {
      // Polygon: square
      const svgHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="${color}" opacity="0.7" stroke="${color}" stroke-width="${size / 10}" />
        </svg>
      `;
      
      return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(svgHtml)}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
        className,
      });
    }
    
    // Fallback: default icon
    const svgHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 3}" fill="${color}" />
      </svg>
    `;
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svgHtml)}`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
      className,
    });
  }, [geometryType, color, size]);

  return null; // Icon is returned as a Leaflet Icon object, not a React component
}

export function LayerIconEmoji({ geometryType }: { geometryType: 'POINT' | 'LINE' | 'POLYGON' }) {
  return (
    <span className="text-lg">
      {geometryType === 'POINT' && '📍'}
      {geometryType === 'LINE' && '〰'}
      {geometryType === 'POLYGON' && '🔷'}
    </span>
  );
}
