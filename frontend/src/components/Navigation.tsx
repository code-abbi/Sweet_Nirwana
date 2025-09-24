/**
 * Navigation Component
 * Handles the top navigation bar with cart dropdown and authentication
 */

import React from 'react';
import { ShoppingBagIcon, PlusIcon, MinusIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import type { CartItem } from '../types';

/**
 * Navigation component props
 */
interface NavigationProps {
  isSignedIn: boolean;
  isAdmin: boolean;
  totalItems: number;
  totalPrice: number;
  cart: CartItem[];
  isCartOpen: boolean;
  onCartToggle: () => void;
  onSignOut: () => void;
  onShowSignIn: () => void;
  onShowAddSweet: () => void;
  onUpdateCartQuantity: (sweetId: string, newQuantity: number) => void;
  onRemoveFromCart: (sweetId: string) => void;
  onCheckout: () => void;
}

/**
 * Navigation component following Single Responsibility Principle
 * Responsible only for navigation UI and cart dropdown
 */
export const Navigation: React.FC<NavigationProps> = ({
  isSignedIn,
  isAdmin,
  totalItems,
  totalPrice,
  cart,
  isCartOpen,
  onCartToggle,
  onSignOut,
  onShowSignIn,
  onShowAddSweet,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onCheckout,
}) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold sweet-gradient bg-clip-text text-transparent">
              Mithai Shop
            </h1>
          </div>

          {/* Right side - Cart, Auth */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={onCartToggle}
              className="relative p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth Button */}
            {isSignedIn ? (
              <button 
                onClick={onSignOut}
                className="text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={onShowSignIn}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <UserIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}

            {/* Admin Add Sweet Button */}
            {isAdmin && (
              <button
                onClick={onShowAddSweet}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Sweet
              </button>
            )}
          </div>
        </div>

        {/* Cart Dropdown */}
        {isCartOpen && (
          <CartDropdown
            cart={cart}
            totalPrice={totalPrice}
            onUpdateQuantity={onUpdateCartQuantity}
            onRemoveItem={onRemoveFromCart}
            onCheckout={onCheckout}
          />
        )}
      </div>
    </nav>
  );
};

/**
 * Cart Dropdown Component
 * Handles the cart dropdown display and interactions
 */
interface CartDropdownProps {
  cart: CartItem[];
  totalPrice: number;
  onUpdateQuantity: (sweetId: string, newQuantity: number) => void;
  onRemoveItem: (sweetId: string) => void;
  onCheckout: () => void;
}

const CartDropdown: React.FC<CartDropdownProps> = ({
  cart,
  totalPrice,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  return (
    <div className="absolute right-4 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
        
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Individual Cart Item Component
 * Handles display and actions for a single cart item
 */
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (sweetId: string, newQuantity: number) => void;
  onRemove: (sweetId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.name}</h4>
        <p className="text-sm text-gray-600">₹{item.price} each</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Decrease quantity"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-medium">{item.cartQuantity}</span>
        
        <button
          onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Increase quantity"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-red-500 hover:text-red-700 ml-2 transition-colors"
          aria-label="Remove item"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};