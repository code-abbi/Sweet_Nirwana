import { Router } from 'express';
import { sweetsController } from '../controllers/sweetsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/sweets
 * @desc    Get all sweets with optional filters and pagination
 * @access  Public
 * @query   page, limit, search, category, minPrice, maxPrice, sortBy, sortOrder
 */
router.get('/', sweetsController.getAllSweets);

/**
 * @route   GET /api/sweets/search
 * @desc    Search sweets with filters
 * @access  Public
 * @query   name, category, minPrice, maxPrice, page, limit
 */
router.get('/search', sweetsController.searchSweets);

/**
 * @route   GET /api/sweets/:id
 * @desc    Get single sweet by ID
 * @access  Public
 */
router.get('/:id', sweetsController.getSweetById);

/**
 * @route   POST /api/sweets
 * @desc    Create new sweet (admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireAdmin, sweetsController.createSweet);

/**
 * @route   PUT /api/sweets/:id/stock
 * @desc    Update sweet stock (public for cart management)
 * @access  Public
 */
router.put('/:id/stock', sweetsController.updateStock);

/**
 * @route   PUT /api/sweets/:id
 * @desc    Update sweet (admin only)
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, sweetsController.updateSweet);

/**
 * @route   DELETE /api/sweets/:id
 * @desc    Delete sweet (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, sweetsController.deleteSweet);

export default router;