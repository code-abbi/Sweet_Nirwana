import { db } from '../models/db';
import { sweets } from '../models/schema';
import { eq, and, gte, lte, ilike, desc } from 'drizzle-orm';
import type { Sweet, NewSweet } from '../models/schema';

/**
 * Sweet service layer for database operations
 * Implements business logic and data validation
 */
export class SweetService {
  /**
   * Get sweets with filters and pagination
   */
  static async getSweets(page = 1, limit = 10, filters: any = {}) {
    const { search, category, minPrice, maxPrice, sortBy = 'name', sortOrder = 'asc' } = filters;
    const offset = (page - 1) * limit;

    let whereConditions: any[] = [];

    // Add search filter (searches name and description)
    if (search) {
      whereConditions.push(ilike(sweets.name, `%${search}%`));
    }

    // Add category filter
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

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sweets.id })
      .from(sweets)
      .where(whereClause);
    
    const totalCount = totalResult.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Get sweets with sorting
    const sweetsResult = await db
      .select()
      .from(sweets)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(sweets.name) : sweets.name)
      .limit(limit)
      .offset(offset);

    return {
      sweets: sweetsResult,
      totalCount,
      totalPages
    };
  }

  /**
   * Get all sweets with optional pagination (legacy method)
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
  static async createSweet(sweetData: any): Promise<Sweet> {
    const insertPayload: any = {
      ...sweetData,
      createdAt: new Date(),
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
  static async updateSweet(id: string, updateData: any): Promise<Sweet | null> {
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
   * Update sweet by name
   */
  static async updateSweetByName(name: string, updateData: any): Promise<Sweet | null> {
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
      .where(eq(sweets.name, name))
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
   * Search sweets with filters (legacy method)
   */
  static async searchSweets(query: any): Promise<Sweet[]> {
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
}