/**
 * Validation utilities for inventory operations
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate purchase request data
 */
export function validatePurchaseRequest(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate sweetId
  if (!data.sweetId) {
    errors.push({ field: 'sweetId', message: 'sweetId is required' });
  } else if (typeof data.sweetId !== 'string' || data.sweetId.trim().length === 0) {
    errors.push({ field: 'sweetId', message: 'sweetId must be a valid string' });
  }
  
  // Validate quantity
  if (data.quantity === undefined || data.quantity === null) {
    errors.push({ field: 'quantity', message: 'quantity is required' });
  } else {
    const quantity = parseInt(data.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push({ field: 'quantity', message: 'quantity must be a positive integer' });
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate restock request data
 */
export function validateRestockRequest(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate sweetId
  if (!data.sweetId) {
    errors.push({ field: 'sweetId', message: 'sweetId is required' });
  } else if (typeof data.sweetId !== 'string' || data.sweetId.trim().length === 0) {
    errors.push({ field: 'sweetId', message: 'sweetId must be a valid string' });
  }
  
  // Validate quantity
  if (data.quantity === undefined || data.quantity === null) {
    errors.push({ field: 'quantity', message: 'quantity is required' });
  } else {
    const quantity = parseInt(data.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push({ field: 'quantity', message: 'quantity must be a positive integer' });
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate transaction query parameters
 */
export function validateTransactionQuery(query: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate type if provided
  if (query.type && !['purchase', 'restock'].includes(query.type)) {
    errors.push({ field: 'type', message: 'type must be either "purchase" or "restock"' });
  }
  
  // Validate page if provided
  if (query.page) {
    const page = parseInt(query.page);
    if (isNaN(page) || page < 1) {
      errors.push({ field: 'page', message: 'page must be a positive integer' });
    }
  }
  
  // Validate limit if provided
  if (query.limit) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push({ field: 'limit', message: 'limit must be between 1 and 100' });
    }
  }
  
  // Validate threshold for alerts if provided
  if (query.threshold) {
    const threshold = parseInt(query.threshold);
    if (isNaN(threshold) || threshold < 0) {
      errors.push({ field: 'threshold', message: 'threshold must be a non-negative integer' });
    }
  }
  
  return { isValid: errors.length === 0, errors };
}