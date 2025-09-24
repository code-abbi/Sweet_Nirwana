import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * JWT utility functions
 */
export class JWTUtils {
  private static readonly secret = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * Generate JWT token for user
   */
  static generateToken(userId: string, userRole: string): string {
    const payload = { 
      userId, 
      userRole,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    return jwt.sign(payload, this.secret);
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): { userId: string; userRole: string } | null {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      return {
        userId: decoded.userId,
        userRole: decoded.userRole,
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * Password utility functions
 */
export class PasswordUtils {
  private static readonly saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}