/**
 * Cart Management Service
 * Handles all cart-related operations following Single Responsibility Principle
 */

import { CartItem, Sweet } from '../types';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Cart Service class responsible for cart operations and persistence
 */
export class CartService {
  /**
   * Save cart data to localStorage
   */
  static saveToStorage(cartData: CartItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  /**
   * Load cart data from localStorage
   */
  static loadFromStorage(): CartItem[] {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear cart data from localStorage
   */
  static clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CART);
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  }

  /**
   * Add item to cart or update quantity if exists
   */
  static addItemToCart(
    currentCart: CartItem[],
    sweet: Sweet,
    quantity: number = 1
  ): CartItem[] {
    const existingItem = currentCart.find(item => item.id === sweet.id);
    
    if (existingItem) {
      return currentCart.map(item =>
        item.id === sweet.id
          ? { ...item, cartQuantity: item.cartQuantity + quantity }
          : item
      );
    } else {
      return [...currentCart, { ...sweet, cartQuantity: quantity }];
    }
  }

  /**
   * Remove item from cart completely
   */
  static removeItemFromCart(currentCart: CartItem[], sweetId: string): CartItem[] {
    return currentCart.filter(item => item.id !== sweetId);
  }

  /**
   * Update item quantity in cart
   */
  static updateItemQuantity(
    currentCart: CartItem[],
    sweetId: string,
    newQuantity: number
  ): CartItem[] {
    if (newQuantity <= 0) {
      return this.removeItemFromCart(currentCart, sweetId);
    }

    return currentCart.map(item =>
      item.id === sweetId
        ? { ...item, cartQuantity: newQuantity }
        : item
    );
  }

  /**
   * Get quantity of specific item in cart
   */
  static getItemQuantity(cart: CartItem[], sweetId: string): number {
    const cartItem = cart.find(item => item.id === sweetId);
    return cartItem ? cartItem.cartQuantity : 0;
  }

  /**
   * Calculate total price of cart items
   */
  static calculateTotalPrice(cart: CartItem[]): number {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.cartQuantity);
    }, 0);
  }

  /**
   * Calculate total number of items in cart
   */
  static calculateTotalItems(cart: CartItem[]): number {
    return cart.reduce((total, item) => total + item.cartQuantity, 0);
  }

  /**
   * Check if adding quantity would exceed available stock
   */
  static wouldExceedStock(
    cart: CartItem[],
    sweetId: string,
    additionalQuantity: number,
    availableStock: number
  ): boolean {
    const currentInCart = this.getItemQuantity(cart, sweetId);
    return (currentInCart + additionalQuantity) > availableStock;
  }

  /**
   * Validate if item can be added to cart
   */
  static canAddToCart(
    cart: CartItem[],
    sweet: Sweet,
    quantityToAdd: number = 1
  ): { canAdd: boolean; reason?: string } {
    if (sweet.quantity === 0) {
      return { canAdd: false, reason: 'Item is out of stock' };
    }

    if (this.wouldExceedStock(cart, sweet.id, quantityToAdd, sweet.quantity)) {
      return { canAdd: false, reason: 'Cannot add more than available stock' };
    }

    return { canAdd: true };
  }

  /**
   * Clear entire cart
   */
  static clearCart(): CartItem[] {
    this.clearStorage();
    return [];
  }
}