import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users/me - Get current user
router.get('/me', (req: AuthRequest, res) => {
  res.json({
    user: req.user,
  });
});

// GET /api/users - List all users (admin only)
router.get('/', requireRole('ADMIN'), async (req, res) => {
  res.json({
    message: 'User list - To be implemented in Story 5-1',
  });
});

// POST /api/users - Create user (admin only)
router.post('/', requireRole('ADMIN'), async (req, res) => {
  res.json({
    message: 'Create user - To be implemented in Story 5-1',
  });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  res.json({
    message: 'Get user - To be implemented',
  });
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  res.json({
    message: 'Update user - To be implemented in Story 5-2',
  });
});

// PATCH /api/users/:id/role - Change user role (admin only)
router.patch('/:id/role', requireRole('ADMIN'), async (req, res) => {
  res.json({
    message: 'Change role - To be implemented in Story 5-2',
  });
});

// PATCH /api/users/:id/status - Activate/deactivate user (admin only)
router.patch('/:id/status', requireRole('ADMIN'), async (req, res) => {
  res.json({
    message: 'Change status - To be implemented in Story 5-3',
  });
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  res.json({
    message: 'Delete user - To be implemented in Story 5-1',
  });
});

export default router;
