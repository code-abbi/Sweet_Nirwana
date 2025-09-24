import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  User, 
  ApiError 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          status: error.response?.status,
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/auth/profile');
    return response.data;
  }

  // Sweet endpoints
  async getSweets() {
    const response = await this.api.get('/sweets');
    return response.data;
  }

  async getSweet(id: number) {
    const response = await this.api.get(`/sweets/${id}`);
    return response.data;
  }

  async createSweet(sweetData: any) {
    const response = await this.api.post('/sweets', sweetData);
    return response.data;
  }

  async updateSweet(id: number, sweetData: any) {
    const response = await this.api.put(`/sweets/${id}`, sweetData);
    return response.data;
  }

  async deleteSweet(id: number) {
    const response = await this.api.delete(`/sweets/${id}`);
    return response.data;
  }

  // Inventory endpoints
  async purchaseSweet(sweetId: number, quantity: number) {
    const response = await this.api.post('/inventory/purchase', {
      sweet_id: sweetId,
      quantity,
    });
    return response.data;
  }

  async restockSweet(sweetId: number, quantity: number, price: number) {
    const response = await this.api.post('/inventory/restock', {
      sweet_id: sweetId,
      quantity,
      price,
    });
    return response.data;
  }

  async getInventoryStatus() {
    const response = await this.api.get('/inventory/status');
    return response.data;
  }

  async getTransactionHistory() {
    const response = await this.api.get('/inventory/transactions');
    return response.data;
  }

  async getUserTransactionHistory() {
    const response = await this.api.get('/inventory/user-transactions');
    return response.data;
  }

  async getLowStockAlerts() {
    const response = await this.api.get('/inventory/low-stock-alerts');
    return response.data;
  }

  // Generic request method for custom endpoints
  async request<T = any>(method: string, url: string, data?: any): Promise<T> {
    const response = await this.api.request<T>({
      method,
      url,
      data,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;