import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { GeoJSONGeometrySchema } from '../validation/geojson';
import { prisma } from '../index';

const router = Router();

// GET /api/features - Public access (no auth needed for viewing)
// All other routes require authentication

// Validation schemas with GeoJSON validation
const createFeatureSchema = z.object({
  layer_id: z.string().uuid('Invalid layer ID'),
  geometry: GeoJSONGeometrySchema,
  attributes: z.record(z.any()).optional(),
});

const updateFeatureSchema = z.object({
  geometry: GeoJSONGeometrySchema.optional(),
  attributes: z.record(z.any()).optional(),
});

// GET /api/features - List features (with optional filters, pagination, and bbox)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { layer_id, bbox, page = '1', limit = '100' } = req.query;

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 100, 500); // Max 500 features per request
    const offset = (pageNum - 1) * limitNum;

    let features: any[] = [];
    let totalCount = 0;

    // Check if bbox is provided for spatial filtering
    if (bbox && typeof bbox === 'string') {
      const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
      if (!isNaN(minX) && !isNaN(minY) && !isNaN(maxX) && !isNaN(maxY)) {
        // Use PostGIS ST_Intersects for spatial filtering
        // This uses the PostGIS index on the geometry column for fast queries
        const bboxPolygon = `ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326)`;

        // Build WHERE clause for layer_id filter
        const layerFilter = layer_id ? `AND "layer_id" = '${layer_id}'` : '';

        // Use raw query with PostGIS for spatial filtering + layer data
        const featuresQuery = `
          SELECT
            f."id",
            f."layer_id",
            ST_AsGeoJSON(f."geometry")::jsonb as "geometry",
            f."attributes",
            f."created_at" AS "createdAt",
            f."updated_at" AS "updatedAt",
            f."created_by" AS "createdBy",
            l."id" AS "layer_id",
            l."name_ar" AS "layer_name_ar",
            l."name_fr" AS "layer_name_fr",
            l."geometry_type" AS "layer_geometry_type",
            l."style" AS "layer_style"
          FROM "features" f
          JOIN "layers" l ON f."layer_id" = l."id"
          WHERE ST_Intersects(f."geometry", ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326)::geometry)
            ${layerFilter}
          ORDER BY f."created_at" DESC
          LIMIT ${limitNum} OFFSET ${offset}
        `;

        const countQuery = `
          SELECT COUNT(*) as count
          FROM "features" f
          WHERE ST_Intersects(f."geometry", ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326)::geometry)
            ${layerFilter}
        `;

        const [featuresResult, countResult] = await Promise.all([
          prisma.$queryRawUnsafe(featuresQuery) as unknown as any[],
          prisma.$queryRawUnsafe(countQuery),
        ]);

        features = featuresResult;
        totalCount = (countResult as any)[0]?.count || 0;
      }
    } else {
      // No bbox - use raw query for now (Prisma can't deserialize geometry)
      const layerFilter = layer_id ? `WHERE "layer_id" = '${layer_id}'` : '';

      const featuresQuery = `
        SELECT
          f."id",
          f."layer_id",
          ST_AsGeoJSON(f."geometry")::jsonb as "geometry",
          f."attributes",
          f."created_at" AS "createdAt",
          f."updated_at" AS "updatedAt",
          f."created_by" AS "createdBy",
          l."id" AS "layer_id",
          l."name_ar" AS "layer_name_ar",
          l."name_fr" AS "layer_name_fr",
          l."geometry_type" AS "layer_geometry_type",
          l."style" AS "layer_style"
        FROM "features" f
        JOIN "layers" l ON f."layer_id" = l."id"
        ${layerFilter}
        ORDER BY f."created_at" DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const countQuery = `
        SELECT COUNT(*) as count
        FROM "features" f
        ${layerFilter}
      `;

      const [featuresResult, countResult] = await Promise.all([
        prisma.$queryRawUnsafe(featuresQuery) as unknown as any[],
        prisma.$queryRawUnsafe(countQuery),
      ]);

      features = featuresResult;
      totalCount = (countResult as any)[0]?.count || 0;
    }

    // Transform features response (all from raw queries now)
    const transformedFeatures = features.map((feature: any) => ({
      id: feature.id,
      layerId: feature.layer_id,
      geometry: feature.geometry,
      attributes: feature.attributes,
      layer: {
        id: feature.layer_id,
        nameAr: feature.layer_name_ar,
        nameFr: feature.layer_name_fr,
        geometryType: feature.layer_geometry_type,
        style: feature.layer_style,
      },
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
      createdBy: feature.createdBy,
    }));

    res.json({
      features: transformedFeatures,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / limitNum),
      },
      spatialFilter: !!bbox, // Indicate if spatial filtering was used
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/features/:id - Get feature by ID (public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const features = await prisma.$queryRawUnsafe(`
      SELECT
        f."id",
        f."layer_id",
        ST_AsGeoJSON(f."geometry")::jsonb as "geometry",
        f."attributes",
        f."created_at" AS "createdAt",
        f."updated_at" AS "updatedAt",
        f."created_by" AS "createdBy",
        l."id" AS "layer_id",
        l."name_ar" AS "layer_name_ar",
        l."name_fr" AS "layer_name_fr",
        l."geometry_type" AS "layer_geometry_type",
        l."style" AS "layer_style"
      FROM "features" f
      JOIN "layers" l ON f."layer_id" = l."id"
      WHERE f."id" = $1::uuid
    `, id) as any[];

    const feature = features[0];

    if (!feature) {
      return res.status(404).json({
        error: {
          message: 'Feature not found',
        },
      });
    }

    res.json({
      feature: {
        id: feature.id,
        layerId: feature.layer_id,
        geometry: feature.geometry,
        attributes: feature.attributes,
        layer: {
          id: feature.layer_id,
          nameAr: feature.layer_name_ar,
          nameFr: feature.layer_name_fr,
          geometryType: feature.layer_geometry_type,
          style: feature.layer_style,
        },
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt,
        createdBy: feature.createdBy,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/features - Create feature (editor/admin only)
router.post('/', requireRole('EDITOR', 'ADMIN'), validate(createFeatureSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { layer_id, geometry, attributes } = req.body;
    const userId = req.user!.id;

    // Verify layer exists
    const layer = await prisma.layer.findUnique({
      where: { id: layer_id },
    });

    if (!layer) {
      return res.status(404).json({
        error: {
          message: 'Layer not found',
        },
      });
    }

    // Validate geometry type matches layer geometry type
    if (geometry.type !== layer.geometryType) {
      return res.status(400).json({
        error: {
          message: `Geometry type must match layer geometry type (${layer.geometryType})`,
        },
      });
    }

    // Create feature using raw query (convert GeoJSON to GEOMETRY)
    const feature = await prisma.$queryRawUnsafe(`
      INSERT INTO "features" ("id", "layer_id", "geometry", "attributes", "created_by")
      VALUES (
        gen_random_uuid(),
        $1::uuid,
        ST_GeomFromGeoJSON($2::text),
        $3::jsonb,
        $4::uuid
      )
      RETURNING
        "id" as "id",
        "layer_id" as "layerId",
        ST_AsGeoJSON("geometry")::jsonb as "geometry",
        "attributes" as "attributes",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
        "created_by" as "createdBy"
    `, layer_id, JSON.stringify(geometry), attributes || {}, userId);

    if (!feature || !(feature as any)[0]) {
      throw new Error('Failed to create feature');
    }

    res.status(201).json({
      message: 'Feature created successfully',
      feature: (feature as any)[0],
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/features/:id - Update feature geometry/attributes (editor/admin only)
router.put('/:id', requireRole('EDITOR', 'ADMIN'), validate(updateFeatureSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { geometry, attributes } = req.body;

    // Check if feature exists
    const existingFeatures = await prisma.$queryRawUnsafe(`
      SELECT id, layer_id, created_by
      FROM "features"
      WHERE id = $1::uuid
    `, id) as unknown as any[];

    const existingFeature = existingFeatures[0] as any;

    if (!existingFeature) {
      return res.status(404).json({
        error: {
          message: 'Feature not found',
        },
      });
    }

    // Update feature using raw query (Prisma doesn't support GEOMETRY type)
    let updateQuery = '';
    const updateValues: any[] = [];

    if (geometry !== undefined && attributes !== undefined) {
      updateQuery = `
        UPDATE "features"
        SET geometry = ST_GeomFromGeoJSON($1::text),
            attributes = $2::jsonb,
            updated_at = NOW()
        WHERE id = $3::uuid
        RETURNING id, layer_id, ST_AsGeoJSON(geometry)::jsonb as geometry, attributes, created_at, updated_at, created_by
      `;
      updateValues.push(JSON.stringify(geometry), attributes, id);
    } else if (geometry !== undefined) {
      updateQuery = `
        UPDATE "features"
        SET geometry = ST_GeomFromGeoJSON($1::text),
            updated_at = NOW()
        WHERE id = $2::uuid
        RETURNING id, layer_id, ST_AsGeoJSON(geometry)::jsonb as geometry, attributes, created_at, updated_at, created_by
      `;
      updateValues.push(JSON.stringify(geometry), id);
    } else if (attributes !== undefined) {
      updateQuery = `
        UPDATE "features"
        SET attributes = $1::jsonb,
            updated_at = NOW()
        WHERE id = $2::uuid
        RETURNING id, layer_id, ST_AsGeoJSON(geometry)::jsonb as geometry, attributes, created_at, updated_at, created_by
      `;
      updateValues.push(attributes, id);
    }

    const features = await prisma.$queryRawUnsafe(updateQuery, ...updateValues) as unknown as any[];
    const feature = features[0] as any;

    // Transform result
    const transformedFeature = {
      id: feature.id,
      layerId: feature.layer_id,
      geometry: feature.geometry,
      attributes: feature.attributes,
      createdAt: feature.created_at,
      updatedAt: feature.updated_at,
      createdBy: feature.created_by,
    };

    res.json({
      message: 'Feature updated successfully',
      feature: transformedFeature,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/features/:id - Delete feature (editor/admin only)
router.delete('/:id', requireRole('EDITOR', 'ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if feature exists
    const existingFeatures = await prisma.$queryRawUnsafe(`
      SELECT id FROM "features" WHERE id = $1::uuid
    `, id) as any[];

    if (!existingFeatures || existingFeatures.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Feature not found',
        },
      });
    }

    // Delete feature
    await prisma.$queryRawUnsafe(`
      DELETE FROM "features" WHERE id = $1::uuid
    `, id);

    res.json({
      message: 'Feature deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
