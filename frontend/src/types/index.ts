/**
 * Core domain types for the Sweet Shop application
 */

/**
 * User entity representing application users
 */
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
  isAdmin?: boolean;
}

/**
 * Sweet product entity
 */
export interface Sweet {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  quantity: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cart-specific sweet item with quantity
 */
export interface CartItem extends Sweet {
  cartQuantity: number;
}

/**
 * Sweet with selected quantity for UI state
 */
export interface SweetWithQuantity extends Sweet {
  selectedQuantity: number;
}

/**
 * Form data interface for checkout
 */
export interface CheckoutFormData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  pinCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  [key: string]: string;
}

/**
 * New sweet creation form data
 */
export interface NewSweetFormData {
  name: string;
  category: string;
  price: string;
  quantity: string;
  description: string;
}

export interface InventoryItem {
  id: number;
  sweet_id: number;
  quantity: number;
  price: number;
  status: 'available' | 'low_stock' | 'out_of_stock';
  created_at: string;
  updated_at: string;
  sweet?: Sweet;
}

export interface Transaction {
  id: number;
  user_id: number;
  sweet_id: number;
  type: 'purchase' | 'restock';
  quantity: number;
  price: number;
  created_at: string;
  user?: User;
  sweet?: Sweet;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  full_name: string;
}

export interface PurchaseRequest {
  sweet_id: number;
  quantity: number;
}

export interface RestockRequest {
  sweet_id: number;
  quantity: number;
  price: number;
}

export interface CreateSweetRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  available_quantity: number;
}

export interface UpdateSweetRequest extends Partial<CreateSweetRequest> {}

export interface ApiError {
  message: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  category?: string;
  status?: string;
  search?: string;
}