/**
 * Validation utilities for user input
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
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!email.includes('@') || !email.includes('.')) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate user registration data
 */
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

/**
 * Validate user login data
 */
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

/**
 * Validate sweet data for creation/update
 */
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