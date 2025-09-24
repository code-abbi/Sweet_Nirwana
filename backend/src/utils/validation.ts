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
 * Sanitize user object for response (remove sensitive data)
 */
export function sanitizeUser(user: any) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}