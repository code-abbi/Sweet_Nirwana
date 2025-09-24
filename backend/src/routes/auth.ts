import { Router } from 'express';
import { AuthController, AdminController } from '../controllers/authController';
import { authenticateToken, adminOnly } from '../middleware/auth';

const router = Router();

/**
 * Authentication routes
 */

// POST /api/auth/register - Register new user
router.post('/register', AuthController.register);

// POST /api/auth/login - Login user
router.post('/login', AuthController.login);

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * Admin routes
 */

// GET /api/admin/stats - Get admin statistics (admin only)
router.get('/admin/stats', adminOnly, AdminController.getStats);

export default router;