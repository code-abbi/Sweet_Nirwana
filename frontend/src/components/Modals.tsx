/**
 * Modal Components
 * Reusable modal components following Single Responsibility Principle
 */

import React from 'react';
import type { NewSweetFormData, FormErrors } from '../types';

/**
 * Base Modal Component
 * Provides the modal backdrop and container
 */
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = 'max-w-md' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 w-full ${maxWidth} mx-4`}>
        {children}
      </div>
    </div>
  );
};

/**
 * Sign In Modal Component
 * Handles user authentication modal display
 */
interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Sign in to Sweet Shop</h3>
        <p className="text-gray-600">Choose your Google account to continue</p>
      </div>
      
      <div className="space-y-4">
        {/* Google Sign In Button */}
        <button
          onClick={onGoogleSignIn}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        
        <button
          onClick={onClose}
          className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </BaseModal>
  );
};

/**
 * Add Sweet Modal Component
 * Handles admin functionality to add new sweets
 */
interface AddSweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: NewSweetFormData;
  formErrors: FormErrors;
  onFieldChange: (field: keyof NewSweetFormData, value: string) => void;
}

export const AddSweetModal: React.FC<AddSweetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  formErrors,
  onFieldChange,
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <h3 className="text-lg font-semibold mb-4">Add New Sweet</h3>
      
      <div className="space-y-4">
        <FormField
          label="Name"
          type="text"
          value={formData.name}
          onChange={(value) => onFieldChange('name', value)}
          error={formErrors.name}
          required
        />
        
        <FormField
          label="Category"
          type="text"
          value={formData.category}
          onChange={(value) => onFieldChange('category', value)}
          error={formErrors.category}
          required
        />
        
        <FormField
          label="Price (₹)"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(value) => onFieldChange('price', value)}
          error={formErrors.price}
          required
        />
        
        <FormField
          label="Quantity"
          type="number"
          value={formData.quantity}
          onChange={(value) => onFieldChange('quantity', value)}
          error={formErrors.quantity}
          required
        />
        
        <FormField
          label="Description"
          type="textarea"
          value={formData.description}
          onChange={(value) => onFieldChange('description', value)}
          error={formErrors.description}
          rows={3}
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Add Sweet
        </button>
      </div>
    </BaseModal>
  );
};

/**
 * Form Field Component
 * Reusable form input field with validation
 */
interface FormFieldProps {
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  rows?: number;
  maxLength?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  step,
  rows = 3,
  maxLength,
}) => {
  const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
    error 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-blue-500'
  }`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClasses}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClasses}
          placeholder={placeholder}
          step={step}
          maxLength={maxLength}
          required={required}
        />
      )}
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

/**
 * Google Icon Component
 */
const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
    <path 
      fill="#4285F4" 
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path 
      fill="#34A853" 
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path 
      fill="#FBBC05" 
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path 
      fill="#EA4335" 
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);