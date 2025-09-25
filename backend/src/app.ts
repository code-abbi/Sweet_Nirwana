/**
 * Express App - Basic Structure for RED Phase
 * 
 * This file defines the basic Express.js application structure
 * that will initially fail all API endpoint tests. The goal is
 * to have a minimal app that allows tests to run and fail appropriately.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Authentication routes
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

// Sweet management routes
import sweetRoutes from './routes/sweets';
app.use('/api/sweets', sweetRoutes);

// Order management routes
import orderRoutes from './routes/orders';
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

export { app };