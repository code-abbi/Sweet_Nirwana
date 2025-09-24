import { db } from '../models/db';
import { sweets } from '../models/schema';
import { eq, and, gte, lte, ilike, desc } from 'drizzle-orm';
import type { Sweet, NewSweet } from '../models/schema';
import type { SearchSweetQuery, UpdateSweetRequest } from '../types';

/**
 * Sweet service layer for database operations
 * Implements business logic and data validation
 */
export class SweetService {
  /**
   * Get all sweets with optional pagination
   */
  static async getAllSweets(page = 1, limit = 20): Promise<Sweet[]> {
    const offset = (page - 1) * limit;
    
    return await db
      .select()
      .from(sweets)
      .orderBy(desc(sweets.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get sweet by ID
   */
  static async getSweetById(id: string): Promise<Sweet | null> {
    const result = await db
      .select()
      .from(sweets)
      .where(eq(sweets.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new sweet
   */
  static async createSweet(sweetData: NewSweet): Promise<Sweet> {
    const insertPayload: any = {
      ...sweetData,
      updatedAt: new Date(),
    };

    // Ensure price is string for decimal field
    if (sweetData.price !== undefined) {
      insertPayload.price = sweetData.price.toString();
    }

    const result = await db
      .insert(sweets)
      .values(insertPayload)
      .returning();

    return result[0]!;
  }

  /**
   * Update sweet by ID
   */
  static async updateSweet(id: string, updateData: UpdateSweetRequest): Promise<Sweet | null> {
    const updatePayload: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Convert price to string for decimal field
    if (updateData.price !== undefined) {
      updatePayload.price = updateData.price.toString();
    }

    const result = await db
      .update(sweets)
      .set(updatePayload)
      .where(eq(sweets.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete sweet by ID
   */
  static async deleteSweet(id: string): Promise<boolean> {
    const result = await db
      .delete(sweets)
      .where(eq(sweets.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Search sweets with filters
   */
  static async searchSweets(query: SearchSweetQuery): Promise<Sweet[]> {
    const { name, category, minPrice, maxPrice, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    let whereConditions: any[] = [];

    // Add name filter (case-insensitive)
    if (name) {
      whereConditions.push(ilike(sweets.name, `%${name}%`));
    }

    // Add category filter (case-insensitive)
    if (category) {
      whereConditions.push(ilike(sweets.category, `%${category}%`));
    }

    // Add price range filters
    if (minPrice !== undefined) {
      whereConditions.push(gte(sweets.price, minPrice.toString()));
    }

    if (maxPrice !== undefined) {
      whereConditions.push(lte(sweets.price, maxPrice.toString()));
    }

    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions) 
      : undefined;

    return await db
      .select()
      .from(sweets)
      .where(whereClause)
      .orderBy(desc(sweets.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Purchase sweet (decrease quantity)
   */
  static async purchaseSweet(id: string, quantity: number): Promise<Sweet | null> {
    // First, get current sweet data
    const currentSweet = await this.getSweetById(id);
    
    if (!currentSweet) {
      throw new Error('Sweet not found');
    }

    if (currentSweet.quantity < quantity) {
      throw new Error('Insufficient quantity available');
    }

    if (quantity <= 0) {
      throw new Error('Purchase quantity must be greater than 0');
    }

    // Update quantity
    const newQuantity = currentSweet.quantity - quantity;
    
    const result = await db
      .update(sweets)
      .set({
        quantity: newQuantity,
        updatedAt: new Date(),
      })
      .where(eq(sweets.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Restock sweet (increase quantity)
   */
  static async restockSweet(id: string, quantity: number): Promise<Sweet | null> {
    if (quantity <= 0) {
      throw new Error('Restock quantity must be greater than 0');
    }

    // Get current sweet data
    const currentSweet = await this.getSweetById(id);
    
    if (!currentSweet) {
      throw new Error('Sweet not found');
    }

    // Update quantity
    const newQuantity = currentSweet.quantity + quantity;
    
    const result = await db
      .update(sweets)
      .set({
        quantity: newQuantity,
        updatedAt: new Date(),
      })
      .where(eq(sweets.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Get sweets count for pagination
   */
  static async getSweetsCount(query?: SearchSweetQuery): Promise<number> {
    let whereConditions: any[] = [];

    if (query) {
      const { name, category, minPrice, maxPrice } = query;

      if (name) {
        whereConditions.push(ilike(sweets.name, `%${name}%`));
      }

      if (category) {
        whereConditions.push(ilike(sweets.category, `%${category}%`));
      }

      if (minPrice !== undefined) {
        whereConditions.push(gte(sweets.price, minPrice.toString()));
      }

      if (maxPrice !== undefined) {
        whereConditions.push(lte(sweets.price, maxPrice.toString()));
      }
    }

    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions) 
      : undefined;

    const result = await db
      .select({ count: sweets.id })
      .from(sweets)
      .where(whereClause);

    return result.length;
  }
}