import { Request, Response } from 'express';
import { SweetService } from '../utils/sweetService';
import { validateSweet } from '../utils/validation';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const sweetsController = {
  // GET /api/sweets - List all sweets with optional filters
  getAllSweets: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        search,
        category,
        minPrice,
        maxPrice,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      
      // Validate pagination parameters
      if (pageNum < 1 || limitNum < 1) {
        res.status(400).json({ error: 'Invalid pagination parameters' });
        return;
      }

      const filters = {
        search: search as string,
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const sweets = await SweetService.getAllSweets(pageNum, limitNum);
      const totalCount = sweets.length; // For now, use sweets length
      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        success: true,
        data: sweets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages,
          totalCount,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error('Error fetching sweets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // GET /api/sweets/:id - Get single sweet by ID
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

  // POST /api/sweets - Create new sweet (admin only)
  createSweet: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  // PUT /api/sweets/:id - Update sweet (admin only)
  updateSweet: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  // DELETE /api/sweets/:id - Delete sweet (admin only)
  deleteSweet: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  // GET /api/sweets/search - Search sweets with filters
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
  }
};