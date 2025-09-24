/**
 * Custom hook for managing sweets data and operations
 * Encapsulates all sweet-related API calls and state management
 */

import { useState, useEffect, useCallback } from 'react';
import { Sweet, SweetWithQuantity, NewSweetFormData } from '../types';
import { ApiService, ApiError } from '../services/ApiService';

/**
 * Sweets hook return type
 */
interface UseSweetsReturn {
  sweets: SweetWithQuantity[];
  loading: boolean;
  error: string | null;
  refreshSweets: () => Promise<void>;
  updateSweetStock: (id: string, newQuantity: number) => Promise<boolean>;
  addNewSweet: (sweetData: NewSweetFormData) => Promise<{ success: boolean; message?: string }>;
  updateSelectedQuantity: (sweetId: string, quantity: number) => void;
}

/**
 * Custom hook for managing sweets data
 */
export const useSweets = (): UseSweetsReturn => {
  const [sweets, setSweets] = useState<SweetWithQuantity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch sweets from API
   */
  const fetchSweets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.prototype.getAllSweets();
      
      if (response.success && response.data) {
        // Add selectedQuantity to each sweet for UI state
        const sweetsWithQuantity: SweetWithQuantity[] = response.data.map((sweet) => ({
          ...sweet,
          selectedQuantity: 1,
        }));
        setSweets(sweetsWithQuantity);
      } else {
        throw new Error(response.message || 'Failed to fetch sweets');
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load sweets. Please try again.';
      
      console.error('Error fetching sweets:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update sweet stock quantity
   */
  const updateSweetStock = useCallback(
    async (id: string, newQuantity: number): Promise<boolean> => {
      try {
        const response = await ApiService.prototype.updateSweetStock(id, newQuantity);
        
        if (response.success) {
          // Update local state immediately for better UX
          setSweets(prevSweets =>
            prevSweets.map(sweet =>
              sweet.id === id 
                ? { ...sweet, quantity: Math.max(0, newQuantity) } 
                : sweet
            )
          );
          return true;
        } else {
          throw new Error(response.message || 'Failed to update stock');
        }
      } catch (error) {
        console.error('Failed to update stock:', error);
        // Refresh from server if update failed
        await fetchSweets();
        return false;
      }
    },
    [fetchSweets]
  );

  /**
   * Add a new sweet (admin functionality)
   */
  const addNewSweet = useCallback(
    async (sweetData: NewSweetFormData): Promise<{ success: boolean; message?: string }> => {
      try {
        const apiSweetData = {
          name: sweetData.name,
          category: sweetData.category,
          price: sweetData.price,
          description: sweetData.description,
          quantity: parseInt(sweetData.quantity),
        };

        // For now, create locally with mock ID (would be replaced with real API call)
        const mockId = Date.now().toString();
        const addedSweet: SweetWithQuantity = {
          id: mockId,
          name: apiSweetData.name,
          category: apiSweetData.category,
          price: apiSweetData.price,
          description: apiSweetData.description,
          quantity: apiSweetData.quantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          selectedQuantity: 1,
        };

        setSweets(prev => [...prev, addedSweet]);
        
        return { success: true };
      } catch (error) {
        console.error('Error adding sweet:', error);
        return {
          success: false,
          message: 'Failed to add new sweet. Please try again.',
        };
      }
    },
    []
  );

  /**
   * Update selected quantity for a sweet (UI state only)
   */
  const updateSelectedQuantity = useCallback(
    (sweetId: string, newQuantity: number): void => {
      setSweets(prevSweets =>
        prevSweets.map(sweet =>
          sweet.id === sweetId
            ? {
                ...sweet,
                selectedQuantity: Math.max(1, Math.min(newQuantity, sweet.quantity)),
              }
            : sweet
        )
      );
    },
    []
  );

  /**
   * Public refresh function
   */
  const refreshSweets = useCallback(async (): Promise<void> => {
    await fetchSweets();
  }, [fetchSweets]);

  // Load sweets on mount
  useEffect(() => {
    fetchSweets();
  }, [fetchSweets]);

  return {
    sweets,
    loading,
    error,
    refreshSweets,
    updateSweetStock,
    addNewSweet,
    updateSelectedQuantity,
  };
};