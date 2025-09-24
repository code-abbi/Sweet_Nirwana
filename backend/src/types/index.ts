export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSweetRequest {
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateSweetRequest {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  description?: string;
  imageUrl?: string;
}

export interface SearchSweetQuery {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface PurchaseRequest {
  quantity: number;
}

export interface RestockRequest {
  quantity: number;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: 'admin' | 'user';
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: 'admin' | 'user';
    }
  }
}