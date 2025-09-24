/**
 * Custom hook for cart management
 * Encapsulates all cart-related state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { CartItem, Sweet } from '../types';
import { CartService } from '../services/CartService';
import { ERROR_MESSAGES } from '../config/constants';

/**
 * Cart hook return type
 */
interface UseCartReturn {
  cart: CartItem[];
  totalPrice: number;
  totalItems: number;
  addToCart: (sweet: Sweet, quantity?: number) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (sweetId: string) => void;
  updateCartQuantity: (sweetId: string, newQuantity: number) => void;
  clearCart: () => void;
  getCartQuantity: (sweetId: string) => number;
  isCartEmpty: boolean;
}

/**
 * Custom hook for managing shopping cart state and operations
 */
export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from storage on mount
  useEffect(() => {
    const savedCart = CartService.loadFromStorage();
    setCart(savedCart);
  }, []);

  // Save cart to storage whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      CartService.saveToStorage(cart);
    } else {
      CartService.clearStorage();
    }
  }, [cart]);

  /**
   * Add item to cart with validation
   */
  const addToCart = useCallback(
    async (sweet: Sweet, quantity: number = 1): Promise<{ success: boolean; message?: string }> => {
      const validation = CartService.canAddToCart(cart, sweet, quantity);
      
      if (!validation.canAdd) {
        return {
          success: false,
          message: validation.reason || ERROR_MESSAGES.EXCEED_STOCK
        };
      }

      try {
        const updatedCart = CartService.addItemToCart(cart, sweet, quantity);
        setCart(updatedCart);
        return { success: true };
      } catch (error) {
        console.error('Error adding to cart:', error);
        return {
          success: false,
          message: 'Failed to add item to cart'
        };
      }
    },
    [cart]
  );

  /**
   * Remove item from cart completely
   */
  const removeFromCart = useCallback((sweetId: string): void => {
    const updatedCart = CartService.removeItemFromCart(cart, sweetId);
    setCart(updatedCart);
  }, [cart]);

  /**
   * Update quantity of item in cart
   */
  const updateCartQuantity = useCallback(
    (sweetId: string, newQuantity: number): void => {
      const updatedCart = CartService.updateItemQuantity(cart, sweetId, newQuantity);
      setCart(updatedCart);
    },
    [cart]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback((): void => {
    const clearedCart = CartService.clearCart();
    setCart(clearedCart);
  }, []);

  /**
   * Get quantity of specific item in cart
   */
  const getCartQuantity = useCallback(
    (sweetId: string): number => {
      return CartService.getItemQuantity(cart, sweetId);
    },
    [cart]
  );

  // Computed values
  const totalPrice = CartService.calculateTotalPrice(cart);
  const totalItems = CartService.calculateTotalItems(cart);
  const isCartEmpty = cart.length === 0;

  return {
    cart,
    totalPrice,
    totalItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartQuantity,
    isCartEmpty,
  };
};