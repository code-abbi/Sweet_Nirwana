import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'sweet-shop-secret-key';

/**
 * Authentication middleware to protect routes
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Add user info to request object
    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
    return;
  }
}

/**
 * Authorization middleware to check for admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
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