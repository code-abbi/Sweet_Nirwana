/**
 * TDD GREEN PHASE: User Model - Minimal Implementation (Make Tests Pass)
 * 
 * This is the GREEN phase User model implementation that provides minimal
 * functionality to make all RED phase tests pass.
 * 
 * GREEN PHASE CHARACTERISTICS:
 * - Implement minimal functionality to pass tests
 * - Focus on making tests pass, not on optimization
 * - Simple, straightforward implementations
 * - Basic validation and error handling
 * 
 * This follows the TDD methodology:
 * 1. RED: Write failing tests and failing implementation (completed)
 * 2. GREEN: Implement minimal code to make tests pass (current phase)
 * 3. REFACTOR: Improve code quality while keeping tests green (next phase)
 */

import { db } from '../config/database';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import type { User as UserType, NewUser } from './schema';
import bcrypt from 'bcrypt';

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

// In-memory storage for passwords (GREEN phase simplification)
const userPasswords = new Map<string, string>();

/**
 * User Model Class
 * GREEN PHASE: Minimal implementation to make tests pass
 */
export class User {
  /**
   * Create a new user
   */
  static async create(userData: NewUser & { password?: string }): Promise<UserType> {
    // Validate required fields
    this.validateUserData(userData);
    
    // Check for duplicate email
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new UserValidationError('Email already exists');
    }
    
    // Sanitize input
    const sanitizedData = this.sanitizeUserInput(userData);
    
    // Prepare user data
    const newUser: NewUser = {
      email: sanitizedData.email!,
      firstName: sanitizedData.firstName!,
      lastName: sanitizedData.lastName!,
      role: sanitizedData.role || 'user',
      clerkId: sanitizedData.clerkId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert into database
    const [user] = await db.insert(users).values(newUser).returning();
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Store password if provided (simplified for GREEN phase)
    if (userData.password) {
      const hashedPassword = await this.hashPassword(userData.password);
      userPasswords.set(user.id, hashedPassword);
    }

    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserType | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<UserType | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by Clerk ID
   */
  static async findByClerkId(clerkId: string): Promise<UserType | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Update user information
   */
  static async update(id: string, updateData: Partial<NewUser>): Promise<UserType | null> {
    const sanitizedData = this.sanitizeUserInput(updateData);
    
    const result = await db
      .update(users)
      .set({
        ...sanitizedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticate(email: string, password: string): Promise<UserType | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValidPassword = await this.verifyPassword(user.id, password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  /**
   * Verify password for a user
   */
  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    const storedHash = userPasswords.get(userId);
    if (!storedHash) {
      return false;
    }

    return await this.comparePassword(password, storedHash);
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user?.role === 'admin';
  }

  /**
   * Hash password (utility method)
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash (utility method)
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

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
    if (userData.firstName && (userData.firstName.length < 2 || userData.firstName.length > 100)) {
      throw new UserValidationError('First name must be between 2 and 100 characters');
    }

    if (userData.lastName && (userData.lastName.length < 2 || userData.lastName.length > 100)) {
      throw new UserValidationError('Last name must be between 2 and 100 characters');
    }
  }

  /**
   * Sanitize user input
   */
  static sanitizeUserInput(userData: Partial<NewUser>): Partial<NewUser> {
    const sanitized: Partial<NewUser> = { ...userData };
    
    if (userData.email) {
      sanitized.email = userData.email.toLowerCase().trim();
    }
    if (userData.firstName) {
      sanitized.firstName = userData.firstName.trim();
    }
    if (userData.lastName) {
      sanitized.lastName = userData.lastName.trim();
    }
    
    return sanitized;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get all users (admin only)
   */
  static async getAll(): Promise<UserType[]> {
    return await db.select().from(users);
  }

  /**
   * Delete user (admin only)
   */
  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}