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

    // Build where clause
    const where: any = {};

    if (layer_id) {
      where.layerId = layer_id as string;
    }

    // Bbox filtering (viewport-based loading) - if bbox provided
    // Note: Would require PostGIS ST_Intersects for spatial filtering
    // For now, we implement it for future use
    if (bbox && typeof bbox === 'string') {
      const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
      if (!isNaN(minX) && !isNaN(minY) && !isNaN(maxX) && !isNaN(maxY)) {
        // TODO: Add PostGIS spatial filter here using ST_Intersects
        // This would significantly improve performance for large datasets
        console.log('Bbox filter provided:', { minX, minY, maxX, maxY });
      }
    }

    // Get features with layer data included (N+1 Query Fix)
    const [features, totalCount] = await Promise.all([
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

    // Return features with layer data included
    res.json({
      features: features.map((feature) => ({
        id: feature.id,
        layerId: feature.layerId,
        geometry: feature.geometry,
        attributes: feature.attributes,
        layer: feature.layer, // Layer data included (N+1 Query Fix)
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt,
        createdBy: feature.createdBy,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
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
