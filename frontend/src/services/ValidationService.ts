/**
 * Form Validation Service
 * Handles all form validation logic following Single Responsibility Principle
 */

import { CheckoutFormData, FormErrors, NewSweetFormData } from '../types';
import { REGEX_PATTERNS, ERROR_MESSAGES } from '../config/constants';

/**
 * Form Validation Service class
 */
export class ValidationService {
  /**
   * Validate checkout form data
   */
  static validateCheckoutForm(formData: CheckoutFormData): FormErrors {
    const errors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = ERROR_MESSAGES.REQUIRED_FIELD('Full name');
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = ERROR_MESSAGES.REQUIRED_FIELD('Email');
    } else if (!REGEX_PATTERNS.EMAIL.test(formData.email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = ERROR_MESSAGES.REQUIRED_FIELD('Address');
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = ERROR_MESSAGES.REQUIRED_FIELD('City');
    }

    // PIN code validation
    if (!formData.pinCode.trim()) {
      errors.pinCode = ERROR_MESSAGES.REQUIRED_FIELD('PIN code');
    } else if (!REGEX_PATTERNS.PIN_CODE.test(formData.pinCode)) {
      errors.pinCode = ERROR_MESSAGES.INVALID_PIN_CODE;
    }

    // Card number validation
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = ERROR_MESSAGES.REQUIRED_FIELD('Card number');
    } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      errors.cardNumber = ERROR_MESSAGES.INVALID_CARD_NUMBER;
    }

    // Expiry date validation
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = ERROR_MESSAGES.REQUIRED_FIELD('Expiry date');
    } else if (!REGEX_PATTERNS.EXPIRY_DATE.test(formData.expiryDate)) {
      errors.expiryDate = ERROR_MESSAGES.INVALID_EXPIRY_DATE;
    }

    // CVV validation
    if (!formData.cvv.trim()) {
      errors.cvv = ERROR_MESSAGES.REQUIRED_FIELD('CVV');
    } else if (!REGEX_PATTERNS.CVV.test(formData.cvv)) {
      errors.cvv = ERROR_MESSAGES.INVALID_CVV;
    }

    return errors;
  }

  /**
   * Validate new sweet form data
   */
  static validateNewSweetForm(formData: NewSweetFormData): FormErrors {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = ERROR_MESSAGES.REQUIRED_FIELD('Name');
    }

    if (!formData.category.trim()) {
      errors.category = ERROR_MESSAGES.REQUIRED_FIELD('Category');
    }

    if (!formData.price.trim()) {
      errors.price = ERROR_MESSAGES.REQUIRED_FIELD('Price');
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!formData.quantity.trim()) {
      errors.quantity = ERROR_MESSAGES.REQUIRED_FIELD('Quantity');
    } else if (parseInt(formData.quantity) < 0) {
      errors.quantity = 'Quantity must be 0 or greater';
    }

    if (!formData.description.trim()) {
      errors.description = ERROR_MESSAGES.REQUIRED_FIELD('Description');
    }

    return errors;
  }

  /**
   * Check if form has any errors
   */
  static hasErrors(errors: FormErrors): boolean {
    return Object.keys(errors).length > 0;
  }

  /**
   * Format card number with spaces
   */
  static formatCardNumber(value: string): string {
    const cleanValue = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const formattedValue = cleanValue.match(/.{1,4}/g)?.join(' ') || cleanValue;
    return formattedValue.length <= 19 ? formattedValue : value;
  }

  /**
   * Format expiry date as MM/YY
   */
  static formatExpiryDate(value: string): string {
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      cleanValue = cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
    }
    return cleanValue;
  }

  /**
   * Format PIN code (numbers only)
   */
  static formatPinCode(value: string): string {
    return value.replace(/\D/g, '').slice(0, 6);
  }

  /**
   * Format CVV (numbers only)
   */
  static formatCvv(value: string): string {
    return value.replace(/\D/g, '');
  }

  /**
   * Clear specific field error
   */
  static clearFieldError(errors: FormErrors, field: string): FormErrors {
    const newErrors = { ...errors };
    delete newErrors[field];
    return newErrors;
  }
}