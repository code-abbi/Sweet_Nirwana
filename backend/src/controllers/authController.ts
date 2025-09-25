import { Request, Response } from 'express';
import { UserService } from '../utils/userService';
import { JWTUtils } from '../utils/auth';
import { validateUserRegistration, validateUserLogin, sanitizeUser } from '../utils/validation';

/**
 * Authentication controller
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstName, lastName, password, role } = req.body;

      // Validate input data
      const validation = validateUserRegistration({
        email,
        firstName,
        lastName,
        password,
        role,
      });

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.errors.map(err => err.message).join(', '),
        });
        return;
      }

      // Check if user already exists
      const existingUser = await UserService.userExistsByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists',
        });
        return;
      }

      // Create new user
      const newUser = await UserService.createUser({
        email,
        firstName,
        lastName,
        password,
        role: role || 'user',
      });

      // Generate JWT token
      const token = JWTUtils.generateToken(newUser.id, newUser.role);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: sanitizeUser(newUser),
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during registration',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input data
      const validation = validateUserLogin({ email, password });

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.errors.map(err => err.message).join(', '),
        });
        return;
      }

      // Verify user credentials
      const user = await UserService.verifyPassword(email, password);
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      // Generate JWT token
      const token = JWTUtils.generateToken(user.id, user.role);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: sanitizeUser(user),
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during login',
      });
    }
  }

  /**
   * Get user profile (protected route)
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      const user = await UserService.findUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: sanitizeUser(user),
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

/**
 * Admin controller
 */
export class AdminController {
  /**
   * Get admin statistics
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Demo statistics - In production, these would query the database
      // Example: SELECT COUNT(*) FROM users, sweets, transactions
      res.status(200).json({
        success: true,
        data: {
          totalUsers: 0,    // COUNT(*) FROM users
          totalSweets: 0,   // COUNT(*) FROM sweets  
          totalOrders: 0,   // COUNT(*) FROM transactions WHERE type='purchase'
        },
      });
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}