/**
 * Application constants and configuration values
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    SWEETS: '/api/sweets',
    HEALTH: '/health',
    IMAGES: '/images'
  }
} as const;

/**
 * User Configuration
 */
export const USER_CONFIG = {
  ADMIN_EMAIL: 'wildrabit001@gmail.com'
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  CART: {
    MAX_HEIGHT_CLASS: 'max-h-96',
    DROPDOWN_WIDTH_CLASS: 'w-96'
  },
  FORM: {
    CARD_NUMBER_MAX_LENGTH: 19,
    EXPIRY_DATE_MAX_LENGTH: 5,
    CVV_MAX_LENGTH: 4,
    PIN_CODE_MAX_LENGTH: 6
  }
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  CART: 'sweet_shop_cart'
} as const;

/**
 * Regular Expressions for Validation
 */
export const REGEX_PATTERNS = {
  EMAIL: /\S+@\S+\.\S+/,
  PIN_CODE: /^\d{6}$/,
  CVV: /^\d{3,4}$/,
  EXPIRY_DATE: /^\d{2}\/\d{2}$/
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (fieldName: string) => `${fieldName} is required`,
  INVALID_EMAIL: 'Email is invalid',
  INVALID_PIN_CODE: 'PIN code must be 6 digits',
  INVALID_CARD_NUMBER: 'Card number must be 16 digits',
  INVALID_EXPIRY_DATE: 'Expiry date must be in MM/YY format',
  INVALID_CVV: 'CVV must be 3 or 4 digits',
  OUT_OF_STOCK: 'This item is out of stock',
  EXCEED_STOCK: 'Cannot add more than available stock',
  FORM_VALIDATION: 'Please fill in all required fields correctly.'
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  PAYMENT_SUCCESS: 'Payment successful! Thank you for your purchase.'
} as const;