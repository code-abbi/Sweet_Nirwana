import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

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

// Admin stats route removed for now - not needed for core API tests

export default router;