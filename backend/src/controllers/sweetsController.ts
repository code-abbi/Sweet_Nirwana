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
  // GET /api/sweets - List all sweets (no pagination limit)
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

  // POST /api/sweets - Create new sweet (demo mode)
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

  // PUT /api/sweets/:id - Update sweet (demo mode)
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

  // DELETE /api/sweets/:id - Delete sweet (demo mode)
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

  // PUT /api/sweets/:id/stock - Update sweet stock (public for cart management)
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
  },

  // POST /api/sweets/copy-image - Copy image from Downloads to sweet-images directory
  copyImageFromDownloads: async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename, sourcePath } = req.body;

      if (!filename || !sourcePath) {
        res.status(400).json({
          success: false,
          message: 'Filename and source path are required'
        });
        return;
      }

      const fs = require('fs');
      const path = require('path');

      // Construct the destination path
      const destinationPath = path.join(__dirname, '../../sweet-images', filename);
      
      // Check if source file exists
      if (!fs.existsSync(sourcePath)) {
        res.status(404).json({
          success: false,
          message: `File not found: ${filename}. Please check if the file exists in your Downloads folder.`
        });
        return;
      }

      // Copy the file
      fs.copyFileSync(sourcePath, destinationPath);

      res.status(200).json({
        success: true,
        message: `Image "${filename}" copied successfully!`,
        imagePath: `/images/${filename}`
      });

    } catch (error) {
      console.error('Error copying image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to copy image. Please try again.'
      });
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

  // PUT /api/sweets/bulk-update-images - Update images for newly added global desserts
  bulkUpdateImages: async (req: Request, res: Response): Promise<void> => {
    try {
      // Map dessert names to their respective image files
      const imageUpdates = {
        'Tiramisu': '/images/Tiramisu.jpeg',
        'Baklava': '/images/baklava.jpeg',
        'Crème Brûlée': '/images/Crème Brûlée.jpeg',
        'New York Cheesecake': '/images/Cheesecake.jpeg',
        'Mochi': '/images/Mochi.jpeg',
        'Churros': '/images/Churros.jpeg',
        'French Macarons': '/images/French Macarons.jpeg',
        'Pavlova': '/images/Pavlova.jpeg',
        'Artisan Gelato': '/images/artisan_Gelato.jpeg',
        'Tres Leches Cake': '/images/Tres_Leches Cake.jpeg'
      };

      const updatedSweets = [];
      
      for (const [name, imageUrl] of Object.entries(imageUpdates)) {
        try {
          const updatedSweet = await SweetService.updateSweetByName(name, { imageUrl });
          if (updatedSweet) {
            updatedSweets.push({ name, imageUrl, success: true });
          } else {
            updatedSweets.push({ name, imageUrl, success: false, error: 'Sweet not found' });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          updatedSweets.push({ name, imageUrl, success: false, error: errorMessage });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Bulk image update completed',
        results: updatedSweets,
        totalUpdated: updatedSweets.filter(r => r.success).length
      });

    } catch (error) {
      console.error('Error in bulk image update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update images. Please try again.'
      });
    }
  }
};