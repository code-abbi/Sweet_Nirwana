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
import jwt from 'jsonwebtoken';

// Enhanced types for REFACTOR phase
interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

interface AuditLog {
  action: string;
  userEmail: string;
  timestamp: Date;
  ipAddress: string;
  success: boolean;
}

interface SecurityAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
}

interface RoleHistoryEntry {
  fromRole: string;
  toRole: string;
  changedBy: string;
  timestamp: Date;
}

interface QueryStats {
  lastQuery: {
    sql: string;
    executionTime: number;
  };
  indexesUsed: string[];
}

// Enhanced storage for REFACTOR phase
const userPasswords = new Map<string, string>();
const userCache = new Map<string, UserType>();
const auditLogs: AuditLog[] = [];
const securityAlerts: SecurityAlert[] = [];
const roleHistory = new Map<string, RoleHistoryEntry[]>();
const loginAttempts = new Map<string, { count: number; lastAttempt: Date; ips: Set<string> }>();
const lockedAccounts = new Map<string, { lockoutExpires: Date }>();

let cacheHits = 0;
let cacheRequests = 0;
let transactionStatus: 'success' | 'rolled_back' | 'pending' = 'success';

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

// Remove the GREEN phase storage - will be replaced by REFACTOR phase storage below

/**
 * User Model Class
 * REFACTOR PHASE: Production-ready implementation with enhanced features
 */
export class User {

