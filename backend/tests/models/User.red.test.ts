/**
 * TDD RED PHASE: User Model Failing Tests
 * 
 * This file contains comprehensive failing tests that define the expected behavior
 * of the User model following Test-Driven Development (TDD) methodology.
 * 
 * RED PHASE REQUIREMENTS:
 * - All tests should FAIL initially
 * - Tests define the complete specification for User model functionality
 * - Tests cover authentication, role management, validation, and CRUD operations
 * - Custom error handling and security features included
 * 
 * Expected TDD Flow:
 * 1. RED: Write these failing tests (current phase)
 * 2. GREEN: Implement minimal User model to make tests pass
 * 3. REFACTOR: Improve code quality while keeping tests green
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { User } from '../../src/models/User';
import { cleanDatabase, createTestUser } from '../utils/database';
import type { NewUser, User as UserType } from '../../src/models/schema';

describe('TDD RED PHASE: User Model - Failing Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('User Creation & Validation', () => {
    test('should create a new user with valid data', async () => {
      const userData: NewUser = {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user'
      };

      const user = await User.create(userData);

      expect(user).toBeValidUser();
      expect(user.email).toBe('john.doe@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe('user');
      expect(user.id).toBeValidUUID();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    test('should throw UserValidationError for invalid email format', async () => {
      const userData: NewUser = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe'
      };

      await expect(User.create(userData)).rejects.toThrow('UserValidationError');
      await expect(User.create(userData)).rejects.toThrow('Invalid email format');
    });

    test('should throw UserValidationError for missing required fields', async () => {
      const userDataMissingEmail = {
        firstName: 'John',
        lastName: 'Doe'
      } as NewUser;

      await expect(User.create(userDataMissingEmail)).rejects.toThrow('UserValidationError');
      await expect(User.create(userDataMissingEmail)).rejects.toThrow('Email is required');
    });

    test('should throw UserValidationError for duplicate email', async () => {
      const userData: NewUser = {
        email: 'duplicate@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      await User.create(userData);
      
      await expect(User.create(userData)).rejects.toThrow('UserValidationError');
      await expect(User.create(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('User CRUD Operations', () => {
    test('should find user by ID', async () => {
      const testUser = await createTestUser();
      
      const foundUser = await User.findById(testUser.id);
      
      expect(foundUser).toBeValidUser();
      expect(foundUser?.id).toBe(testUser.id);
      expect(foundUser?.email).toBe(testUser.email);
    });

    test('should return null when user not found by ID', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      
      const user = await User.findById(nonExistentId);
      
      expect(user).toBeNull();
    });

    test('should find user by email', async () => {
      const testUser = await createTestUser();
      
      const foundUser = await User.findByEmail(testUser.email);
      
      expect(foundUser).toBeValidUser();
      expect(foundUser?.email).toBe(testUser.email);
    });

    test('should update user information', async () => {
      const testUser = await createTestUser();
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      const updatedUser = await User.update(testUser.id, updateData);
      
      expect(updatedUser).toBeValidUser();
      expect(updatedUser?.firstName).toBe('Updated');
      expect(updatedUser?.lastName).toBe('Name');
      expect(updatedUser?.updatedAt).not.toEqual(testUser.updatedAt);
    });
  });

  describe('Authentication & Security', () => {
    test('should hash password during user creation', async () => {
      const userData = {
        email: 'secure@example.com',
        firstName: 'Secure',
        lastName: 'User',
        password: 'mySecretPassword123'
      };

      const user = await User.create(userData);
      
      expect(user).toBeValidUser();
      expect(await User.verifyPassword(user.id, 'mySecretPassword123')).toBe(true);
      expect(await User.verifyPassword(user.id, 'wrongPassword')).toBe(false);
    });

    test('should authenticate user with valid credentials', async () => {
      const userData = {
        email: 'auth@example.com',
        firstName: 'Auth',
        lastName: 'User',
        password: 'validPassword123'
      };

      await User.create(userData);
      
      const authenticatedUser = await User.authenticate('auth@example.com', 'validPassword123');
      
      expect(authenticatedUser).toBeValidUser();
      expect(authenticatedUser?.email).toBe('auth@example.com');
    });

    test('should return null for invalid authentication credentials', async () => {
      const userData = {
        email: 'auth@example.com',
        firstName: 'Auth',
        lastName: 'User',
        password: 'validPassword123'
      };

      await User.create(userData);
      
      const result = await User.authenticate('auth@example.com', 'wrongPassword');
      
      expect(result).toBeNull();
    });
  });

  describe('Role Management', () => {
    test('should create user with default role "user"', async () => {
      const userData: NewUser = {
        email: 'defaultrole@example.com',
        firstName: 'Default',
        lastName: 'User'
      };

      const user = await User.create(userData);
      
      expect(user.role).toBe('user');
    });

    test('should create admin user when role is specified', async () => {
      const userData: NewUser = {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      };

      const user = await User.create(userData);
      
      expect(user.role).toBe('admin');
    });

    test('should check if user is admin', async () => {
      const adminData: NewUser = {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      };
      const regularData: NewUser = {
        email: 'regular@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user'
      };

      const admin = await User.create(adminData);
      const regular = await User.create(regularData);
      
      expect(await User.isAdmin(admin.id)).toBe(true);
      expect(await User.isAdmin(regular.id)).toBe(false);
    });
  });

  describe('Data Validation & Sanitization', () => {
    test('should sanitize email to lowercase', async () => {
      const userData: NewUser = {
        email: 'UPPERCASE@EXAMPLE.COM',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);
      
      expect(user.email).toBe('uppercase@example.com');
    });

    test('should validate firstName length constraints', async () => {
      const shortName: NewUser = {
        email: 'short@example.com',
        firstName: 'A',
        lastName: 'User'
      };
      const longName: NewUser = {
        email: 'long@example.com',
        firstName: 'A'.repeat(101),
        lastName: 'User'
      };

      await expect(User.create(shortName)).rejects.toThrow('UserValidationError');
      await expect(User.create(shortName)).rejects.toThrow('First name must be between 2 and 100 characters');
      
      await expect(User.create(longName)).rejects.toThrow('UserValidationError');
      await expect(User.create(longName)).rejects.toThrow('First name must be between 2 and 100 characters');
    });

    test('should validate lastName length constraints', async () => {
      const invalidLastName: NewUser = {
        email: 'lastname@example.com',
        firstName: 'Valid',
        lastName: 'B'.repeat(101)
      };

      await expect(User.create(invalidLastName)).rejects.toThrow('UserValidationError');
      await expect(User.create(invalidLastName)).rejects.toThrow('Last name must be between 2 and 100 characters');
    });
  });

  describe('Clerk Integration', () => {
    test('should create user with Clerk ID', async () => {
      const userData = {
        email: 'clerk@example.com',
        firstName: 'Clerk',
        lastName: 'User',
        clerkId: 'clerk_abc123xyz'
      };

      const user = await User.create(userData);
      
      expect(user.clerkId).toBe('clerk_abc123xyz');
    });

    test('should find user by Clerk ID', async () => {
      const userData = {
        email: 'clerk@example.com',
        firstName: 'Clerk',
        lastName: 'User',
        clerkId: 'clerk_findme123'
      };

      const createdUser = await User.create(userData);
      const foundUser = await User.findByClerkId('clerk_findme123');
      
      expect(foundUser).toBeValidUser();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.clerkId).toBe('clerk_findme123');
    });
  });
});