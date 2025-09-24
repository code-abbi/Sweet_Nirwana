import { db } from '../models/db';
import { inventory, transactions } from '../models/schema';
import { eq, and, desc, gte, lte, or } from 'drizzle-orm';

export interface PurchaseResult {
  success: boolean;
  error?: string;
  transaction?: any;
  remainingStock?: number;
}

export interface RestockResult {
  success: boolean;
  transaction?: any;
  newStock?: number;
}

export interface TransactionFilters {
  sweetId?: string;
  type?: 'purchase' | 'restock';
  userId?: string;
  page?: number;
  limit?: number;
}

export interface AlertThreshold {
  lowStock: any[];
  outOfStock: any[];
  alertCount: number;
}

/**
 * Inventory service for managing sweet shop inventory operations
 */
export class InventoryService {
  /**
   * Process a sweet purchase
   */
  static async purchaseSweet(sweetId: string, quantity: number, userId: string): Promise<PurchaseResult> {
    try {
      // Check if sweet exists in inventory
      const inventoryItem = await db
        .select()
        .from(inventory)
        .where(eq(inventory.sweetId, sweetId))
        .limit(1);

      if (!inventoryItem.length) {
        return { success: false, error: 'Sweet not found in inventory' };
      }

      const currentStock = inventoryItem[0].quantity;
      
      // Check if sufficient stock is available
      if (currentStock < quantity) {
        return { success: false, error: 'Insufficient stock' };
      }

      // Calculate new stock level
      const newStock = currentStock - quantity;

      // Update inventory
      await db
        .update(inventory)
        .set({ 
          quantity: newStock,
          lastUpdated: new Date()
        })
        .where(eq(inventory.sweetId, sweetId));

      // Create transaction record
      const itemPrice = inventoryItem[0]?.price ? parseFloat(inventoryItem[0].price as string) : 0;
      const totalPrice = (itemPrice * quantity).toString();
      
      const [transaction] = await db
        .insert(transactions)
        .values({
          sweetId,
          userId,
          type: 'purchase',
          quantity,
          price: totalPrice,
          timestamp: new Date()
        })
        .returning();

      return {
        success: true,
        transaction,
        remainingStock: newStock
      };
    } catch (error) {
      console.error('Error processing purchase:', error);
      return { success: false, error: 'Failed to process purchase' };
    }
  }

  /**
   * Restock a sweet (admin only)
   */
  static async restockSweet(sweetId: string, quantity: number, userId: string): Promise<RestockResult> {
    try {
      // Check if sweet exists in inventory
      let inventoryItem = await db
        .select()
        .from(inventory)
        .where(eq(inventory.sweetId, sweetId))
        .limit(1);

      let currentStock = 0;
      
      if (!inventoryItem.length) {
        // Create new inventory entry if it doesn't exist
        const [newInventoryItem] = await db
          .insert(inventory)
          .values({
            sweetId,
            quantity,
            price: 0, // Price will be set separately
            lastRestocked: new Date(),
            restockedBy: userId,
            lastUpdated: new Date()
          })
          .returning();
        
        currentStock = newInventoryItem.quantity;
      } else {
        // Update existing inventory
        currentStock = inventoryItem[0].quantity + quantity;
        
        await db
          .update(inventory)
          .set({
            quantity: currentStock,
            lastRestocked: new Date(),
            restockedBy: userId,
            lastUpdated: new Date()
          })
          .where(eq(inventory.sweetId, sweetId));
      }

      // Create transaction record
      const [transaction] = await db
        .insert(transactions)
        .values({
          sweetId,
          userId,
          type: 'restock',
          quantity,
          timestamp: new Date()
        })
        .returning();

      return {
        success: true,
        transaction,
        newStock: currentStock
      };
    } catch (error) {
      console.error('Error processing restock:', error);
      return { success: false };
    }
  }

  /**
   * Get current inventory status for all items
   */
  static async getInventoryStatus() {
    try {
      const inventoryItems = await db
        .select()
        .from(inventory);

      return inventoryItems.map(item => ({
        ...item,
        status: item.quantity === 0 ? 'out_of_stock' : 
          (item.quantity <= 5 ? 'low' : 'in_stock')
      }));
    } catch (error) {
      console.error('Error fetching inventory status:', error);
      return [];
    }
  }

  /**
   * Get transaction history with filtering and pagination
   */
  static async getTransactionHistory(filters: TransactionFilters = {}) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions: any[] = [];
      
      if (filters.sweetId) {
        conditions.push(eq(transactions.sweetId, filters.sweetId));
      }
      
      if (filters.type) {
        conditions.push(eq(transactions.type, filters.type));
      }
      
      if (filters.userId) {
        conditions.push(eq(transactions.userId, filters.userId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get transactions with pagination
      const transactionList = await db
        .select()
        .from(transactions)
        .where(whereClause)
        .orderBy(desc(transactions.timestamp))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalCountResult = await db
        .select()
        .from(transactions)
        .where(whereClause);
      
      const totalCount = totalCountResult.length;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        transactions: transactionList,
        totalCount,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return {
        transactions: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        hasNext: false,
        hasPrev: false
      };
    }
  }

  /**
   * Get low stock and out of stock alerts
   */
  static async getLowStockAlert(threshold: number = 5): Promise<AlertThreshold> {
    try {
      const inventoryItems = await db
        .select()
        .from(inventory);

      const lowStockItems = inventoryItems.filter(
        item => item.quantity <= threshold && item.quantity > 0
      );
      
      const outOfStockItems = inventoryItems.filter(
        item => item.quantity === 0
      );

      return {
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
        alertCount: lowStockItems.length + outOfStockItems.length
      };
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      return {
        lowStock: [],
        outOfStock: [],
        alertCount: 0
      };
    }
  }


}