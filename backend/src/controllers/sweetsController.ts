/**
 * Sweet Products Controller - Simplified for TDD API Implementation
 */

import { Request, Response } from 'express';
import { Sweet } from '../models/Sweet';

/**
 * Sweet Products Controller Object
 */
export const sweetsController = {
  /**
   * GET /api/sweets - Retrieve all sweet products
   */
  getAllSweets: async (req: Request, res: Response): Promise<void> => {
    try {
      const sweets = await Sweet.findAll();
      
      res.json({
        success: true,
        data: sweets
      });
    } catch (error) {
      console.error('Get all sweets error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching sweets'
      });
    }
  },

  /**
   * GET /api/sweets/:id - Get sweet by ID
   */
  getSweetById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Sweet ID is required'
        });
        return;
      }
      
      const sweet = await Sweet.findById(id);
      if (!sweet) {
        res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          sweet
        }
      });
    } catch (error) {
      console.error('Get sweet by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching sweet'
      });
    }
  },

  /**
   * POST /api/sweets - Create new sweet (admin only)
   */
  createSweet: async (req: Request, res: Response): Promise<void> => {
    try {
      const sweetData = req.body;

      // Basic validation
      if (!sweetData.name || !sweetData.price) {
        res.status(400).json({
          success: false,
          message: 'Name and price are required'
        });
        return;
      }

      const sweet = await Sweet.create(sweetData);

      res.status(201).json({
        success: true,
        message: 'Sweet created successfully',
        data: {
          sweet
        }
      });
    } catch (error) {
      console.error('Create sweet error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating sweet'
      });
    }
  },

  /**
   * PUT /api/sweets/:id - Update sweet (admin only)
   */
  updateSweet: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Sweet ID is required'
        });
        return;
      }

      const sweet = await Sweet.update(id, updateData);
      if (!sweet) {
        res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Sweet updated successfully',
        data: {
          sweet
        }
      });
    } catch (error) {
      console.error('Update sweet error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating sweet'
      });
    }
  },

  /**
   * DELETE /api/sweets/:id - Delete sweet (admin only)
   */
  deleteSweet: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Sweet ID is required'
        });
        return;
      }

      const deleted = await Sweet.delete(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Sweet deleted successfully'
      });
    } catch (error) {
      console.error('Delete sweet error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting sweet'
      });
    }
  },

  /**
   * PUT /api/sweets/:id/stock - Update sweet stock
   */
  updateStock: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Sweet ID is required'
        });
        return;
      }

      if (typeof quantity !== 'number' || quantity < 0) {
        res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
        return;
      }

      const sweet = await Sweet.update(id, { quantity });
      if (!sweet) {
        res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          sweet
        }
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating stock'
      });
    }
  },

  /**
   * GET /api/sweets/search - Search sweets
   */
  searchSweets: async (req: Request, res: Response): Promise<void> => {
    try {
      // For now, return all sweets - can add search logic later
      const sweets = await Sweet.findAll();
      
      res.json({
        success: true,
        data: {
          sweets
        }
      });
    } catch (error) {
      console.error('Search sweets error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while searching sweets'
      });
    }
  },

  /**
   * POST /api/sweets/upload-image - Upload image (placeholder)
   */
  uploadImage: async (req: Request, res: Response): Promise<void> => {
    try {
      // Placeholder implementation
      res.json({
        success: true,
        message: 'Image upload not implemented yet',
        data: {
          imageUrl: '/images/placeholder.jpg'
        }
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during image upload'
      });
    }
  }
};