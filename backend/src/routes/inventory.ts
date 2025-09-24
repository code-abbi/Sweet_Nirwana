import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/inventory/purchase
 * @desc Purchase sweets (authenticated users)
 * @access Private
 */
router.post('/purchase', authenticateToken, inventoryController.purchaseSweet);

/**
 * @route POST /api/inventory/restock
 * @desc Restock sweets (admin only)
 * @access Private (Admin)
 */
router.post('/restock', authenticateToken, requireAdmin, inventoryController.restockSweet);

/**
 * @route GET /api/inventory/status
 * @desc Get inventory status for all items (admin only)
 * @access Private (Admin)
 */
router.get('/status', authenticateToken, requireAdmin, inventoryController.getInventoryStatus);

/**
 * @route GET /api/inventory/transactions
 * @desc Get all transaction history with filtering (admin only)
 * @access Private (Admin)
 */
router.get('/transactions', authenticateToken, requireAdmin, inventoryController.getTransactionHistory);

/**
 * @route GET /api/inventory/transactions/my
 * @desc Get user's own transaction history
 * @access Private
 */
router.get('/transactions/my', authenticateToken, inventoryController.getUserTransactionHistory);

/**
 * @route GET /api/inventory/alerts
 * @desc Get low stock and out of stock alerts (admin only)
 * @access Private (Admin)
 */
router.get('/alerts', authenticateToken, requireAdmin, inventoryController.getLowStockAlerts);

export default router;