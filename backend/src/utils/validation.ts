/**
 * Validation Utilities - REFACTOR Phase
 * 
 * Common validation functions and error classes to promote code reuse
 * and maintain consistency across the application.
 * 
 * Extracted from User, Sweet, and Order models during REFACTOR phase.
 */

// Legacy interfaces (kept for backward compatibility)
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Base validation error classes
export class BaseValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'BaseValidationError';
  }
}

export class UserValidationError extends BaseValidationError {
  constructor(message: string, field?: string) {
    super(message, field);
    this.name = 'UserValidationError';
  }
}

export class SweetValidationError extends BaseValidationError {
  constructor(message: string, field?: string) {
    super(message, field);
    this.name = 'SweetValidationError';
  }
}

export class OrderValidationError extends BaseValidationError {
  constructor(message: string, field?: string) {
    super(message, field);
    this.name = 'OrderValidationError';
  }
}

/**
 * Email validation utilities
 */
export const EmailValidator = {
  /**
   * Validate email format using RFC 5322 compliant regex
   */
  isValidFormat(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Validate email with detailed error messages
   */
  validate(email: string, fieldName: string = 'Email'): void {
    if (!email || email.trim().length === 0) {
      throw new BaseValidationError(`${fieldName} is required`, 'email');
    }
    
    if (!this.isValidFormat(email)) {
      throw new BaseValidationError(`${fieldName} format is invalid`, 'email');
    }
    
    if (email.length > 254) {
      throw new BaseValidationError(`${fieldName} cannot exceed 254 characters`, 'email');
    }
  }
};

/**
 * Password validation utilities
 */
export const PasswordValidator = {
  /**
   * Validate password strength
   * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
   */
  isSecure(password: string): boolean {
    if (!password || typeof password !== 'string') return false;
    
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
  },

  /**
   * Validate password with detailed error messages
   */
  validate(password: string, fieldName: string = 'Password'): void {
    if (!password || password.length === 0) {
      throw new BaseValidationError(`${fieldName} is required`, 'password');
    }
    
    if (!this.isSecure(password)) {
      throw new BaseValidationError(
        `${fieldName} must be at least 8 characters long and contain uppercase, lowercase, number, and special character`,
        'password'
      );
    }
    
    if (password.length > 128) {
      throw new BaseValidationError(`${fieldName} cannot exceed 128 characters`, 'password');
    }
  }
};

/**
 * String validation utilities
 */
export const StringValidator = {
  /**
   * Validate required string field
   */
  validateRequired(value: string, fieldName: string, minLength: number = 1, maxLength: number = 255): void {
    if (!value || typeof value !== 'string') {
      throw new BaseValidationError(`${fieldName} is required`, fieldName.toLowerCase());
    }
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length === 0) {
      throw new BaseValidationError(`${fieldName} cannot be empty`, fieldName.toLowerCase());
    }
    
    if (trimmedValue.length < minLength) {
      throw new BaseValidationError(`${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''} long`, fieldName.toLowerCase());
    }
    
    if (trimmedValue.length > maxLength) {
      throw new BaseValidationError(`${fieldName} cannot exceed ${maxLength} characters`, fieldName.toLowerCase());
    }
  },

  /**
   * Validate optional string field
   */
  validateOptional(value: string | undefined | null, fieldName: string, maxLength: number = 255): void {
    if (value === undefined || value === null) return;
    
    if (typeof value !== 'string') {
      throw new BaseValidationError(`${fieldName} must be a string`, fieldName.toLowerCase());
    }
    
    if (value.length > maxLength) {
      throw new BaseValidationError(`${fieldName} cannot exceed ${maxLength} characters`, fieldName.toLowerCase());
    }
  },

  /**
   * Validate name fields (first name, last name, etc.)
   */
  validateName(name: string, fieldName: string): void {
    this.validateRequired(name, fieldName, 2, 100);
    
    // Additional name-specific validation
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      throw new BaseValidationError(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`, fieldName.toLowerCase());
    }
  }
};

/**
 * Number validation utilities
 */
export const NumberValidator = {
  /**
   * Validate positive integer
   */
  validatePositiveInteger(value: number, fieldName: string, max?: number): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new BaseValidationError(`${fieldName} must be a positive integer`, fieldName.toLowerCase());
    }
    
    if (max !== undefined && value > max) {
      throw new BaseValidationError(`${fieldName} cannot exceed ${max}`, fieldName.toLowerCase());
    }
  },

  /**
   * Validate non-negative integer (includes 0)
   */
  validateNonNegativeInteger(value: number, fieldName: string, max?: number): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new BaseValidationError(`${fieldName} must be a non-negative integer`, fieldName.toLowerCase());
    }
    
    if (max !== undefined && value > max) {
      throw new BaseValidationError(`${fieldName} cannot exceed ${max}`, fieldName.toLowerCase());
    }
  },

  /**
   * Validate positive number (can be decimal)
   */
  validatePositiveNumber(value: number, fieldName: string, max?: number): void {
    if (typeof value !== 'number' || value <= 0 || !isFinite(value)) {
      throw new BaseValidationError(`${fieldName} must be a positive number`, fieldName.toLowerCase());
    }
    
    if (max !== undefined && value > max) {
      throw new BaseValidationError(`${fieldName} cannot exceed ${max}`, fieldName.toLowerCase());
    }
  },

  /**
   * Validate percentage (0-100)
   */
  validatePercentage(value: number, fieldName: string): void {
    if (typeof value !== 'number' || value < 0 || value > 100 || !isFinite(value)) {
      throw new BaseValidationError(`${fieldName} must be between 0 and 100`, fieldName.toLowerCase());
    }
  }
};

/**
 * Price validation utilities
 */
export const PriceValidator = {
  /**
   * Validate price string format (e.g., "123.45")
   */
  isValidFormat(price: string): boolean {
    if (!price || typeof price !== 'string') return false;
    
    // Check if price is a valid decimal number with up to 2 decimal places
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (!priceRegex.test(price)) return false;
    
    const numericPrice = parseFloat(price);
    return numericPrice >= 0 && numericPrice <= 9999999.99; // Reasonable maximum price
  },

  /**
   * Validate price with detailed error messages
   */
  validate(price: string, fieldName: string = 'Price'): void {
    if (!price || typeof price !== 'string') {
      throw new BaseValidationError(`${fieldName} is required`, 'price');
    }
    
    if (!this.isValidFormat(price)) {
      throw new BaseValidationError(`${fieldName} must be a valid decimal number (e.g., 100.00)`, 'price');
    }
  },

  /**
   * Convert and validate numeric price
   */
  validateNumeric(price: number, fieldName: string = 'Price'): void {
    NumberValidator.validatePositiveNumber(price, fieldName, 9999999.99);
    
    // Check decimal places
    const decimalPlaces = (price.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new BaseValidationError(`${fieldName} can have at most 2 decimal places`, 'price');
    }
  }
};

/**
 * Legacy validation functions (kept for backward compatibility)
 */
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EmailValidator.isValidFormat(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateUserRegistration(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }
  
  // Validate required fields
  if (!data.firstName) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  
  if (!data.lastName) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  
  // Validate role if provided
  if (data.role && !['admin', 'user'].includes(data.role)) {
    errors.push({ field: 'role', message: 'Role must be either "admin" or "user"' });
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateUserLogin(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }
  
  // Validate password
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateSweet(data: any, isUpdate = false): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate name (required for creation, optional for update)
  if (!isUpdate && !data.name) {
    errors.push({ field: 'name', message: 'Sweet name is required' });
  } else if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 2)) {
    errors.push({ field: 'name', message: 'Sweet name must be at least 2 characters long' });
  }
  
  // Validate description (optional but if provided should be valid)
  if (data.description !== undefined && (typeof data.description !== 'string' || data.description.length > 1000)) {
    errors.push({ field: 'description', message: 'Description must be a string with maximum 1000 characters' });
  }
  
  // Validate price (required for creation, optional for update)
  if (!isUpdate && (data.price === undefined || data.price === null)) {
    errors.push({ field: 'price', message: 'price is required' });
  } else if (data.price !== undefined) {
    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0) {
      errors.push({ field: 'price', message: 'price must be a valid positive number' });
    }
  }
  
  // Validate category (required for creation, optional for update)
  if (!isUpdate && !data.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (data.category && typeof data.category !== 'string') {
    errors.push({ field: 'category', message: 'Category must be a string' });
  }
  
  // Validate imageUrl (optional but if provided should be valid)
  if (data.imageUrl !== undefined && typeof data.imageUrl !== 'string') {
    errors.push({ field: 'imageUrl', message: 'Image URL must be a string' });
  }
  
  // Validate isAvailable (optional boolean)
  if (data.isAvailable !== undefined && typeof data.isAvailable !== 'boolean') {
    errors.push({ field: 'isAvailable', message: 'isAvailable must be a boolean' });
  }
  
  // Validate ingredients (optional array)
  if (data.ingredients !== undefined && (!Array.isArray(data.ingredients) || !data.ingredients.every((item: any) => typeof item === 'string'))) {
    errors.push({ field: 'ingredients', message: 'Ingredients must be an array of strings' });
  }
  
  // Validate allergens (optional array)
  if (data.allergens !== undefined && (!Array.isArray(data.allergens) || !data.allergens.every((item: any) => typeof item === 'string'))) {
    errors.push({ field: 'allergens', message: 'Allergens must be an array of strings' });
  }
  
  // Validate quantity (optional number)
  if (data.quantity !== undefined) {
    const quantity = parseInt(data.quantity);
    if (isNaN(quantity) || quantity < 0) {
      errors.push({ field: 'quantity', message: 'quantity must be a valid non-negative number' });
    }
  }
  
  // Validate nutritionInfo (optional object)
  if (data.nutritionInfo !== undefined && (typeof data.nutritionInfo !== 'object' || Array.isArray(data.nutritionInfo))) {
    errors.push({ field: 'nutritionInfo', message: 'Nutrition info must be an object' });
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Sanitize user object for response (remove sensitive data)
 */
export function sanitizeUser(user: any) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}