/**
 * Custom hook for form management
 * Encapsulates form state, validation, and handlers
 */

import { useState, useCallback, useEffect } from 'react';
import { CheckoutFormData, FormErrors, NewSweetFormData } from '../types';
import { ValidationService } from '../services/ValidationService';

/**
 * Form hook return type for checkout form
 */
interface UseCheckoutFormReturn {
  formData: CheckoutFormData;
  formErrors: FormErrors;
  isFormValid: boolean;
  handleFieldChange: (field: keyof CheckoutFormData, value: string) => void;
  validateForm: () => boolean;
  resetForm: (userEmail?: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
}

/**
 * Form hook return type for new sweet form
 */
interface UseNewSweetFormReturn {
  formData: NewSweetFormData;
  formErrors: FormErrors;
  isFormValid: boolean;
  handleFieldChange: (field: keyof NewSweetFormData, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setFormData: React.Dispatch<React.SetStateAction<NewSweetFormData>>;
}

/**
 * Custom hook for managing checkout form
 */
export const useCheckoutForm = (userEmail?: string): UseCheckoutFormReturn => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: userEmail || '',
    address: '',
    city: '',
    pinCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Update email when user changes
  useEffect(() => {
    if (userEmail) {
      setFormData(prev => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  /**
   * Handle field change with automatic validation and formatting
   */
  const handleFieldChange = useCallback(
    (field: keyof CheckoutFormData, value: string): void => {
      let formattedValue = value;

      // Apply specific formatting based on field type
      switch (field) {
        case 'cardNumber':
          formattedValue = ValidationService.formatCardNumber(value);
          break;
        case 'expiryDate':
          formattedValue = ValidationService.formatExpiryDate(value);
          break;
        case 'pinCode':
          formattedValue = ValidationService.formatPinCode(value);
          break;
        case 'cvv':
          formattedValue = ValidationService.formatCvv(value);
          break;
        default:
          formattedValue = value;
      }

      setFormData(prev => ({ ...prev, [field]: formattedValue }));

      // Clear field error if it exists
      if (formErrors[field]) {
        setFormErrors(prev => ValidationService.clearFieldError(prev, field));
      }
    },
    [formErrors]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const errors = ValidationService.validateCheckoutForm(formData);
    setFormErrors(errors);
    return !ValidationService.hasErrors(errors);
  }, [formData]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(
    (newUserEmail?: string): void => {
      setFormData({
        fullName: '',
        email: newUserEmail || userEmail || '',
        address: '',
        city: '',
        pinCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      });
      setFormErrors({});
    },
    [userEmail]
  );

  const isFormValid = !ValidationService.hasErrors(formErrors);

  return {
    formData,
    formErrors,
    isFormValid,
    handleFieldChange,
    validateForm,
    resetForm,
    setFormData,
  };
};

/**
 * Custom hook for managing new sweet form
 */
export const useNewSweetForm = (): UseNewSweetFormReturn => {
  const [formData, setFormData] = useState<NewSweetFormData>({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  /**
   * Handle field change with validation
   */
  const handleFieldChange = useCallback(
    (field: keyof NewSweetFormData, value: string): void => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear field error if it exists
      if (formErrors[field]) {
        setFormErrors(prev => ValidationService.clearFieldError(prev, field));
      }
    },
    [formErrors]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const errors = ValidationService.validateNewSweetForm(formData);
    setFormErrors(errors);
    return !ValidationService.hasErrors(errors);
  }, [formData]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback((): void => {
    setFormData({
      name: '',
      category: '',
      price: '',
      quantity: '',
      description: '',
    });
    setFormErrors({});
  }, []);

  const isFormValid = !ValidationService.hasErrors(formErrors);

  return {
    formData,
    formErrors,
    isFormValid,
    handleFieldChange,
    validateForm,
    resetForm,
    setFormData,
  };
};