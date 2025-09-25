/**
 * Sweet Model - Core Business Logic
 * 
 * Implemented using Test-Driven Development (TDD):
 * ✅ RED Phase: Tests written first (failing)
 * ✅ GREEN Phase: Implementation to make tests pass  
 * 🔄 REFACTOR Phase: Improve code structure and error handling
 */

import { Sweet as SweetSchema, sweets } from './schema';
import { eq, and, sql, gte, lte, ilike } from 'drizzle-orm';
import { db } from '../config/database';

// Custom error classes for better error handling
export class SweetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SweetValidationError';
  }
}

export class SweetNotFoundError extends Error {
  constructor(id: string) {
    super(`Sweet with ID ${id} not found`);
    this.name = 'SweetNotFoundError';
  }
}

export class InsufficientStockError extends Error {
  constructor(available: number, requested: number) {
    super(`Insufficient stock: ${available} available, ${requested} requested`);
    this.name = 'InsufficientStockError';
  }
}

export class Sweet {
  
  /**
   * REFACTOR Phase: Create a new sweet with enhanced validation and error handling
   */
  static async create(sweetData: Partial<SweetSchema>): Promise<SweetSchema> {
    try {
      // Validate input data (throws SweetValidationError if invalid)
      this.validateSweetData(sweetData);
      
      // Prepare sanitized data for insertion
      const insertData = this.prepareSweetData(sweetData);

      const [sweet] = await db.insert(sweets).values(insertData).returning();
      
      if (!sweet) {
        throw new Error('Database insertion returned no result');
      }
      
      return sweet;
    } catch (error) {
      if (error instanceof SweetValidationError) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`Failed to create sweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * REFACTOR Phase: Prepare and sanitize sweet data for database insertion
   */
  private static prepareSweetData(sweetData: Partial<SweetSchema>) {
    return {
      name: sweetData.name!.trim(),
      category: sweetData.category!.trim(),
      price: sweetData.price!,
      quantity: Math.max(0, sweetData.quantity || 0), // Ensure non-negative
      description: sweetData.description?.trim() || null,
      imageUrl: sweetData.imageUrl?.trim() || null,
    };
  }

  /**
   * GREEN Phase: Find sweet by ID
   */
  static async findById(id: string): Promise<SweetSchema | null> {
    try {
      const [sweet] = await db.select().from(sweets).where(eq(sweets.id, id));
      return sweet || null;
    } catch (error) {
      throw new Error(`Failed to find sweet by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GREEN Phase: Find all sweets
   */
  static async findAll(): Promise<SweetSchema[]> {
    try {
      const allSweets = await db.select().from(sweets);
      return allSweets;
    } catch (error) {
      throw new Error(`Failed to find all sweets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GREEN Phase: Find sweets by category
   */
  static async findByCategory(category: string): Promise<SweetSchema[]> {
    try {
      const categorySweets = await db.select().from(sweets).where(eq(sweets.category, category));
      return categorySweets;
    } catch (error) {
      throw new Error(`Failed to find sweets by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GREEN Phase: Update sweet
   */
  static async update(id: string, updateData: Partial<SweetSchema>): Promise<SweetSchema | null> {
    // Validate update data if provided
    if (Object.keys(updateData).length > 0) {
      this.validateUpdateData(updateData);
    }

    try {
      const [updatedSweet] = await db
        .update(sweets)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(sweets.id, id))
        .returning();
      
      return updatedSweet || null;
    } catch (error) {
      throw new Error(`Failed to update sweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GREEN Phase: Delete sweet
   */
  static async delete(id: string): Promise<SweetSchema | null> {
    try {
      const [deletedSweet] = await db
        .delete(sweets)
        .where(eq(sweets.id, id))
        .returning();
      
      return deletedSweet || null;
    } catch (error) {
      throw new Error(`Failed to delete sweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * REFACTOR Phase: Check if sweet is in stock with better error handling
   */
  static async isInStock(id: string): Promise<boolean> {
    try {
      const sweet = await this.findById(id);
      return sweet ? sweet.quantity > 0 : false;
    } catch (error) {
      if (error instanceof SweetNotFoundError) {
        return false; // Sweet doesn't exist, so it's not in stock
      }
      throw new Error(`Failed to check stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * REFACTOR Phase: Reduce stock quantity with enhanced validation and error handling
   */
  static async reduceStock(id: string, quantity: number): Promise<SweetSchema | null> {
    // Validate input parameters
    this.validateStockQuantity(quantity, 'reduction');

    try {
      const sweet = await this.findById(id);
      if (!sweet) {
        throw new SweetNotFoundError(id);
      }

      if (sweet.quantity < quantity) {
        throw new InsufficientStockError(sweet.quantity, quantity);
      }

      const newQuantity = sweet.quantity - quantity;
      return await this.update(id, { quantity: newQuantity });
    } catch (error) {
      if (error instanceof SweetNotFoundError || error instanceof InsufficientStockError) {
        throw error; // Re-throw custom errors as-is
      }
      throw new Error(`Failed to reduce stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * REFACTOR Phase: Increase stock quantity with enhanced validation
   */
  static async increaseStock(id: string, quantity: number): Promise<SweetSchema | null> {
    // Validate input parameters
    this.validateStockQuantity(quantity, 'increase');

    try {
      const sweet = await this.findById(id);
      if (!sweet) {
        throw new SweetNotFoundError(id);
      }

      const newQuantity = sweet.quantity + quantity;
      return await this.update(id, { quantity: newQuantity });
    } catch (error) {
      if (error instanceof SweetNotFoundError) {
        throw error; // Re-throw custom errors as-is
      }
      throw new Error(`Failed to increase stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * REFACTOR Phase: Validate stock operation quantity
   */
  private static validateStockQuantity(quantity: number, operation: string): void {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new SweetValidationError(`Quantity for ${operation} must be a non-negative integer`);
    }
    if (quantity === 0) {
      throw new SweetValidationError(`Quantity for ${operation} must be greater than zero`);
    }
  }

  /**
   * GREEN Phase: Search sweets by name
   */
  static async search(searchTerm: string): Promise<SweetSchema[]> {
    try {
      const searchResults = await db
        .select()
        .from(sweets)
        .where(ilike(sweets.name, `%${searchTerm}%`));
      
      return searchResults;
    } catch (error) {
      throw new Error(`Failed to search sweets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GREEN Phase: Filter sweets by price range
   */
  static async filterByPriceRange(minPrice: string, maxPrice: string): Promise<SweetSchema[]> {
    try {
      const filteredSweets = await db
        .select()
        .from(sweets)
        .where(
          and(
            gte(sweets.price, minPrice),
            lte(sweets.price, maxPrice)
          )
        );
      
      return filteredSweets;
    } catch (error) {
      throw new Error(`Failed to filter sweets by price range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GREEN Phase: Get available sweets only
   */
  static async getAvailable(): Promise<SweetSchema[]> {
    try {
      const availableSweets = await db
        .select()
        .from(sweets)
        .where(sql`${sweets.quantity} > 0`);
      
      return availableSweets;
    } catch (error) {
      throw new Error(`Failed to get available sweets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * REFACTOR Phase: Enhanced sweet data validation with detailed error messages
   */
  private static validateSweetData(sweetData: Partial<SweetSchema>): void {
    const errors: string[] = [];

    // Validate name
    if (!sweetData.name || sweetData.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (sweetData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (sweetData.name.trim().length > 255) {
      errors.push('Name cannot exceed 255 characters');
    }

    // Validate category
    if (!sweetData.category || sweetData.category.trim().length === 0) {
      errors.push('Category cannot be empty');
    } else if (sweetData.category.trim().length > 100) {
      errors.push('Category cannot exceed 100 characters');
    }

    // Validate price
    if (!sweetData.price) {
      errors.push('Price is required');
    } else if (!this.validatePrice(sweetData.price)) {
      errors.push('Price must be a valid decimal number (e.g., 100.00)');
    }

    // Validate quantity (optional, but must be valid if provided)
    if (sweetData.quantity !== undefined && !this.validateQuantity(sweetData.quantity)) {
      errors.push('Quantity must be a non-negative integer');
    }

    // Validate description length (optional field)
    if (sweetData.description && sweetData.description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }

    // Validate image URL length (optional field)  
    if (sweetData.imageUrl && sweetData.imageUrl.length > 500) {
      errors.push('Image URL cannot exceed 500 characters');
    }

    if (errors.length > 0) {
      throw new SweetValidationError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * REFACTOR Phase: Enhanced update data validation
   */
  private static validateUpdateData(updateData: Partial<SweetSchema>): void {
    const errors: string[] = [];

    // Validate name if provided
    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim().length === 0) {
        errors.push('Name cannot be empty');
      } else if (updateData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      } else if (updateData.name.trim().length > 255) {
        errors.push('Name cannot exceed 255 characters');
      }
    }

    // Validate category if provided
    if (updateData.category !== undefined) {
      if (!updateData.category || updateData.category.trim().length === 0) {
        errors.push('Category cannot be empty');
      } else if (updateData.category.trim().length > 100) {
        errors.push('Category cannot exceed 100 characters');
      }
    }

    // Validate price if provided
    if (updateData.price !== undefined && !this.validatePrice(updateData.price)) {
      errors.push('Price must be a valid decimal number (e.g., 100.00)');
    }

    // Validate quantity if provided
    if (updateData.quantity !== undefined && !this.validateQuantity(updateData.quantity)) {
      errors.push('Quantity must be a non-negative integer');
    }

    // Validate description length if provided
    if (updateData.description !== undefined && updateData.description && updateData.description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }

    // Validate image URL length if provided
    if (updateData.imageUrl !== undefined && updateData.imageUrl && updateData.imageUrl.length > 500) {
      errors.push('Image URL cannot exceed 500 characters');
    }

    if (errors.length > 0) {
      throw new SweetValidationError(`Update validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * REFACTOR Phase: Enhanced price validation with better error context
   */
  private static validatePrice(price: string): boolean {
    if (!price || typeof price !== 'string') return false;
    
    // Check if price is a valid decimal number with up to 2 decimal places
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (!priceRegex.test(price)) return false;
    
    const numericPrice = parseFloat(price);
    return numericPrice >= 0 && numericPrice <= 9999999.99; // Reasonable maximum price
  }

  /**
   * REFACTOR Phase: Enhanced quantity validation
   */
  private static validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity >= 0 && quantity <= 999999; // Reasonable maximum
  }
}