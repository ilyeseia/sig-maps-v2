-- @ts-ignore

-- 1. Add temporary geometry column
ALTER TABLE features ADD COLUMN IF NOT EXISTS geometry_geom geometry(Geometry, 4326);

-- 2. Convert JSONB geometry to PostGIS geometry
UPDATE features
SET geometry_geom = ST_GeomFromGeoJSON(geometry::text)
WHERE geometry IS NOT NULL;

-- 3. Drop old JSONB geometry column
ALTER TABLE features DROP COLUMN IF EXISTS geometry;

-- 4. Rename geometry_geom to geometry
ALTER TABLE features RENAME COLUMN geometry_geom TO geometry;

-- 5. Create spatial index
CREATE INDEX IF NOT EXISTS features_geometry_idx ON features USING GIST (geometry);

-- 6. Verify geometry conversion
SELECT COUNT(*) as total_features FROM features;
SELECT id, ST_AsText(geometry) as geometry_text FROM features LIMIT 3;
