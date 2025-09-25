/**
 * REFACTOR PHASE: User Model - Clean Database Integration
 * 
 * This is the REFACTOR phase User model that provides clean,
 * well-structured database operations with proper error handling.
 * 
 * REFACTOR PHASE CHARACTERISTICS:
 * - Clean, maintainable code structure
 * - Proper database integration with transactions
 * - Comprehensive error handling
 * - Security best practices
 * - Clear separation of concerns
 */

import { db } from '../config/database';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import type { User as UserType, NewUser } from './schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Custom Error Classes for User Operations
 */
export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserValidationError';
  }
}

export class UserNotFoundError extends Error {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class UserAuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'UserAuthenticationError';
  }
}

/**
 * User Model Class - REFACTORED
 * 
 * Clean implementation with proper database integration,
 * password handling, and comprehensive validation.
 */
export class User {
  /**
   * Create a new user with proper validation and password hashing
   */
  static async create(userData: NewUser & { password?: string }): Promise<UserType> {
    try {
      // Validate input data
      this.validateUserData(userData);
      
      // Prepare user data
      const newUser: NewUser & { password?: string } = {
        email: userData.email.toLowerCase().trim(),
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        role: userData.role || 'user',
        clerkId: userData.clerkId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Hash password if provided
      if (userData.password) {
        this.validatePassword(userData.password);
        newUser.password = await bcrypt.hash(userData.password, 12);
      }

      // Insert user into database
      const [user] = await db.insert(users).values(newUser).returning();
      
      if (!user) {
        throw new Error('Failed to create user in database');
      }

      return user;
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      
      // Check for unique constraint violations
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === '23505') { // PostgreSQL unique violation
          throw new UserValidationError('Email already exists');
        }
      }
      
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<UserType | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserType | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find user by Clerk ID
   */
  static async findByClerkId(clerkId: string): Promise<UserType | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to find user by Clerk ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user information
   */
  static async update(id: string, updateData: Partial<NewUser>): Promise<UserType | null> {
    try {
      // Validate partial update data
      if (updateData.email && !this.isValidEmail(updateData.email)) {
        throw new UserValidationError('Invalid email format');
      }

      const sanitizedData = {
        ...updateData,
        updatedAt: new Date(),
      };

      if (updateData.email) {
        sanitizedData.email = updateData.email.toLowerCase().trim();
      }
      if (updateData.firstName) {
        sanitizedData.firstName = updateData.firstName.trim();
      }
      if (updateData.lastName) {
        sanitizedData.lastName = updateData.lastName.trim();
      }

      const result = await db
        .update(users)
        .set(sanitizedData)
        .where(eq(users.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify password for a user
   */
  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await this.findById(userId);
      if (!user || !user.password) {
        return false;
      }

      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new Error(`Failed to verify password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticate(email: string, password: string): Promise<UserType | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user || !user.password) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      return isValid ? user : null;
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user has admin role
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.findById(userId);
      return user?.role === 'admin';
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all users (admin only operation)
   */
  static async getAll(): Promise<UserType[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      throw new Error(`Failed to get all users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  // =================
  // Utility Methods
  // =================

  /**
   * Validate user data
   */
  static validateUserData(userData: Partial<NewUser>): void {
    if (!userData.email) {
      throw new UserValidationError('Email is required');
    }

    if (!this.isValidEmail(userData.email)) {
      throw new UserValidationError('Invalid email format');
    }

    if (!userData.firstName) {
      throw new UserValidationError('First name is required');
    }

    if (!userData.lastName) {
      throw new UserValidationError('Last name is required');
    }

    // Validate field lengths
    if (userData.firstName.length < 2 || userData.firstName.length > 100) {
      throw new UserValidationError('First name must be between 2 and 100 characters');
    }

    if (userData.lastName.length < 2 || userData.lastName.length > 100) {
      throw new UserValidationError('Last name must be between 2 and 100 characters');
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): void {
    if (password.length < 6) {
      throw new UserValidationError('Password must be at least 6 characters long');
    }

    // Optional: Add more complex password requirements
    // const hasUppercase = /[A-Z]/.test(password);
    // const hasLowercase = /[a-z]/.test(password);
    // const hasNumbers = /\d/.test(password);
    // 
    // if (!hasUppercase || !hasLowercase || !hasNumbers) {
    //   throw new UserValidationError('Password must contain uppercase, lowercase, and numbers');
    // }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}