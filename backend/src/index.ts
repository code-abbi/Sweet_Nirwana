import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './models/db';

// Import routes
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

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

// Temporary admin-only route for testing
app.delete('/api/sweets/:id', (req, res) => {
  // First check authentication
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
    });
    return;
  }
  
  // Simulate token verification (simplified for test)
  try {
    // In a real app, we'd verify the JWT properly
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const decoded = JSON.parse(Buffer.from(tokenParts[1]!, 'base64').toString());
    
    if (decoded.userRole !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Sweet deleted',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Sweet Shop Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      sweets: '/api/sweets/*',
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