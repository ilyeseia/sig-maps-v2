import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// All feature routes require authentication
router.use(authenticate);

// GET /api/features - List features
router.get('/', async (req, res) => {
  res.json({
    message: 'Feature list - To be implemented in Story 2-3',
  });
});

// GET /api/features/:id - Get feature by ID
router.get('/:id', (req, res) => {
  res.json({
    message: 'Get feature - To be implemented',
  });
});

// POST /api/features - Create feature (editor/admin only)
router.post('/', requireRole('EDITOR', 'ADMIN'), async (req, res) => {
  res.json({
    message: 'Create feature - To be implemented in Story 3-1',
  });
});

// PUT /api/features/:id - Update feature (editor/admin only)
router.put('/:id', requireRole('EDITOR', 'ADMIN'), async (req, res) => {
  res.json({
    message: 'Update feature - To be implemented in Story 3-4',
  });
});

// DELETE /api/features/:id - Delete feature (editor/admin only)
router.delete('/:id', requireRole('EDITOR', 'ADMIN'), async (req, res) => {
  res.json({
    message: 'Delete feature - To be implemented in Story 3-5',
  });
});

export default router;
