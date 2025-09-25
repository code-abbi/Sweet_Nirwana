import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  User (authenticated)
 */
router.post('/', authenticateToken, orderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user orders
 * @access  User (authenticated)
 */
router.get('/', authenticateToken, orderController.getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  User (owner) or Admin
 */
router.get('/:id', authenticateToken, orderController.getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Admin only
 */
router.put('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

/**
 * @route   POST /api/orders/:id/payment
 * @desc    Process order payment
 * @access  User (order owner)
 */
router.post('/:id/payment', authenticateToken, orderController.processPayment);

export default router;