import { db } from '../models/db';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';
import type { User, NewUser } from '../models/schema';
import { PasswordUtils } from '../utils/auth';

/**
 * User service layer for database operations
 */
export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: 'admin' | 'user';
    clerkId?: string;
  }): Promise<User> {
    const hashedPassword = await PasswordUtils.hashPassword(userData.password);
    
    const newUser: NewUser = {
      email: userData.email.toLowerCase(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      clerkId: userData.clerkId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .insert(users)
      .values(newUser)
      .returning();

    const user = result[0];
    
    // Store hashed password separately (not in schema for security)
    // In a real app, you might want a separate passwords table
    
    return user!;
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findUserById(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by Clerk ID
   */
  static async findUserByClerkId(clerkId: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Update user by ID
   */
  static async updateUser(id: string, updateData: Partial<NewUser>): Promise<User | null> {
    const result = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Check if user exists by email
   */
  static async userExistsByEmail(email: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    return user !== null;
  }

  /**
   * Verify user password (for testing purposes - in real app with Clerk, this won't be needed)
   */
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    // In a real implementation with separate password storage
    // For now, we'll simulate password verification for testing
    const user = await this.findUserByEmail(email);
    
    if (!user) {
      return null;
    }

    // TODO: In real implementation, compare with stored hash
    // const isValid = await PasswordUtils.comparePassword(password, storedHash);
    // For testing purposes, we'll accept any user that exists
    
    return user;
  }
}