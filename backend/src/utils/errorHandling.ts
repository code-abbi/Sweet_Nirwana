/**
 * Error Handling Utilities - REFACTOR Phase
 * 
 * Centralized error handling system for consistent error responses,
 * proper logging, and better debugging experience.
 * 
 * Created during REFACTOR phase to improve code quality.
 */

import { Request, Response, NextFunction } from 'express';

// Custom error classes with proper inheritance
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errorCode?: string | undefined;
  public field?: string | undefined;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errorCode?: string,
    field?: string
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR', field);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, 404, true, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 409, true, 'CONFLICT_ERROR', field);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, true, 'DATABASE_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(message || `${service} service unavailable`, 502, true, 'EXTERNAL_SERVICE_ERROR');
  }
}

/**
 * Error response interface for consistent API responses
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string | undefined;
    field?: string | undefined;
    statusCode: number;
    timestamp: string;
    path?: string | undefined;
    stack?: string | undefined;
  };
}

/**
 * Logger utility for different log levels
 */
export const Logger = {
  info(message: string, meta?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
  },

  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
  },

  error(message: string, error?: Error | any, meta?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error('Error details:', error);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    if (meta) {
      console.error('Additional context:', JSON.stringify(meta));
    }
  },

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }
};

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: Error | AppError,
  req?: Request,
  includeStack: boolean = false
): ErrorResponse {
  const isAppError = error instanceof AppError;
  
  return {
    success: false,
    error: {
      message: error.message,
      code: isAppError ? error.errorCode : 'INTERNAL_SERVER_ERROR',
      field: isAppError ? error.field : undefined,
      statusCode: isAppError ? error.statusCode : 500,
      timestamp: new Date().toISOString(),
      path: req?.originalUrl,
      stack: includeStack ? error.stack : undefined
    }
  };
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  Logger.error('Request error occurred', error, {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Handle known error types
  if (error instanceof AppError) {
    const errorResponse = createErrorResponse(error, req, process.env.NODE_ENV === 'development');
    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle validation errors from our models
  if (error.name === 'UserValidationError' || 
      error.name === 'SweetValidationError' || 
      error.name === 'OrderValidationError') {
    const validationError = new ValidationError(error.message);
    const errorResponse = createErrorResponse(validationError, req, process.env.NODE_ENV === 'development');
    res.status(400).json(errorResponse);
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    const authError = new AuthenticationError('Invalid authentication token');
    const errorResponse = createErrorResponse(authError, req);
    res.status(401).json(errorResponse);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    const authError = new AuthenticationError('Authentication token expired');
    const errorResponse = createErrorResponse(authError, req);
    res.status(401).json(errorResponse);
    return;
  }

  // Handle database errors
  if (error.message.includes('duplicate key value') || error.message.includes('already exists')) {
    const conflictError = new ConflictError('Resource already exists');
    const errorResponse = createErrorResponse(conflictError, req);
    res.status(409).json(errorResponse);
    return;
  }

  // Handle syntax errors in JSON
  if (error instanceof SyntaxError && 'body' in error) {
    const validationError = new ValidationError('Invalid JSON in request body');
    const errorResponse = createErrorResponse(validationError, req);
    res.status(400).json(errorResponse);
    return;
  }

  // Handle unknown errors
  const unknownError = new AppError(
    process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    500,
    false
  );
  
  const errorResponse = createErrorResponse(unknownError, req, process.env.NODE_ENV === 'development');
  res.status(500).json(errorResponse);
}

/**
 * Async error handler wrapper for route handlers
 */
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler middleware
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError('Route', req.originalUrl);
  next(error);
}

/**
 * Success response utility
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string | undefined;
  timestamp: string;
}

export function createSuccessResponse<T>(
  data: T,
  message?: string
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Paginated response utility
 */
export interface PaginatedResponse<T = any> extends SuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Validation helper functions
 */
export const ErrorHelpers = {
  /**
   * Throw validation error if condition is not met
   */
  throwIf(condition: boolean, message: string, field?: string): void {
    if (condition) {
      throw new ValidationError(message, field);
    }
  },

  /**
   * Throw not found error if resource is null/undefined
   */
  throwIfNotFound<T>(resource: T | null | undefined, resourceName: string, id?: string): T {
    if (resource == null) {
      throw new NotFoundError(resourceName, id);
    }
    return resource;
  },

  /**
   * Throw authorization error if user doesn't have permission
   */
  throwIfUnauthorized(condition: boolean, message?: string): void {
    if (condition) {
      throw new AuthorizationError(message);
    }
  },

  /**
   * Handle async operations with proper error conversion
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      Logger.error(errorMessage || 'Async operation failed', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        errorMessage || 'Operation failed',
        500,
        true,
        'ASYNC_OPERATION_ERROR'
      );
    }
  }
};

/**
 * Request validation middleware
 */
export function validateRequestBody(schema: any) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // This is a placeholder for actual schema validation
      // In a real app, you'd use libraries like Joi, Yup, or Zod
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new ValidationError('Request body is required');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}