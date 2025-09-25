/**
 * Basic Test to Verify Jest Setup
 * 
 * Simple test to ensure our testing environment is working
 */

import { describe, test, expect } from '@jest/globals';

describe('Basic Test Setup', () => {
  test('Jest is working correctly', () => {
    expect(true).toBe(true);
  });

  test('Environment variables are loaded', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('Custom matchers are available', () => {
    // Test our custom UUID matcher
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    expect(validUUID).toBeValidUUID();
    
    const invalidUUID = 'not-a-uuid';
    expect(invalidUUID).not.toBeValidUUID();
  });
});