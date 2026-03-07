import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { GeoJSONGeometrySchema } from '../validation/geojson';
import { prisma } from '../index';

const router = Router();

// All feature routes require authentication
router.use(authenticate);

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
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
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
            f."geometry",
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
          WHERE ST_Intersects(f."geometry"::geometry, ${bboxPolygon}::geometry)
            ${layerFilter}
          ORDER BY f."created_at" DESC
          LIMIT ${limitNum} OFFSET ${offset}
        `;

        const countQuery = `
          SELECT COUNT(*) as count
          FROM "features" f
          WHERE ST_Intersects(f."geometry"::geometry, ${bboxPolygon}::geometry)
            ${layerFilter}
        `;

        const [featuresResult, countResult] = await Promise.all([
          prisma.$queryRawUnsafe(featuresQuery),
          prisma.$queryRawUnsafe(countQuery),
        ]);

        features = featuresResult;
        totalCount = (countResult as any)[0]?.count || 0;
      }
    } else {
      // No bbox - use standard Prisma query with pagination
      const where: any = {};

      if (layer_id) {
        where.layerId = layer_id as string;
      }

      const [featuresResult, countResult] = await Promise.all([
        prisma.feature.findMany({
          where,
          include: {
            layer: {
              select: {
                id: true,
                name_ar: true,
                name_fr: true,
                geometry_type: true,
                style: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limitNum,
          skip: offset,
        }),
        prisma.feature.count({ where }),
      ]);

      features = featuresResult;
      totalCount = countResult;
    }

    // Transform features response
    const transformedFeatures = features.map((feature: any) => (
      bbox ? (
        // From raw PostGIS query - need to restructure
        {
          id: feature.id,
          layerId: feature.layer_id,
          geometry: feature.geometry,
          attributes: feature.attributes,
          layer: {
            id: feature.layer_id,
            name_ar: feature.layer_name_ar,
            name_fr: feature.layer_name_fr,
            geometry_type: feature.layer_geometry_type,
            style: feature.layer_style,
          },
          createdAt: feature.createdAt,
          updatedAt: feature.updatedAt,
          createdBy: feature.createdBy,
        }
      ) : (
        // From Prisma query - already structured
        {
          id: feature.id,
          layerId: feature.layerId,
          geometry: feature.geometry,
          attributes: feature.attributes,
          layer: feature.layer,
          createdAt: feature.createdAt,
          updatedAt: feature.updatedAt,
          createdBy: feature.createdBy,
        }
      )
    ));

    res.json({
      features: transformedFeatures,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      spatialFilter: !!bbox, // Indicate if spatial filtering was used
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/features/:id - Get feature by ID
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const feature = await prisma.feature.findUnique({
      where: { id },
      include: {
        layer: {
          select: {
            id: true,
            name_ar: true,
            name_fr: true,
            geometry_type: true,
            style: true,
          },
        },
      },
    });

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
        layerId: feature.layerId,
        geometry: feature.geometry,
        attributes: feature.attributes,
        layer: feature.layer,
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
    if (geometry.type !== layer.geometry_type) {
      return res.status(400).json({
        error: {
          message: `Geometry type must match layer geometry type (${layer.geometry_type})`,
        },
      });
    }

    // Create feature
    const feature = await prisma.feature.create({
      data: {
        layerId,
        geometry,
        attributes: attributes || {},
        createdBy: userId,
      },
      select: {
        id: true,
        layerId: true,
        geometry: true,
        attributes: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });

    res.status(201).json({
      message: 'Feature created successfully',
      feature,
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
    const existingFeature = await prisma.feature.findUnique({
      where: { id },
    });

    if (!existingFeature) {
      return res.status(404).json({
        error: {
          message: 'Feature not found',
        },
      });
    }

    // Update feature
    const feature = await prisma.feature.update({
      where: { id },
      data: {
        ...(geometry !== undefined && { geometry }),
        ...(attributes !== undefined && { attributes }),
      },
      select: {
        id: true,
        layerId: true,
        geometry: true,
        attributes: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });

    res.json({
      message: 'Feature updated successfully',
      feature,
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
    const existingFeature = await prisma.feature.findUnique({
      where: { id },
    });

    if (!existingFeature) {
      return res.status(404).json({
        error: {
          message: 'Feature not found',
        },
      });
    }

    // Delete feature
    await prisma.feature.delete({
      where: { id },
    });

    res.json({
      message: 'Feature deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