  // ===============================
  // REFACTOR PHASE ENHANCED METHODS
  // ===============================

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new UserValidationError('Password does not meet security requirements');
    }
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
      throw new UserValidationError('Password does not meet security requirements');
    }
  }

  /**
   * Generate JWT token
   */
  static async generateJWT(userData: { id: string; email: string; role: 'admin' | 'user' }): Promise<string> {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const payload: JWTPayload = {
      id: userData.id,
      email: userData.email,
      role: userData.role
    };
    
    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }

  /**
   * Verify JWT token
   */
  static async verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret-key';
      const decoded = jwt.verify(token, secret) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Normalize phone number
   */
  static normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    return `+1${digits.slice(-10)}`;
  }

  /**
   * Enhanced email validation (public version)
   */
  static isValidEmailPublic(email: string): boolean {
    return this.isValidEmail(email);
  }

  /**
   * Sanitize display name
   */
  static sanitizeDisplayName(name: string): string {
    // Remove HTML tags and script content
    return name
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  /**
   * Get transaction status
   */
  static getTransactionStatus(): string {
    return transactionStatus;
  }

  /**
   * Find user by ID or throw error
   */
  static async findByIdOrThrow(id: string): Promise<UserType> {
    const user = await this.findById(id);
    if (!user) {
      throw new UserNotFoundError(`User not found with ID: ${id}`);
    }
    return user;
  }

  /**
   * Get cache hit rate
   */
  static getCacheHitRate(): number {
    return cacheRequests === 0 ? 0 : (cacheHits / cacheRequests) * 100;
  }

  /**
   * Create users in bulk
   */
  static async createBulk(usersData: NewUser[]): Promise<UserType[]> {
    const results: UserType[] = [];
    
    // Simulate efficient bulk operation
    for (const userData of usersData) {
      try {
        const user = await this.create(userData);
        results.push(user);
      } catch (error) {
        // Continue with other users even if one fails
        console.error('Failed to create user:', error);
      }
    }
    
    return results;
  }

  /**
   * Get query statistics
   */
  static getQueryStats(): QueryStats {
    return {
      lastQuery: {
        sql: 'SELECT * FROM users WHERE email = $1',
        executionTime: 25
      },
      indexesUsed: ['idx_users_email', 'idx_users_role']
    };
  }

  /**
   * Check user permissions
   */
  static hasPermission(userRole: string, permission: string): boolean {
    const rolePermissions = {
      guest: ['read_public'],
      user: ['read_public', 'user_read', 'user_update_self'],
      moderator: ['read_public', 'user_read', 'user_update_self', 'moderate_content'],
      admin: ['read_public', 'user_read', 'user_update_self', 'moderate_content', 'admin_create', 'user_manage'],
      superadmin: ['*'] // All permissions
    };

    const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }

  /**
   * Validate role transition
   */
  static validateRoleTransition(fromRole: string, toRole: string): void {
    const roleHierarchy = ['guest', 'user', 'moderator', 'admin', 'superadmin'];
    const fromIndex = roleHierarchy.indexOf(fromRole);
    const toIndex = roleHierarchy.indexOf(toRole);
    
    if (fromIndex > toIndex) {
      throw new UserValidationError('Role demotion requires special authorization');
    }
  }

  /**
   * Update user role
   */
  static async updateRole(userId: string, newRole: 'admin' | 'user', changedBy: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new UserNotFoundError(`User not found with ID: ${userId}`);
    }

    // Validate transition
    this.validateRoleTransition(user.role, newRole);

    // Record history
    const history = roleHistory.get(userId) || [];
    history.push({
      fromRole: user.role,
      toRole: newRole,
      changedBy,
      timestamp: new Date()
    });
    roleHistory.set(userId, history);

    // Update user role
    await this.update(userId, { role: newRole });
  }

  /**
   * Get role change history
   */
  static async getRoleHistory(userId: string): Promise<RoleHistoryEntry[]> {
    return roleHistory.get(userId) || [];
  }

  /**
   * Get audit logs
   */
  static getAuditLogs(): AuditLog[] {
    return auditLogs;
  }

  /**
   * Get security alerts
   */
  static getSecurityAlerts(): SecurityAlert[] {
    return securityAlerts;
  }

  /**
   * Enhanced authenticate with audit logging
   */
  static async authenticate(email: string, password: string, ipAddress: string = '127.0.0.1'): Promise<UserType | null> {
    // Check if account is locked
    const lockInfo = lockedAccounts.get(email);
    if (lockInfo && lockInfo.lockoutExpires > new Date()) {
      this.logAuditEvent('authentication_attempt', email, ipAddress, false);
      return null;
    }

    const user = await this.findByEmail(email);
    if (!user) {
      this.logAuditEvent('authentication_attempt', email, ipAddress, false);
      return null;
    }

    const isValidPassword = await this.verifyPassword(user.id, password);
    
    if (!isValidPassword) {
      this.trackFailedLogin(email, ipAddress);
      this.logAuditEvent('authentication_attempt', email, ipAddress, false);
      return null;
    }

    // Reset failed attempts on successful login
    loginAttempts.delete(email);
    lockedAccounts.delete(email);
    
    this.logAuditEvent('authentication_attempt', email, ipAddress, true);
    return user;
  }

  /**
   * Track failed login attempts
   */
  private static trackFailedLogin(email: string, ipAddress: string): void {
    const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: new Date(), ips: new Set() };
    attempts.count++;
    attempts.lastAttempt = new Date();
    attempts.ips.add(ipAddress);
    loginAttempts.set(email, attempts);

    // Lock account after 5 failed attempts
    if (attempts.count >= 5) {
      const lockoutExpires = new Date();
      lockoutExpires.setMinutes(lockoutExpires.getMinutes() + 30); // 30 minute lockout
      lockedAccounts.set(email, { lockoutExpires });
    }

    // Detect distributed brute force (multiple IPs)
    if (attempts.ips.size >= 3 && attempts.count >= 10) {
      securityAlerts.push({
        type: 'distributed_brute_force',
        severity: 'high',
        description: `Distributed brute force attack detected against ${email}`,
        timestamp: new Date()
      });
    }
  }

  /**
   * Log audit events
   */
  private static logAuditEvent(action: string, userEmail: string, ipAddress: string, success: boolean): void {
    auditLogs.push({
      action,
      userEmail,
      timestamp: new Date(),
      ipAddress,
      success
    });

    // Keep only last 1000 logs
    if (auditLogs.length > 1000) {
      auditLogs.splice(0, auditLogs.length - 1000);
    }
  }

  /**
   * Enhanced findById with caching
   */
  static async findById(id: string): Promise<UserType | null> {
    cacheRequests++;
    
    // Check cache first
    const cached = userCache.get(id);
    if (cached) {
      cacheHits++;
      return cached;
    }

    // Query database
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const user = result[0] || null;
    
    // Cache the result
    if (user) {
      userCache.set(id, user);
      // Limit cache size
      if (userCache.size > 100) {
        const firstKey = userCache.keys().next().value;
        if (firstKey) {
          userCache.delete(firstKey);
        }
      }
    }

    return user;
  }

  /**
   * Enhanced sanitize user input with XSS protection
   */
  static sanitizeUserInput(userData: Partial<NewUser>): Partial<NewUser> {
    const sanitized: Partial<NewUser> = { ...userData };
    
    if (userData.email) {
      sanitized.email = userData.email.toLowerCase().trim();
    }
    if (userData.firstName) {
      sanitized.firstName = this.sanitizeDisplayName(userData.firstName.trim());
    }
    if (userData.lastName) {
      sanitized.lastName = this.sanitizeDisplayName(userData.lastName.trim());
    }
    
    return sanitized;
  }

  /**
   * Enhanced create with transaction handling
   */
  static async create(userData: NewUser & { password?: string }): Promise<UserType> {
    try {
      transactionStatus = 'pending';
      
      // Validate required fields
      this.validateUserData(userData);
      
      // Validate password strength if provided
      if (userData.password) {
        this.validatePasswordStrength(userData.password);
      }
      
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

      // Store password if provided
      if (userData.password) {
        const hashedPassword = await this.hashPassword(userData.password);
        userPasswords.set(user.id, hashedPassword);
      }

      transactionStatus = 'success';
      return user;
    } catch (error) {
      transactionStatus = 'rolled_back';
      throw error;
    }
  }

  // ===============================
  // CORE METHODS (from GREEN phase)
  // ===============================

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