/**
 * Spatial utilities for geospatial operations
 */

/**
 * Get bounding box (bbox) from Leaflet map bounds
 * Format: "minX,minY,maxX,maxY"
 *
 * @param mapBounds - Leaflet map bounds object
 * @returns bbox string for API request
 */
export const getBboxFromBounds = (mapBounds: {
  getSouthWest: () => { lng: number; lat: number };
  getNorthEast: () => { lng: number; lat: number };
}): string => {
  const sw = mapBounds.getSouthWest();
  const ne = mapBounds.getNorthEast();
  return `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
};

/**
 * Check if a point is within a bounding box
 *
 * @param point - { lng, lat }
 * @param bbox - bounding box "minX,minY,maxX,maxY"
 * @returns true if point is within bbox
 */
export const isPointInBbox = (
  point: { lng: number; lat: number },
  bbox: string
): boolean => {
  const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
  return (
    point.lng >= minLng &&
    point.lng <= maxLng &&
    point.lat >= minLat &&
    point.lat <= maxLat
  );
};

/**
 * Get center point from bbox
 *
 * @param bbox - bounding box "minX,minY,maxX,maxY"
 * @returns center point { lng, lat }
 */
export const getCenterFromBbox = (bbox: string): { lng: number; lat: number } => {
  const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
  return {
    lng: (minX + maxX) / 2,
    lat: (minY + maxY) / 2,
  };
};

/**
 * Add bbox parameter to API request options
 *
 * @param options - existing fetch options
 * @param bbox - bounding box string
 * @returns updated options with bbox parameter
 */
export const withBbox = (
  options: RequestInit = {},
  bbox: string
): RequestInit => {
  const url = new URL(options.url as string || '', window.location.origin);
  url.searchParams.set('bbox', bbox);

  return {
    ...options,
    url: url.toString(),
  };
};

/**
 * Build API request URL with bbox and pagination parameters
 *
 * @param baseUrl - base API URL
 * @param bbox - bounding box string (optional)
 * @param page - page number (default: 1)
 * @param limit - items per page (default: 100)
 * @returns full URL with query parameters
 */
export const buildFeaturesUrl = (
  baseUrl: string,
  bbox?: string,
  page: number = 1,
  limit: number = 100
): string => {
  const url = new URL(baseUrl);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  if (bbox) {
    url.searchParams.set('bbox', bbox);
  }

  return url.toString();
};

/**
 * Calculate bounding box diameter in kilometers
 * (Approximation for UI display)
 *
 * @param bbox - bounding box "minX,minY,maxX,maxY"
 * @returns diameter in kilometers
 */
export const getBboxDiameterKm = (bbox: string): number => {
  const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
  const width = maxX - minX;
  const height = maxY - minHeight;
  const avg = (width + height) / 2;
  // Approximate: 1 degree ≈ 111 km
  return Math.round(avg * 111);
};

/**
 * Determine appropriate feature limit based on bbox size
 * (Smaller bbox = higher limit for more detail)
 *
 * @param bbox - bounding box "minX,minY,maxX,maxY"
 * @returns recommended limit (100-500)
 */
export const getRecommendedLimit = (bbox: string): number => {
  const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
  const width = maxX - minX;
  const height = maxY - minY;
  const area = width * height;

  // Very small area (city block): 500 features
  if (area < 0.001) return 500;
  // Small area (neighborhood): 300 features
  if (area < 0.01) return 300;
  // Medium area (city): 200 features
  if (area < 0.1) return 200;
  // Large area (region): 100 features
  return 100;
};
