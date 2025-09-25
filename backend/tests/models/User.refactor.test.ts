/**
 * TDD REFACTOR PHASE: User Model Enhanced Tests
 * 
 * Enhanced tests for the REFACTOR phase that test advanced functionality,
 * security features, and production-ready implementations.
 * 
 * REFACTOR PHASE CHARACTERISTICS:
 * - Test enhanced security features (JWT, password policies)
 * - Test advanced validation and sanitization
 * - Test database transactions and error handling
 * - Test performance and optimization features
 * - Test production-ready authentication flows
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { User, UserValidationError, UserNotFoundError } from '../../src/models/User';
import type { NewUser } from '../../src/models/schema';

// Enhanced mocking for REFACTOR phase
jest.mock('../../src/config/database', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{
          id: 'refactor-uuid-456',
          email: 'refactor@example.com',
          firstName: 'Refactor',
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
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: 'refactor-uuid-456',
            email: 'updated@example.com',
            firstName: 'Updated',
            lastName: 'User',
            role: 'admin',
            clerkId: null,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
          }])
        })
      })
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'deleted-uuid' }])
      })
    }),
    transaction: jest.fn()
  }
}));

describe('TDD REFACTOR PHASE: User Model - Enhanced Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Enhanced Security Features', () => {
    test('should enforce strong password policies', () => {
      const weakPasswords = [
        '123',           // too short
        'password',      // no numbers/special chars
        '12345678',      // only numbers
        'ABCDEFGH',      // only uppercase
        'abcdefgh'       // only lowercase
      ];

      weakPasswords.forEach(password => {
        expect(() => User.validatePasswordStrength(password))
          .toThrow('Password does not meet security requirements');
      });

      // Strong password should pass
      const strongPassword = 'StrongPass123!';
      expect(() => User.validatePasswordStrength(strongPassword)).not.toThrow();
    });

    test('should generate secure JWT tokens', async () => {
      const userData = {
        id: 'test-uuid-123',
        email: 'jwt@example.com',
        role: 'user' as const
      };

      const token = await User.generateJWT(userData);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should verify and decode JWT tokens', async () => {
      const userData = {
        id: 'test-uuid-123',
        email: 'jwt@example.com',
        role: 'user' as const
      };

      const token = await User.generateJWT(userData);
      const decoded = await User.verifyJWT(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.id).toBe(userData.id);
      expect(decoded?.email).toBe(userData.email);
      expect(decoded?.role).toBe(userData.role);
    });

    test('should handle expired JWT tokens', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      const decoded = await User.verifyJWT(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Advanced Validation & Sanitization', () => {
    test('should prevent SQL injection in inputs', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "admin'--",
        "' OR '1'='1",
        "<script>alert('xss')</script>"
      ];

      maliciousInputs.forEach(maliciousInput => {
        const userData: Partial<NewUser> = {
          email: `${maliciousInput}@example.com`,
          firstName: maliciousInput,
          lastName: maliciousInput
        };

        const sanitized = User.sanitizeUserInput(userData);
        
        // Should strip dangerous characters
        expect(sanitized.firstName).not.toContain('<script>');
        expect(sanitized.firstName).not.toContain('DROP TABLE');
        expect(sanitized.lastName).not.toContain("'");
      });
    });

    test('should validate and normalize phone numbers', () => {
      const phoneNumbers = [
        '+1 (555) 123-4567',
        '555-123-4567',
        '5551234567',
        '+1-555-123-4567'
      ];

      phoneNumbers.forEach(phone => {
        const normalized = User.normalizePhoneNumber(phone);
        expect(normalized).toMatch(/^\+1\d{10}$/); // +1XXXXXXXXXX format
      });
    });

    test('should validate international email domains', () => {
      const internationalEmails = [
        'user@münchen.de',
        'test@пример.рф',
        'user@例え.テスト'
      ];

      internationalEmails.forEach(email => {
        const isValid = User.isValidEmail(email);
        expect(isValid).toBe(true);
      });
    });

    test('should sanitize display names for XSS prevention', () => {
      const maliciousName = '<script>alert("xss")</script>John';
      const sanitized = User.sanitizeDisplayName(maliciousName);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toBe('John');
    });
  });

  describe('Database Transactions & Error Handling', () => {
    test('should handle database transaction rollbacks', async () => {
      const userData: NewUser = {
        email: 'transaction@example.com',
        firstName: 'Transaction',
        lastName: 'Test'
      };

      // Mock database error during transaction
      const mockDb = require('../../src/config/database').db;
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database connection lost'))
        })
      });

      await expect(User.create(userData)).rejects.toThrow();
      
      // Verify rollback cleanup happened
      expect(User.getTransactionStatus()).toBe('rolled_back');
    });

    test('should throw UserNotFoundError for missing users', async () => {
      await expect(User.findByIdOrThrow('non-existent-id'))
        .rejects.toThrow(UserNotFoundError);
      
      await expect(User.findByIdOrThrow('non-existent-id'))
        .rejects.toThrow('User not found with ID: non-existent-id');
    });

    test('should handle concurrent user creation conflicts', async () => {
      const userData: NewUser = {
        email: 'concurrent@example.com',
        firstName: 'Concurrent',
        lastName: 'Test'
      };

      // Simulate concurrent creation attempts
      const promises = Array(5).fill(null).map(() => User.create(userData));
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful).toHaveLength(1); // Only one should succeed
      expect(failed.length).toBeGreaterThan(0); // Others should fail with duplicate email
    });
  });

  describe('Performance & Optimization', () => {
    test('should cache frequently accessed user data', async () => {
      const userId = 'cache-test-uuid';
      
      // First access - should query database
      await User.findById(userId);
      expect(User.getCacheHitRate()).toBe(0);
      
      // Second access - should hit cache
      await User.findById(userId);
      expect(User.getCacheHitRate()).toBeGreaterThan(0);
    });

    test('should implement efficient bulk user operations', async () => {
      const users = Array(100).fill(null).map((_, i) => ({
        email: `bulk${i}@example.com`,
        firstName: `User${i}`,
        lastName: 'Bulk'
      }));

      const startTime = Date.now();
      await User.createBulk(users);
      const endTime = Date.now();

      // Bulk operation should be faster than individual creates
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });

    test('should optimize database queries with indexing', async () => {
      await User.findByEmail('optimize@example.com');
      
      const queryStats = User.getQueryStats();
      expect(queryStats.lastQuery.executionTime).toBeLessThan(50); // Less than 50ms
      expect(queryStats.indexesUsed).toContain('idx_users_email');
    });
  });

  describe('Advanced Role Management', () => {
    test('should support hierarchical role permissions', () => {
      const roles = ['guest', 'user', 'moderator', 'admin', 'superadmin'];
      
      // Admin should have permissions of lower roles
      expect(User.hasPermission('admin', 'user_read')).toBe(true);
      expect(User.hasPermission('admin', 'admin_create')).toBe(true);
      
      // User should not have admin permissions
      expect(User.hasPermission('user', 'admin_create')).toBe(false);
      expect(User.hasPermission('user', 'user_read')).toBe(true);
    });

    test('should validate role transitions', () => {
      // Valid transitions
      expect(() => User.validateRoleTransition('user', 'moderator')).not.toThrow();
      expect(() => User.validateRoleTransition('moderator', 'admin')).not.toThrow();
      
      // Invalid transitions (demotion requires special permission)
      expect(() => User.validateRoleTransition('admin', 'user'))
        .toThrow('Role demotion requires special authorization');
    });

    test('should track role change history', async () => {
      const userId = 'role-history-test';
      
      await User.updateRole(userId, 'moderator', 'admin-user-id');
      await User.updateRole(userId, 'admin', 'superadmin-user-id');
      
      const history = await User.getRoleHistory(userId);
      
      expect(history).toHaveLength(2);
      expect(history[0].fromRole).toBe('user');
      expect(history[0].toRole).toBe('moderator');
      expect(history[1].fromRole).toBe('moderator');
      expect(history[1].toRole).toBe('admin');
    });
  });

  describe('Audit Logging & Security Monitoring', () => {
    test('should log authentication attempts', async () => {
      await User.authenticate('audit@example.com', 'password123');
      
      const logs = User.getAuditLogs();
      const authLog = logs.find(log => log.action === 'authentication_attempt');
      
      expect(authLog).toBeTruthy();
      expect(authLog?.userEmail).toBe('audit@example.com');
      expect(authLog?.timestamp).toBeInstanceOf(Date);
      expect(authLog?.ipAddress).toBeTruthy();
    });

    test('should detect suspicious login patterns', async () => {
      const suspiciousIPs = ['192.168.1.100', '10.0.0.50', '172.16.0.10'];
      
      // Simulate multiple failed attempts from different IPs
      for (const ip of suspiciousIPs) {
        await User.authenticate('target@example.com', 'wrong-password', ip);
      }
      
      const alerts = User.getSecurityAlerts();
      expect(alerts.some(alert => alert.type === 'distributed_brute_force')).toBe(true);
    });

    test('should implement account lockout after failed attempts', async () => {
      const email = 'lockout@example.com';
      
      // Simulate 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await User.authenticate(email, 'wrong-password');
      }
      
      // Account should be locked
      const user = await User.findByEmail(email);
      expect(user?.isLocked).toBe(true);
      expect(user?.lockoutExpires).toBeInstanceOf(Date);
      
      // Even correct password should fail when locked
      const result = await User.authenticate(email, 'correct-password');
      expect(result).toBeNull();
    });
  });
});