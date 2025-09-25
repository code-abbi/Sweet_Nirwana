/**
 * Inventory Management Controller
 * 
 * Handles all inventory-related operations including:
 * - Purchase transactions and stock deduction
 * - Stock restocking for admins
 * - Transaction history and reporting
 * - Low stock alerts and monitoring
 * - Inventory validation and error handling
 * 
 * Security: All endpoints require authentication
 * Admin endpoints additionally require admin role verification
 */

import { Request, Response } from 'express';
import { InventoryService } from '../utils/inventoryService';
import { validatePurchaseRequest, validateRestockRequest, validateTransactionQuery } from '../utils/inventoryValidation';

/**
 * Extended Request interface with authentication data
 * Populated by the auth middleware before reaching controller methods
 */
interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: 'admin' | 'user';
}
/**
 * Inventory Controller Object
 * Contains all HTTP request handlers for inventory operations
 */
export const inventoryController = {
  
  /**
   * POST /api/inventory/purchase - Process sweet purchase transactions
   * 
   * Handles customer purchases by:
   * - Validating purchase data (sweetId, quantity, etc.)
   * - Checking stock availability
   * - Recording transaction in database
   * - Updating sweet inventory levels
   * 
   * @auth Required - User must be authenticated
   * @body sweetId, quantity, additional purchase details
   * @returns Transaction confirmation and updated stock levels
   */
  purchaseSweet: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const purchaseData = req.body;
      const userId = req.userId!;
      
      // Validate purchase data
      const validation = validatePurchaseRequest(purchaseData);
      if (!validation.isValid) {
        const errorString = validation.errors.map(err => err.message).join(', ');
        res.status(400).json({ 
          success: false,
          error: errorString
        });
        return;
      }

      // Process the purchase
      const result = await InventoryService.purchaseSweet(
        purchaseData.sweetId,
        parseInt(purchaseData.quantity),
        userId
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Purchase completed successfully',
        data: {
          transaction: result.transaction,
          remainingStock: result.remainingStock
        }
      });
    } catch (error) {
      console.error('Error in purchaseSweet:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  // POST /api/inventory/restock - Allow admins to restock sweets
  restockSweet: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const restockData = req.body;
      const userId = req.userId!;
      
      // Validate restock data
      const validation = validateRestockRequest(restockData);
      if (!validation.isValid) {
        const errorString = validation.errors.map(err => err.message).join(', ');
        res.status(400).json({ 
          success: false,
          error: errorString
        });
        return;
      }

      // Process the restock
      const result = await InventoryService.restockSweet(
        restockData.sweetId,
        parseInt(restockData.quantity),
        userId
      );

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'Failed to process restock'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Restock completed successfully',
        data: {
          transaction: result.transaction,
          newStock: result.newStock
        }
      });
    } catch (error) {
      console.error('Error in restockSweet:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  // GET /api/inventory/status - Get inventory status for all items (admin only)
  getInventoryStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const inventoryStatus = await InventoryService.getInventoryStatus();

      res.status(200).json({
        success: true,
        data: inventoryStatus
      });
    } catch (error) {
      console.error('Error fetching inventory status:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  // GET /api/inventory/transactions - Get transaction history (admin only)
  getTransactionHistory: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const queryParams = req.query;
      
      // Validate query parameters
      const validation = validateTransactionQuery(queryParams);
      if (!validation.isValid) {
        const errorString = validation.errors.map(err => err.message).join(', ');
        res.status(400).json({ 
          success: false,
          error: errorString
        });
        return;
      }

      const filters = {
        sweetId: queryParams.sweetId as string,
        type: queryParams.type as 'purchase' | 'restock',
        page: queryParams.page ? parseInt(queryParams.page as string) : 1,
        limit: queryParams.limit ? parseInt(queryParams.limit as string) : 20
      };

      const result = await InventoryService.getTransactionHistory(filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  // GET /api/inventory/transactions/my - Get user's own transaction history
  getUserTransactionHistory: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const queryParams = req.query;
      
      const page = queryParams.page ? parseInt(queryParams.page as string) : 1;
      const limit = queryParams.limit ? parseInt(queryParams.limit as string) : 20;

      const result = await InventoryService.getTransactionHistory({ userId, page, limit });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  // GET /api/inventory/alerts - Get low stock alerts (admin only)
  getLowStockAlerts: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const queryParams = req.query;
      const threshold = queryParams.threshold ? parseInt(queryParams.threshold as string) : 5;
      
      // Validate threshold
      if (isNaN(threshold) || threshold < 0) {
        res.status(400).json({
          success: false,
          error: 'threshold must be a non-negative integer'
        });
        return;
      }

      const alerts = await InventoryService.getLowStockAlert(threshold);

      res.status(200).json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
};