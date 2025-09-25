/**
 * Sweet Model Tests - TDD GREEN Phase
 * 
 * This is the GREEN phase of Test-Driven Development.
 * These tests will verify that our Sweet model implementation works correctly.
 * 
 * Note: These tests use mocked database functionality to avoid external dependencies
 * while testing the business logic.
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sweet } from '../../src/models/Sweet';

// Mock the database module
jest.mock('../../src/config/database', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the schema
jest.mock('../../src/models/schema', () => ({
  sweets: {
    id: 'id',
    name: 'name',
    category: 'category', 
    price: 'price',
    quantity: 'quantity',
    description: 'description',
    imageUrl: 'imageUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

// Mock drizzle-orm functions
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(() => 'mocked_eq'),
  and: jest.fn(() => 'mocked_and'),
  sql: jest.fn(() => 'mocked_sql'),
  gte: jest.fn(() => 'mocked_gte'),
  lte: jest.fn(() => 'mocked_lte'),
  ilike: jest.fn(() => 'mocked_ilike'),
}));

describe('Sweet Model - TDD GREEN Phase (Implementation Tests)', () => {
  let mockDb: any;

  beforeEach(() => {
    // Get the mocked database
    mockDb = require('../../src/config/database').db;
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Sweet Creation (GREEN Phase)', () => {
    
    test('should create a new sweet with valid data', async () => {
      // Arrange
      const sweetData = {
        name: 'Gulab Jamun',
        category: 'Traditional',
        price: '150.00',
        quantity: 25,
        description: 'Soft and spongy milk dumplings',
        imageUrl: '/images/gulab-jamun.jpg'
      };

      const expectedSweet = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...sweetData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the database response
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([expectedSweet])
        })
      });

      // Act
      const result = await Sweet.create(sweetData);

      // Assert
      expect(result).toEqual(expectedSweet);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    test('should throw error when name is missing', async () => {
      // Arrange
      const invalidData = {
        category: 'Traditional',
        price: '150.00'
      };

      // Act & Assert
      await expect(Sweet.create(invalidData as any)).rejects.toThrow('Name is required');
    });

    test('should throw error when category is missing', async () => {
      // Arrange  
      const invalidData = {
        name: 'Test Sweet',
        price: '150.00'
      };

      // Act & Assert
      await expect(Sweet.create(invalidData as any)).rejects.toThrow('Category is required');
    });

    test('should throw error when price is missing', async () => {
      // Arrange
      const invalidData = {
        name: 'Test Sweet',
        category: 'Traditional'
      };

      // Act & Assert
      await expect(Sweet.create(invalidData as any)).rejects.toThrow('Price is required');
    });

    test('should throw error for invalid price format', async () => {
      // Arrange
      const invalidData = {
        name: 'Test Sweet',
        category: 'Traditional',
        price: 'invalid-price'
      };

      // Act & Assert
      await expect(Sweet.create(invalidData)).rejects.toThrow('Invalid price format');
    });

    test('should throw error for negative quantity', async () => {
      // Arrange
      const invalidData = {
        name: 'Test Sweet',
        category: 'Traditional',
        price: '100.00',
        quantity: -5
      };

      // Act & Assert
      await expect(Sweet.create(invalidData)).rejects.toThrow('Quantity cannot be negative');
    });

    test('should set default quantity to 0 when not provided', async () => {
      // Arrange
      const sweetData = {
        name: 'Test Sweet',
        category: 'Traditional',
        price: '100.00'
      };

      const expectedSweet = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...sweetData,
        quantity: 0,
        description: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([expectedSweet])
        })
      });

      // Act
      const result = await Sweet.create(sweetData);

      // Assert  
      expect(result.quantity).toBe(0);
    });
  });

  describe('Sweet Validation (GREEN Phase)', () => {
    
    test('should validate correct price formats', async () => {
      const validPrices = ['0', '0.00', '100', '100.0', '100.00', '999.99'];
      
      for (const price of validPrices) {
        const sweetData = {
          name: 'Test Sweet',
          category: 'Traditional',
          price: price
        };

        mockDb.insert.mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: '123', ...sweetData }])
          })
        });

        // Should not throw an error
        await expect(Sweet.create(sweetData)).resolves.toBeDefined();
      }
    });

    test('should reject invalid price formats', async () => {
      const invalidPrices = ['-100', 'abc', '100.', '.100', '100.000', ''];
      
      for (const price of invalidPrices) {
        const sweetData = {
          name: 'Test Sweet',
          category: 'Traditional',
          price: price
        };

        await expect(Sweet.create(sweetData)).rejects.toThrow('Invalid price format');
      }
    });

    test('should validate quantity is non-negative integer', async () => {
      const validQuantities = [0, 1, 100, 9999];
      
      for (const quantity of validQuantities) {
        const sweetData = {
          name: 'Test Sweet',
          category: 'Traditional',
          price: '100.00',
          quantity: quantity
        };

        mockDb.insert.mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: '123', ...sweetData }])
          })
        });

        await expect(Sweet.create(sweetData)).resolves.toBeDefined();
      }
    });

    test('should reject invalid quantities', async () => {
      const invalidQuantities = [-1, -100, 1.5];
      
      for (const quantity of invalidQuantities) {
        const sweetData = {
          name: 'Test Sweet',
          category: 'Traditional',
          price: '100.00',
          quantity: quantity
        };

        await expect(Sweet.create(sweetData)).rejects.toThrow('Quantity cannot be negative');
      }
    });
  });

  describe('Sweet Retrieval (GREEN Phase)', () => {
    
    test('should find sweet by ID', async () => {
      // Arrange
      const sweetId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedSweet = {
        id: sweetId,
        name: 'Test Sweet',
        category: 'Traditional',
        price: '100.00',
        quantity: 10
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([expectedSweet])
        })
      });

      // Act
      const result = await Sweet.findById(sweetId);

      // Assert
      expect(result).toEqual(expectedSweet);
      expect(mockDb.select).toHaveBeenCalled();
    });

    test('should return null for non-existent sweet ID', async () => {
      // Arrange
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      });

      // Act
      const result = await Sweet.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });

    test('should find all sweets', async () => {
      // Arrange
      const expectedSweets = [
        { id: '1', name: 'Sweet 1', category: 'Traditional' },
        { id: '2', name: 'Sweet 2', category: 'Bengali' },
        { id: '3', name: 'Sweet 3', category: 'Traditional' }
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(expectedSweets)
      });

      // Act
      const result = await Sweet.findAll();

      // Assert
      expect(result).toEqual(expectedSweets);
      expect(result).toHaveLength(3);
    });

    test('should find sweets by category', async () => {
      // Arrange
      const category = 'Traditional';
      const expectedSweets = [
        { id: '1', name: 'Sweet 1', category: 'Traditional' },
        { id: '3', name: 'Sweet 3', category: 'Traditional' }
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(expectedSweets)
        })
      });

      // Act
      const result = await Sweet.findByCategory(category);

      // Assert
      expect(result).toEqual(expectedSweets);
      expect(result.every(sweet => sweet.category === category)).toBe(true);
    });
  });

  describe('Sweet Stock Management (GREEN Phase)', () => {
    
    test('should check if sweet is in stock', async () => {
      // Arrange - Mock findById to return sweet with quantity > 0
      const inStockSweet = { id: '123', quantity: 5 };
      
      jest.spyOn(Sweet, 'findById').mockResolvedValue(inStockSweet as any);

      // Act
      const result = await Sweet.isInStock('123');

      // Assert
      expect(result).toBe(true);
    });

    test('should return false if sweet is out of stock', async () => {
      // Arrange - Mock findById to return sweet with quantity = 0
      const outOfStockSweet = { id: '123', quantity: 0 };
      
      jest.spyOn(Sweet, 'findById').mockResolvedValue(outOfStockSweet as any);

      // Act
      const result = await Sweet.isInStock('123');

      // Assert
      expect(result).toBe(false);
    });

    test('should return false if sweet does not exist', async () => {
      // Arrange - Mock findById to return null
      jest.spyOn(Sweet, 'findById').mockResolvedValue(null);

      // Act
      const result = await Sweet.isInStock('nonexistent');

      // Assert
      expect(result).toBe(false);
    });

    test('should reduce stock quantity', async () => {
      // Arrange
      const sweetId = '123';
      const currentSweet = { id: sweetId, quantity: 10 };
      const updatedSweet = { id: sweetId, quantity: 7 };

      jest.spyOn(Sweet, 'findById').mockResolvedValue(currentSweet as any);
      jest.spyOn(Sweet, 'update').mockResolvedValue(updatedSweet as any);

      // Act
      const result = await Sweet.reduceStock(sweetId, 3);

      // Assert
      expect(result).toEqual(updatedSweet);
      expect(Sweet.update).toHaveBeenCalledWith(sweetId, { quantity: 7 });
    });

    test('should throw error when reducing stock below zero', async () => {
      // Arrange
      const sweetId = '123';
      const currentSweet = { id: sweetId, quantity: 5 };

      jest.spyOn(Sweet, 'findById').mockResolvedValue(currentSweet as any);

      // Act & Assert
      await expect(Sweet.reduceStock(sweetId, 10)).rejects.toThrow('Insufficient stock');
    });

    test('should increase stock quantity', async () => {
      // Arrange
      const sweetId = '123';
      const currentSweet = { id: sweetId, quantity: 10 };
      const updatedSweet = { id: sweetId, quantity: 15 };

      jest.spyOn(Sweet, 'findById').mockResolvedValue(currentSweet as any);
      jest.spyOn(Sweet, 'update').mockResolvedValue(updatedSweet as any);

      // Act
      const result = await Sweet.increaseStock(sweetId, 5);

      // Assert
      expect(result).toEqual(updatedSweet);
      expect(Sweet.update).toHaveBeenCalledWith(sweetId, { quantity: 15 });
    });
  });
});