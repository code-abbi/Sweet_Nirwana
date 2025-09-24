import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/auth';

/**
 * Authentication middleware to protect routes
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
    });
    return;
  }

  const decoded = JWTUtils.verifyToken(token);
  
  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
    return;
  }

  // Add user info to request object
  req.userId = decoded.userId;
  req.userRole = decoded.userRole as 'admin' | 'user';
  
  next();
}

/**
 * Authorization middleware to check for admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
    return;
  }
  
  next();
}

/**
 * Combined middleware for admin-only routes
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  authenticateToken(req, res, (error) => {
    if (error) {
      return next(error);
    }
    
    requireAdmin(req, res, next);
  });
}