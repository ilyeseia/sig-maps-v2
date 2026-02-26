import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All export routes require authentication
router.use(authenticate);

// POST /api/export - Request export job
router.post('/', async (req, res) => {
  res.json({
    message: 'Request export - To be implemented in Story 4-1',
  });
});

// GET /api/export/:id - Get export job status
router.get('/:id', async (req, res) => {
  res.json({
    message: 'Get export status - To be implemented',
  });
});

// GET /api/export/:id/download - Download exported file
router.get('/:id/download', async (req, res) => {
  res.json({
    message: 'Download export - To be implemented in Story 4-1',
  });
});

export default router;
