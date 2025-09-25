/**
 * Sweet Model Tests - Test-Driven Development
 * 
 * Following Red-Green-Refactor pattern:
 * 1. RED: Write failing tests for Sweet model functionality
 * 2. GREEN: Implement minimum code to make tests pass
 * 3. REFACTOR: Improve code structure while keeping tests green
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { Sweet } from '../../src/models/Sweet';

describe('Sweet Model - TDD Implementation', () => {
  
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('RED Phase: Sweet Creation Tests (Should Fail Initially)', () => {
    
    test('should create a new sweet with valid data', async () => {
      // RED: This test will fail until Sweet.create() is implemented
      const sweetData = {
        name: 'Gulab Jamun',
        category: 'Traditional',
        price: '150.00',
        quantity: 25,
        description: 'Soft and spongy milk dumplings soaked in rose-flavored syrup',
        imageUrl: '/images/gulab-jamun.jpg'
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet).toBeValidSweet();
      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
      expect(sweet.description).toBe(sweetData.description);
      expect(sweet.imageUrl).toBe(sweetData.imageUrl);
      expect(sweet.id).toBeValidUUID();
      expect(sweet.createdAt).toBeInstanceOf(Date);
      expect(sweet.updatedAt).toBeInstanceOf(Date);
    });

    test('should validate required fields when creating sweet', async () => {
      // RED: This test will fail until validation is implemented
      const invalidSweetData = {
        // Missing required fields
        category: 'Traditional',
        price: '150.00'
      };

      await expect(Sweet.create(invalidSweetData as any)).rejects.toThrow('Name is required');
    });

    test('should validate price format when creating sweet', async () => {
      // RED: This test will fail until price validation is implemented
      const invalidPriceData = {
        name: 'Test Sweet',
        category: 'Traditional',
        price: 'invalid-price', // Invalid price format
        quantity: 10,
        description: 'Test description',
        imageUrl: '/test.jpg'
      };

      await expect(Sweet.create(invalidPriceData)).rejects.toThrow('Invalid price format');
    });

    test('should validate quantity is non-negative', async () => {
      // RED: This test will fail until quantity validation is implemented
      const negativeQuantityData = {
        name: 'Test Sweet',
        category: 'Traditional', 
        price: '100.00',
        quantity: -5, // Negative quantity
        description: 'Test description',
        imageUrl: '/test.jpg'
      };

      await expect(Sweet.create(negativeQuantityData)).rejects.toThrow('Quantity cannot be negative');
    });
  });

  describe('RED Phase: Sweet Retrieval Tests (Should Fail Initially)', () => {
    
    test('should find sweet by ID', async () => {
      // RED: This test will fail until Sweet.findById() is implemented
      const testSweet = await createTestSweet({
        name: 'Rasgulla',
        category: 'Bengali'
      });

      const foundSweet = await Sweet.findById(testSweet.id);

      expect(foundSweet).toBeValidSweet();
      expect(foundSweet?.id).toBe(testSweet.id);
      expect(foundSweet?.name).toBe('Rasgulla');
      expect(foundSweet?.category).toBe('Bengali');
    });

    test('should return null for non-existent sweet ID', async () => {
      // RED: This test will fail until Sweet.findById() is implemented
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      const foundSweet = await Sweet.findById(nonExistentId);
      
      expect(foundSweet).toBeNull();
    });

    test('should find all sweets', async () => {
      // RED: This test will fail until Sweet.findAll() is implemented
      await createTestSweet({ name: 'Ladoo', category: 'Traditional' });
      await createTestSweet({ name: 'Jalebi', category: 'Traditional' });
      await createTestSweet({ name: 'Sandesh', category: 'Bengali' });

      const allSweets = await Sweet.findAll();

      expect(allSweets).toHaveLength(3);
      expect(allSweets.every(sweet => sweet)).toBeValidSweet();
      
      const sweetNames = allSweets.map(sweet => sweet.name);
      expect(sweetNames).toContain('Ladoo');
      expect(sweetNames).toContain('Jalebi');
      expect(sweetNames).toContain('Sandesh');
    });

    test('should find sweets by category', async () => {
      // RED: This test will fail until Sweet.findByCategory() is implemented
      await createTestSweet({ name: 'Ladoo', category: 'Traditional' });
      await createTestSweet({ name: 'Jalebi', category: 'Traditional' });
      await createTestSweet({ name: 'Sandesh', category: 'Bengali' });

      const traditionalSweets = await Sweet.findByCategory('Traditional');

      expect(traditionalSweets).toHaveLength(2);
      expect(traditionalSweets.every(sweet => sweet.category === 'Traditional')).toBe(true);
      
      const sweetNames = traditionalSweets.map(sweet => sweet.name);
      expect(sweetNames).toContain('Ladoo');
      expect(sweetNames).toContain('Jalebi');
      expect(sweetNames).not.toContain('Sandesh');
    });
  });

  describe('RED Phase: Sweet Update Tests (Should Fail Initially)', () => {
    
    test('should update sweet properties', async () => {
      // RED: This test will fail until Sweet.update() is implemented
      const testSweet = await createTestSweet({
        name: 'Original Sweet',
        price: '100.00',
        quantity: 10
      });

      const updateData = {
        name: 'Updated Sweet',
        price: '150.00',
        quantity: 20
      };

      const updatedSweet = await Sweet.update(testSweet.id, updateData);

      expect(updatedSweet).toBeValidSweet();
      expect(updatedSweet?.name).toBe('Updated Sweet');
      expect(updatedSweet?.price).toBe('150.00');
      expect(updatedSweet?.quantity).toBe(20);
      expect(updatedSweet?.updatedAt).not.toEqual(testSweet.updatedAt);
    });

    test('should validate update data', async () => {
      // RED: This test will fail until update validation is implemented
      const testSweet = await createTestSweet();

      const invalidUpdateData = {
        price: 'invalid-price'
      };

      await expect(Sweet.update(testSweet.id, invalidUpdateData)).rejects.toThrow('Invalid price format');
    });

    test('should return null when updating non-existent sweet', async () => {
      // RED: This test will fail until Sweet.update() is implemented
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      const updatedSweet = await Sweet.update(nonExistentId, { name: 'New Name' });
      
      expect(updatedSweet).toBeNull();
    });
  });

  describe('RED Phase: Sweet Deletion Tests (Should Fail Initially)', () => {
    
    test('should delete sweet by ID', async () => {
      // RED: This test will fail until Sweet.delete() is implemented
      const testSweet = await createTestSweet();

      const deletedSweet = await Sweet.delete(testSweet.id);
      expect(deletedSweet).toBeValidSweet();
      expect(deletedSweet?.id).toBe(testSweet.id);

      // Verify sweet is actually deleted
      const foundSweet = await testDb.select().from(schema.sweets).where(eq(schema.sweets.id, testSweet.id));
      expect(foundSweet).toHaveLength(0);
    });

    test('should return null when deleting non-existent sweet', async () => {
      // RED: This test will fail until Sweet.delete() is implemented
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      const deletedSweet = await Sweet.delete(nonExistentId);
      
      expect(deletedSweet).toBeNull();
    });
  });

  describe('RED Phase: Sweet Business Logic Tests (Should Fail Initially)', () => {
    
    test('should check if sweet is in stock', async () => {
      // RED: This test will fail until Sweet.isInStock() is implemented
      const inStockSweet = await createTestSweet({ quantity: 5 });
      const outOfStockSweet = await createTestSweet({ quantity: 0 });

      const inStockResult = await Sweet.isInStock(inStockSweet.id);
      const outOfStockResult = await Sweet.isInStock(outOfStockSweet.id);

      expect(inStockResult).toBe(true);
      expect(outOfStockResult).toBe(false);
    });

    test('should reduce stock quantity', async () => {
      // RED: This test will fail until Sweet.reduceStock() is implemented
      const testSweet = await createTestSweet({ quantity: 10 });

      const updatedSweet = await Sweet.reduceStock(testSweet.id, 3);

      expect(updatedSweet).toBeValidSweet();
      expect(updatedSweet?.quantity).toBe(7);
    });

    test('should not allow stock reduction below zero', async () => {
      // RED: This test will fail until stock validation is implemented
      const testSweet = await createTestSweet({ quantity: 5 });

      await expect(Sweet.reduceStock(testSweet.id, 10)).rejects.toThrow('Insufficient stock');
    });

    test('should increase stock quantity', async () => {
      // RED: This test will fail until Sweet.increaseStock() is implemented
      const testSweet = await createTestSweet({ quantity: 10 });

      const updatedSweet = await Sweet.increaseStock(testSweet.id, 5);

      expect(updatedSweet).toBeValidSweet();
      expect(updatedSweet?.quantity).toBe(15);
    });
  });

  describe('RED Phase: Sweet Search and Filter Tests (Should Fail Initially)', () => {
    
    test('should search sweets by name', async () => {
      // RED: This test will fail until Sweet.search() is implemented
      await createTestSweet({ name: 'Chocolate Barfi' });
      await createTestSweet({ name: 'Kaju Katli' });
      await createTestSweet({ name: 'Chocolate Ladoo' });

      const chocolateSweets = await Sweet.search('Chocolate');

      expect(chocolateSweets).toHaveLength(2);
      expect(chocolateSweets.every(sweet => sweet.name.includes('Chocolate'))).toBe(true);
    });

    test('should filter sweets by price range', async () => {
      // RED: This test will fail until Sweet.filterByPriceRange() is implemented
      await createTestSweet({ name: 'Cheap Sweet', price: '50.00' });
      await createTestSweet({ name: 'Medium Sweet', price: '150.00' });
      await createTestSweet({ name: 'Expensive Sweet', price: '300.00' });

      const midRangeSweets = await Sweet.filterByPriceRange('100.00', '200.00');

      expect(midRangeSweets).toHaveLength(1);
      expect(midRangeSweets[0].name).toBe('Medium Sweet');
      expect(parseFloat(midRangeSweets[0].price)).toBeGreaterThanOrEqual(100);
      expect(parseFloat(midRangeSweets[0].price)).toBeLessThanOrEqual(200);
    });

    test('should get available sweets only', async () => {
      // RED: This test will fail until Sweet.getAvailable() is implemented
      await createTestSweet({ name: 'Available Sweet', quantity: 5 });
      await createTestSweet({ name: 'Out of Stock Sweet', quantity: 0 });

      const availableSweets = await Sweet.getAvailable();

      expect(availableSweets).toHaveLength(1);
      expect(availableSweets[0].name).toBe('Available Sweet');
      expect(availableSweets[0].quantity).toBeGreaterThan(0);
    });
  });
});