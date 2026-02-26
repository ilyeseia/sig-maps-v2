import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// All layer routes require authentication
router.use(authenticate);

// GET /api/layers - List all layers
router.get('/', async (req: AuthRequest, res) => {
  res.json({
    message: 'Layer list - To be implemented in Story 2-2',
  });
});

// GET /api/layers/:id - Get layer by ID
router.get('/:id', (req, res) => {
  res.json({
    message: 'Get layer - To be implemented',
  });
});

// POST /api/layers - Create layer (editor/admin only)
router.post('/', requireRole('EDITOR', 'ADMIN'), async (req, res) => {
  res.json({
    message: 'Create layer - To be implemented in Story 2-2',
  });
});

// PUT /api/layers/:id - Update layer (editor/admin only)
router.put('/:id', requireRole('EDITOR', 'ADMIN'), async (req, res) => {
  res.json({
    message: 'Update layer - To be implemented',
  });
});

// DELETE /api/layers/:id - Delete layer (admin only)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  res.json({
    message: 'Delete layer - To be implemented',
  });
});

export default router;
