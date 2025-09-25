/**
 * TDD GREEN PHASE: User Model Simple Tests
 * 
 * Simplified tests for the GREEN phase that focus on testing the User model
 * functionality without complex database setup.
 */

import { describe, test, expect } from '@jest/globals';
import { User, UserValidationError } from '../../src/models/User';
import type { NewUser } from '../../src/models/schema';

// Mock the database module
jest.mock('../../src/config/database', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{
          id: 'test-uuid-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
          clerkId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }])
      })
    }),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      })
    }),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

describe('TDD GREEN PHASE: User Model - Simple Tests', () => {
  describe('Input Validation', () => {
    test('should validate email format', () => {
      const invalidData: Partial<NewUser> = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => User.validateUserData(invalidData)).toThrow(UserValidationError);
      expect(() => User.validateUserData(invalidData)).toThrow('Invalid email format');
    });

    test('should validate required fields', () => {
      const missingEmail = { firstName: 'John', lastName: 'Doe' } as Partial<NewUser>;
      expect(() => User.validateUserData(missingEmail)).toThrow('Email is required');

      const missingFirstName = { email: 'test@example.com', lastName: 'Doe' } as Partial<NewUser>;
      expect(() => User.validateUserData(missingFirstName)).toThrow('First name is required');

      const missingLastName = { email: 'test@example.com', firstName: 'John' } as Partial<NewUser>;
      expect(() => User.validateUserData(missingLastName)).toThrow('Last name is required');
    });

    test('should validate field lengths', () => {
      const shortFirstName: Partial<NewUser> = {
        email: 'test@example.com',
        firstName: 'A',
        lastName: 'User'
      };
      expect(() => User.validateUserData(shortFirstName)).toThrow('First name must be between 2 and 100 characters');

      const longLastName: Partial<NewUser> = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'A'.repeat(101)
      };
      expect(() => User.validateUserData(longLastName)).toThrow('Last name must be between 2 and 100 characters');
    });

    test('should pass validation with valid data', () => {
      const validData: Partial<NewUser> = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => User.validateUserData(validData)).not.toThrow();
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize email to lowercase', () => {
      const userData: Partial<NewUser> = {
        email: 'UPPERCASE@EXAMPLE.COM',
        firstName: 'Test',
        lastName: 'User'
      };

      const sanitized = User.sanitizeUserInput(userData);
      
      expect(sanitized.email).toBe('uppercase@example.com');
    });

    test('should trim whitespace from fields', () => {
      const userData: Partial<NewUser> = {
        email: '  test@example.com  ',
        firstName: '  John  ',
        lastName: '  Doe  '
      };

      const sanitized = User.sanitizeUserInput(userData);
      
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.firstName).toBe('John');
      expect(sanitized.lastName).toBe('Doe');
    });
  });

  describe('Password Utilities', () => {
    test('should hash and compare passwords', async () => {
      const password = 'testPassword123';
      
      const hash = await User.hashPassword(password);
      
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      
      const isMatch = await User.comparePassword(password, hash);
      expect(isMatch).toBe(true);
      
      const isWrongMatch = await User.comparePassword('wrongPassword', hash);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe('Error Classes', () => {
    test('should create UserValidationError instances', () => {
      const error = new UserValidationError('Test validation error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(UserValidationError);
      expect(error.name).toBe('UserValidationError');
      expect(error.message).toBe('Test validation error');
    });
  });
});