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
 * @desc    Create new sweet (demo mode - no auth required)
 * @access  Public (for demo)
 */
router.post('/', sweetsController.createSweet);

/**
 * @route   PUT /api/sweets/:id/stock
 * @desc    Update sweet stock (public for cart management)
 * @access  Public
 */
router.put('/:id/stock', sweetsController.updateStock);

/**
 * @route   PUT /api/sweets/:id
 * @desc    Update sweet (demo mode)
 * @access  Public (for demo)
 */
router.put('/:id', sweetsController.updateSweet);

/**
 * @route   DELETE /api/sweets/:id
 * @desc    Delete sweet (demo mode)
 * @access  Public (for demo)
 */
router.delete('/:id', sweetsController.deleteSweet);

/**
 * @route   POST /api/sweets/copy-image
 * @desc    Copy image from Downloads to sweet-images directory
 * @access  Public (for demo)
 */
router.post('/copy-image', sweetsController.copyImageFromDownloads);

/**
 * @route   POST /api/sweets/upload-image
 * @desc    Upload image file directly to sweet-images directory
 * @access  Public (for demo)
 */
router.post('/upload-image', sweetsController.uploadImage);

/**
 * @route   PUT /api/sweets/bulk-update-images
 * @desc    Update images for newly added global desserts
 * @access  Public (for demo)
 */
router.put('/bulk-update-images', sweetsController.bulkUpdateImages);

export default router;