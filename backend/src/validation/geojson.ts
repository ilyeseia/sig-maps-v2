// GeoJSON Validation Schema
// Based on RFC 7946

import { z } from 'zod';

// GeoJSON Position (longitude, latitude, optional altitude)
const PositionSchema = z.tuple([
  z.number().min(-180).max(180), // longitude
  z.number().min(-90).max(90),   // latitude
]).rest(z.number());             // optional altitude

// GeoJSON Point
export const PointSchema = z.object({
  type: z.literal('Point'),
  coordinates: PositionSchema,
});

// GeoJSON LineString
export const LineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(PositionSchema).min(2),
});

// GeoJSON Polygon
export const PolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(
    z.array(PositionSchema).min(4) // Closed polygon
  ),
});

// Combined Geometry Schema
export const GeoJSONGeometrySchema = z.union([
  PointSchema,
  LineStringSchema,
  PolygonSchema,
]);

// Feature Schema
export const GeoJSONFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: GeoJSONGeometrySchema,
  properties: z.record(z.any()).optional(),
  id: z.string().optional(),
});

// Validator function
export function validateGeoJSON(geometry: unknown): { valid: boolean; error?: string } {
  const result = GeoJSONGeometrySchema.safeParse(geometry);
  
  if (!result.success) {
    return { 
      valid: false, 
      error: result.error.errors.map(e => e.message).join(', ') 
    };
  }
  
  // Additional validation for polygons
  if (geometry && (geometry as any).type === 'Polygon') {
    const coords = (geometry as any).coordinates;
    // Check if polygon is closed (first point equals last point)
    for (const ring of coords) {
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (JSON.stringify(first) !== JSON.stringify(last)) {
        return { 
          valid: false, 
          error: 'Polygon ring must be closed (first point equals last point)' 
        };
      }
    }
  }
  
  return { valid: true };
}

// Middleware for Express
export const validateGeoJSONMiddleware = (req: any, res: any, next: any) => {
  const geometry = req.body.geometry;
  if (!geometry) {
    return next(); // Skip if no geometry
  }
  
  const result = validateGeoJSON(geometry);
  if (!result.valid) {
    return res.status(400).json({
      error: {
        message: 'Invalid GeoJSON geometry',
        details: result.error,
      },
    });
  }
  
  next();
};

export default {
  PointSchema,
  LineStringSchema,
  PolygonSchema,
  GeoJSONGeometrySchema,
  validateGeoJSON,
  validateGeoJSONMiddleware,
};
