/**
 * API Service for Sweet Shop operations
 * Handles all HTTP requests to the backend API
 */

import { API_CONFIG } from '../config/constants';
import { Sweet, ApiResponse } from '../types';

/**
 * Generic API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Service class following Single Responsibility Principle
 * Responsible only for API communication
 */
export class ApiService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic HTTP request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status,
          response
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all sweets from the API
   */
  async getAllSweets(): Promise<ApiResponse<Sweet[]>> {
    return this.request<Sweet[]>(API_CONFIG.ENDPOINTS.SWEETS);
  }

  /**
   * Get a specific sweet by ID
   */
  async getSweetById(id: string): Promise<ApiResponse<Sweet>> {
    return this.request<Sweet>(`${API_CONFIG.ENDPOINTS.SWEETS}/${id}`);
  }

  /**
   * Update sweet stock quantity
   */
  async updateSweetStock(id: string, quantity: number): Promise<ApiResponse<Sweet>> {
    return this.request<Sweet>(
      `${API_CONFIG.ENDPOINTS.SWEETS}/${id}/stock`,
      {
        method: 'PUT',
        body: JSON.stringify({ quantity: Math.max(0, quantity) }),
      }
    );
  }

  /**
   * Create a new sweet (admin only)
   */
  async createSweet(sweetData: Partial<Sweet>): Promise<ApiResponse<Sweet>> {
    return this.request<Sweet>(API_CONFIG.ENDPOINTS.SWEETS, {
      method: 'POST',
      body: JSON.stringify(sweetData),
    });
  }

  /**
   * Update sweet details (admin only)
   */
  async updateSweet(id: string, sweetData: Partial<Sweet>): Promise<ApiResponse<Sweet>> {
    return this.request<Sweet>(`${API_CONFIG.ENDPOINTS.SWEETS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sweetData),
    });
  }

  /**
   * Delete a sweet (admin only)
   */
  async deleteSweet(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_CONFIG.ENDPOINTS.SWEETS}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>(API_CONFIG.ENDPOINTS.HEALTH);
  }

  /**
   * Generate full image URL
   */
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/images/')) {
      return `${this.baseUrl}${imageUrl}`;
    }
    return imageUrl;
  }
}

/**
 * Default API service instance
 */
export const apiService = new ApiService();