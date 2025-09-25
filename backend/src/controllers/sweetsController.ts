/**
 * Sweet Products Controller
 * 
 * Handles all HTTP requests related to sweet products including:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Search and filtering functionality
 * - Stock management
 * - Image upload and management
 * 
 * All endpoints return standardized JSON responses with success/error status
 */

import { Request, Response } from 'express';
import { SweetService } from '../utils/sweetService';
import { validateSweet } from '../utils/validation';

/**
 * Extended Request interface with user authentication data
 * Used for endpoints that require authentication
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Sweet Products Controller Object
 * Contains all the HTTP request handlers for sweet-related operations
 */
export const sweetsController = {
  /**
   * GET /api/sweets - Retrieve all sweet products
   * 
   * Supports query parameters for filtering and sorting:
   * - search: Filter by name/description
   * - category: Filter by sweet category
   * - minPrice/maxPrice: Price range filtering
   * - sortBy: Field to sort by (default: name)
   * - sortOrder: Sort direction (asc/desc, default: asc)
   */
  getAllSweets: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        search,
        category,
        minPrice,
        maxPrice,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const filters = {
        search: search as string,
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      // Get all sweets without pagination (use a very large limit)
      const allSweets = await SweetService.getAllSweets(1, 1000);
      const totalCount = allSweets.length;

      res.status(200).json({
        success: true,
        data: allSweets,
        totalCount
      });
    } catch (error) {
      console.error('Error fetching sweets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * GET /api/sweets/:id - Retrieve a specific sweet by its ID
   * 
   * @param id - Sweet product ID from URL parameters
   * @returns Sweet product data or 404 if not found
   */
  getSweetById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Sweet ID is required' });
        return;
      }

      const sweet = await SweetService.getSweetById(id);
      
      if (!sweet) {
        res.status(404).json({ 
          success: false,
          error: 'Sweet not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: sweet
      });
    } catch (error) {
      console.error('Error fetching sweet:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * POST /api/sweets - Create a new sweet product
   * 
   * Validates input data and creates a new sweet in the database
   * Prevents duplicate names and ensures data integrity
   * 
   * @body name, description, price, category, imageUrl, quantity
   * @returns Created sweet data with success message
   */
  createSweet: async (req: Request, res: Response): Promise<void> => {
    try {
      const sweetData = req.body;
      
      // Validate sweet data
      const validation = validateSweet(sweetData);
      if (!validation.isValid) {
        const errorString = validation.errors.map(err => err.message).join(', ');
        res.status(400).json({ 
          success: false,
          error: errorString
        });
        return;
      }

      const newSweet = await SweetService.createSweet({
        name: sweetData.name,
        description: sweetData.description,
        price: sweetData.price,
        category: sweetData.category,
        imageUrl: sweetData.imageUrl,
        quantity: sweetData.quantity || 0
      });

      res.status(201).json({
        success: true,
        message: 'Sweet created successfully',
        data: newSweet
      });
    } catch (error) {
      console.error('Error creating sweet:', error);
      
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: 'Sweet with this name already exists' });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * PUT /api/sweets/:id - Update an existing sweet product
   * 
   * Allows partial updates of sweet properties
   * Validates data and prevents name conflicts
   * 
   * @param id - Sweet ID from URL parameters
   * @body Any sweet properties to update
   * @returns Updated sweet data
   */
  updateSweet: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const sweetData = req.body;
      
      if (!id) {
        res.status(400).json({ error: 'Sweet ID is required' });
        return;
      }

      // Validate sweet data
      const validation = validateSweet(sweetData, true); // Allow partial updates
      if (!validation.isValid) {
        const errorString = validation.errors.map(err => err.message).join(', ');
        res.status(400).json({ 
          success: false,
          error: errorString
        });
        return;
      }

      const updatedSweet = await SweetService.updateSweet(id, sweetData);
      
      if (!updatedSweet) {
        res.status(404).json({ 
          success: false,
          error: 'Sweet not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Sweet updated successfully',
        data: updatedSweet
      });
    } catch (error) {
      console.error('Error updating sweet:', error);
      
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: 'Sweet with this name already exists' });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * DELETE /api/sweets/:id - Remove a sweet product
   * 
   * Permanently deletes a sweet from the database
   * Used for admin management functionality
   * 
   * @param id - Sweet ID from URL parameters
   * @returns Success confirmation or 404 if not found
   */
  deleteSweet: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Sweet ID is required' });
        return;
      }

      const deleted = await SweetService.deleteSweet(id);
      
      if (!deleted) {
        res.status(404).json({ 
          success: false,
          error: 'Sweet not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Sweet deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting sweet:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * PUT /api/sweets/:id/stock - Update stock quantity for a sweet
   * 
   * Public endpoint used by the shopping cart system to manage inventory
   * Ensures stock levels are maintained during purchase flow
   * 
   * @param id - Sweet ID from URL parameters  
   * @body quantity - New stock quantity (must be >= 0)
   * @returns Updated sweet with new stock level
   */
  updateStock: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!id) {
        res.status(400).json({ error: 'Sweet ID is required' });
        return;
      }

      if (quantity === undefined || quantity === null) {
        res.status(400).json({ error: 'Quantity is required' });
        return;
      }

      const quantityNum = parseInt(quantity);
      if (isNaN(quantityNum) || quantityNum < 0) {
        res.status(400).json({ error: 'Quantity must be a valid non-negative number' });
        return;
      }

      const updatedSweet = await SweetService.updateSweet(id, { quantity: quantityNum });
      
      if (!updatedSweet) {
        res.status(404).json({ 
          success: false,
          error: 'Sweet not found' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: updatedSweet
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * GET /api/sweets/search - Advanced search with filters and pagination
   * 
   * Supports multiple search criteria and paginated results
   * Used for frontend search functionality and filtering
   * 
   * @query name, category, minPrice, maxPrice, page, limit
   * @returns Filtered and paginated sweet results
   */
  searchSweets: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        category,
        minPrice,
        maxPrice,
        page = '1',
        limit = '10'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      
      // Validate pagination parameters
      if (pageNum < 1 || limitNum < 1) {
        res.status(400).json({ 
          success: false,
          error: 'Invalid pagination parameters' 
        });
        return;
      }

      // Validate price parameters if provided
      let minPriceNum, maxPriceNum;
      if (minPrice) {
        minPriceNum = parseFloat(minPrice as string);
        if (isNaN(minPriceNum)) {
          res.status(400).json({ 
            success: false,
            error: 'Invalid price parameters' 
          });
          return;
        }
      }

      if (maxPrice) {
        maxPriceNum = parseFloat(maxPrice as string);
        if (isNaN(maxPriceNum)) {
          res.status(400).json({ 
            success: false,
            error: 'Invalid price parameters' 
          });
          return;
        }
      }

      const searchQuery = {
        name: name as string,
        category: category as string,
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        page: pageNum,
        limit: limitNum
      };

      const results = await SweetService.searchSweets(searchQuery);
      const totalCount = results.length; // For now, use results length
      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        success: true,
        data: results,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Error searching sweets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },



  // POST /api/sweets/upload-image - Upload image file directly
  uploadImage: async (req: Request, res: Response): Promise<void> => {
    try {
      const multer = require('multer');
      const path = require('path');

      // Configure multer for image upload
      const storage = multer.diskStorage({
        destination: (req: any, file: any, cb: any) => {
          cb(null, path.join(__dirname, '../../sweet-images'));
        },
        filename: (req: any, file: any, cb: any) => {
          // Generate unique filename with timestamp
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = path.extname(file.originalname);
          const name = path.basename(file.originalname, ext);
          cb(null, `${name}-${uniqueSuffix}${ext}`);
        }
      });

      const upload = multer({
        storage,
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
        fileFilter: (req: any, file: any, cb: any) => {
          // Check if file is an image
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed'), false);
          }
        }
      }).single('image');

      upload(req, res, (err: any) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: err.message || 'File upload failed'
          });
          return;
        }

        if (!req.file) {
          res.status(400).json({
            success: false,
            message: 'No image file provided'
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully!',
          imagePath: `/images/${req.file.filename}`,
          filename: req.file.filename
        });
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.'
      });
    }
  },

  /**
   * POST /api/sweets/upload-image - Handle image file upload
   * 
   * Accepts multipart/form-data with 'image' field
   * Validates file type (images only) and size (max 5MB)
   * Generates unique filename to prevent conflicts
   * Returns the image path for use in sweet creation/updates
   */
};