// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../index';
import { z } from 'zod';
import { cacheGet, cacheSet, invalidateLayerCache, invalidateAllLayerCaches } from '../services/redis';

const router = Router();

// All layer routes require authentication
router.use(authenticate);

// Validation schemas
const createLayerSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name is required'),
  name_fr: z.string().min(1, 'French name is required'),
  geometry_type: z.enum(['POINT', 'LINE', 'POLYGON']),
  is_visible: z.boolean().default(true),
  zIndex: z.number().int().default(0),
  style: z.object({
    color: z.string().default('#3B82F6'),
    opacity: z.number().min(0).max(1).default(0.7),
    line_width: z.number().min(0).max(10).default(2),
    fill_color: z.string().optional(),
    fill_opacity: z.number().min(0).max(1).optional(),
    marker_size: z.number().min(5).max(20).default(10),
  }).optional(),
});

const updateLayerSchema = z.object({
  name_ar: z.string().min(1).optional(),
  name_fr: z.string().min(1).optional(),
  geometry_type: z.enum(['POINT', 'LINE', 'POLYGON']).optional(),
  is_visible: z.boolean().optional(),
  zIndex: z.number().int().optional(),
  style: z.object({
    color: z.string().optional(),
    opacity: z.number().min(0).max(1).optional(),
    line_width: z.number().min(0).max(10).optional(),
    fill_color: z.string().optional(),
    fill_opacity: z.number().min(0).max(1).optional(),
    marker_size: z.number().min(5).max(20).optional(),
  }).optional(),
});

// GET /api/layers - List all layers (accessible to all authenticated users)
// Cache Key: layers:all | TTL: 5 minutes
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Try to get from cache first
    const cached = await cacheGet<any>('layers:all');
    if (cached) {
      return res.json(cached);
    }

    // Cache miss - fetch from database
    const layers = await prisma.layer.findMany({
      orderBy: [
        { zIndex: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        nameAr: true,
        nameFr: true,
        geometryType: true,
        isVisible: true,
        zIndex: true,
        style: true,
        createdAt: true,
        _count: {
          select: { features: true },
        },
      },
    });

    const response = {
      layers: layers.map((layer) => ({
        id: layer.id,
        name_ar: layer.nameAr,
        name_fr: layer.nameFr,
        geometry_type: layer.geometryType,
        is_visible: layer.isVisible,
        zIndex: layer.zIndex,
        style: layer.style,
        created_at: layer.createdAt,
        feature_count: layer._count.features,
      })),
    };

    // Cache for 5 minutes (300 seconds)
    await cacheSet('layers:all', response, { expiresInSeconds: 300 });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/layers/:id - Get layer by ID
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const layer = await prisma.layer.findUnique({
      where: { id },
      select: {
        id: true,
        nameAr: true,
        nameFr: true,
        geometryType: true,
        isVisible: true,
        zIndex: true,
        style: true,
        createdAt: true,
        createdBy: true,
        _count: {
          select: { features: true },
        },
      },
    });

    if (!layer) {
      return res.status(404).json({
        error: {
          message: 'Layer not found',
        },
      });
    }

    res.json({
      layer: {
        id: layer.id,
        name_ar: layer.nameAr,
        name_fr: layer.nameFr,
        geometry_type: layer.geometryType,
        is_visible: layer.isVisible,
        zIndex: layer.zIndex,
        style: layer.style,
        created_at: layer.createdAt,
        created_by: layer.createdBy,
        feature_count: layer._count.features,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/layers - Create layer (editor/admin only)
router.post('/', requireRole('EDITOR', 'ADMIN'), validate(createLayerSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name_ar, name_fr, geometry_type, is_visible, zIndex, style } = req.body;
    const userId = req.user!.id;

    const layer = await prisma.layer.create({
      data: {
        nameAr: name_ar,
        nameFr: name_fr,
        geometryType: geometry_type,
        isVisible: is_visible ?? true,
        zIndex: zIndex ?? 0,
        style: style ?? {},
        createdBy: userId,
      },
      select: {
        id: true,
        nameAr: true,
        nameFr: true,
        geometryType: true,
        isVisible: true,
        zIndex: true,
        style: true,
        createdAt: true,
        createdBy: true,
      },
    });

    // Invalidate cache
    await invalidateAllLayerCaches();

    res.status(201).json({
      message: 'Layer created successfully',
      layer,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/layers/:id - Update layer (editor/admin only)
router.put('/:id', requireRole('EDITOR', 'ADMIN'), validate(updateLayerSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name_ar, name_fr, geometry_type, is_visible, zIndex, style } = req.body;
    const userId = req.user!.id;

    // Check if layer exists
    const existingLayer = await prisma.layer.findUnique({
      where: { id },
    });

    if (!existingLayer) {
      return res.status(404).json({
        error: {
          message: 'Layer not found',
        },
      });
    }

    // Update layer
    const layer = await prisma.layer.update({
      where: { id },
      data: {
        ...(name_ar && { nameAr: name_ar }),
        ...(name_fr && { nameFr: name_fr }),
        ...(geometry_type && { geometryType: geometry_type }),
        ...(is_visible !== undefined && { isVisible: is_visible }),
        ...(zIndex !== undefined && { zIndex }),
        ...(style !== undefined && { style }),
      },
      select: {
        id: true,
        nameAr: true,
        nameFr: true,
        geometryType: true,
        isVisible: true,
        zIndex: true,
        style: true,
        createdAt: true,
        createdBy: true,
      },
    });

    // Invalidate cache
    await invalidateLayerCache(id);
    await invalidateAllLayerCaches();

    res.json({
      message: 'Layer updated successfully',
      layer,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/layers/:id/visibility - Toggle layer visibility (editor/admin only)
router.patch('/:id/visibility', requireRole('EDITOR', 'ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { is_visible } = req.body;

    // Check if layer exists and get current visibility
    const existingLayer = await prisma.layer.findUnique({
      where: { id },
      select: { isVisible: true },
    });

    if (!existingLayer) {
      return res.status(404).json({
        error: {
          message: 'Layer not found',
        },
      });
    }

    // Toggle visibility
    const newVisibility = is_visible !== undefined ? is_visible : !existingLayer.isVisible;
    const layer = await prisma.layer.update({
      where: { id },
      data: { isVisible: newVisibility },
    });

    // Invalidate cache
    await invalidateLayerCache(id);
    await invalidateAllLayerCaches();

    res.json({
      message: 'Layer visibility updated successfully',
      layer: {
        id: layer.id,
        is_visible: layer.isVisible,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/layers/:id - Delete layer (admin only)
router.delete('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if layer exists
    const existingLayer = await prisma.layer.findUnique({
      where: { id },
    });

    if (!existingLayer) {
      return res.status(404).json({
        error: {
          message: 'Layer not found',
        },
      });
    }

    // Cascade delete: this will delete all features in this layer
    await prisma.layer.delete({
      where: { id },
    });

    // Invalidate cache
    await invalidateLayerCache(id);
    await invalidateAllLayerCaches();

    res.json({
      message: 'Layer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
