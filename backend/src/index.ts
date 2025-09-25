/**
 * Sweet Nirvana - Backend API Server
 * 
 * This is the main backend server for the Sweet Nirvana application.
 * It provides REST API endpoints for:
 * - Sweet product management (CRUD operations)
 * - User authentication and authorization
 * - Inventory management
 * - Static file serving for sweet images
 * 
 * Features:
 * - Express.js server with TypeScript
 * - PostgreSQL database with Drizzle ORM
 * - CORS enabled for frontend communication
 * - Security middleware (Helmet)
 * - Request logging (Morgan)
 * - Static file serving
 * - Environment variable configuration
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { testConnection } from './models/db';

// Import API routes
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';
import inventoryRoutes from './routes/inventory';

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware with relaxed CSP for images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3001", "http://localhost:3000"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static images with permissive CORS headers
const imagesPath = path.resolve(__dirname, '..', 'sweet-images');
console.log(`📸 Serving images from: ${imagesPath}`);
app.use('/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(imagesPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Sweet Shop API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Also include admin routes at /api level
app.use('/api/sweets', sweetsRoutes);
app.use('/api/inventory', inventoryRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Sweet Shop Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      sweets: '/api/sweets/*',
      inventory: '/api/inventory/*',
      admin: '/api/admin/*',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🍭 Sweet Shop API server is running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Test database connection on startup
    await testConnection();
  });
}

export default app;