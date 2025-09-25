/**
 * Jest Test Setup Configuration
 * 
 * This file configures the testing environment for the Sweet Shop application.
 * It sets up database connections, mock configurations, and global test utilities.
 */

import { db } from '../src/models/db';
import { testConnection } from '../src/models/db';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Mock external dependencies
jest.mock('../src/middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 'test-user-id', email: 'test@example.com', role: 'user' };
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  })
}));

// Setup and teardown hooks
beforeAll(async () => {
  console.log('🚀 Setting up test environment...');
  
  // For TDD RED phase, we'll skip database connection
  // TODO: Enable database connection for integration tests later
  console.log('🧪 Test environment setup completed (database connection skipped for RED phase)');
});

afterAll(async () => {
  // Close database connections
  console.log('🧹 Cleaning up test environment');
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidSweet(): R;
      toBeValidUser(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    
    return {
      message: () => `expected ${received} to be a valid UUID`,
      pass,
    };
  },
  
  toBeValidSweet(received: any) {
    const requiredFields = ['id', 'name', 'category', 'price', 'quantity'];
    const hasAllFields = requiredFields.every(field => field in received);
    const hasValidTypes = 
      typeof received.name === 'string' &&
      typeof received.category === 'string' &&
      (typeof received.price === 'string' || typeof received.price === 'number') &&
      typeof received.quantity === 'number';
    
    const pass = hasAllFields && hasValidTypes;
    
    return {
      message: () => `expected ${JSON.stringify(received)} to be a valid sweet object`,
      pass,
    };
  },
  
  toBeValidUser(received: any) {
    const requiredFields = ['id', 'email', 'firstName', 'lastName', 'role'];
    const hasAllFields = requiredFields.every(field => field in received);
    const hasValidTypes = 
      typeof received.email === 'string' &&
      typeof received.firstName === 'string' &&
      typeof received.lastName === 'string' &&
      ['admin', 'user'].includes(received.role);
    
    const pass = hasAllFields && hasValidTypes;
    
    return {
      message: () => `expected ${JSON.stringify(received)} to be a valid user object`,
      pass,
    };
  }
});

export {};