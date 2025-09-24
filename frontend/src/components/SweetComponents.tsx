/**
 * Sweet Components
 * Components for displaying and managing sweet products
 */

import React from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import type { SweetWithQuantity } from '../types';
import { apiService } from '../services/ApiService';

/**
 * Sweet Grid Component
 * Displays a grid of sweet cards
 */
interface SweetGridProps {
  sweets: SweetWithQuantity[];
  isAdmin: boolean;
  getCartQuantity: (sweetId: string) => number;
  onAddToCart: (sweet: SweetWithQuantity) => void;
  onUpdateCartQuantity: (sweetId: string, change: number) => void;
  onUpdateStock: (sweetId: string, change: number) => void;
}

export const SweetGrid: React.FC<SweetGridProps> = ({
  sweets,
  isAdmin,
  getCartQuantity,
  onAddToCart,
  onUpdateCartQuantity,
  onUpdateStock,
}) => {
  if (sweets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">🍮</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sweets available</h3>
        <p className="text-gray-600">Check back later for delicious treats!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sweets.map(sweet => (
        <SweetCard
          key={sweet.id}
          sweet={sweet}
          isAdmin={isAdmin}
          cartQuantity={getCartQuantity(sweet.id)}
          onAddToCart={onAddToCart}
          onUpdateCartQuantity={onUpdateCartQuantity}
          onUpdateStock={onUpdateStock}
        />
      ))}
    </div>
  );
};

/**
 * Sweet Card Component
 * Displays individual sweet product card
 */
interface SweetCardProps {
  sweet: SweetWithQuantity;
  isAdmin: boolean;
  cartQuantity: number;
  onAddToCart: (sweet: SweetWithQuantity) => void;
  onUpdateCartQuantity: (sweetId: string, change: number) => void;
  onUpdateStock: (sweetId: string, change: number) => void;
}

export const SweetCard: React.FC<SweetCardProps> = ({
  sweet,
  isAdmin,
  cartQuantity,
  onAddToCart,
  onUpdateCartQuantity,
  onUpdateStock,
}) => {
  const isOutOfStock = sweet.quantity === 0;
  const isMaxQuantityAdded = cartQuantity >= sweet.quantity;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Sweet Image */}
      <SweetImage sweet={sweet} />
      
      <div className="p-4">
        {/* Sweet Info */}
        <SweetInfo sweet={sweet} />
        
        {/* Admin Stock Controls */}
        {isAdmin && (
          <AdminStockControls
            sweet={sweet}
            onUpdateStock={onUpdateStock}
          />
        )}
        
        {/* Cart Quantity Display */}
        {cartQuantity > 0 && (
          <CartQuantityDisplay
            cartQuantity={cartQuantity}
            sweet={sweet}
            onUpdateCartQuantity={onUpdateCartQuantity}
          />
        )}
        
        {/* Add to Cart Button */}
        <AddToCartButton
          sweet={sweet}
          isOutOfStock={isOutOfStock}
          isMaxQuantityAdded={isMaxQuantityAdded}
          onAddToCart={onAddToCart}
        />
      </div>
    </div>
  );
};

/**
 * Sweet Image Component
 * Handles sweet image display with error handling
 */
interface SweetImageProps {
  sweet: SweetWithQuantity;
}

const SweetImage: React.FC<SweetImageProps> = ({ sweet }) => {
  return (
    <div className="h-48 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center overflow-hidden">
      {sweet.imageUrl ? (
        <img 
          src={apiService.getImageUrl(sweet.imageUrl)} 
          alt={sweet.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="text-4xl">🍮</span>
      )}
    </div>
  );
};

/**
 * Sweet Info Component
 * Displays sweet details (name, price, category, description)
 */
interface SweetInfoProps {
  sweet: SweetWithQuantity;
}

const SweetInfo: React.FC<SweetInfoProps> = ({ sweet }) => {
  return (
    <>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{sweet.name}</h3>
        <span className="text-lg font-bold text-blue-600">₹{sweet.price}</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">{sweet.category}</p>
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{sweet.description}</p>
    </>
  );
};

/**
 * Admin Stock Controls Component
 * Allows admin users to manage inventory
 */
interface AdminStockControlsProps {
  sweet: SweetWithQuantity;
  onUpdateStock: (sweetId: string, change: number) => void;
}

const AdminStockControls: React.FC<AdminStockControlsProps> = ({
  sweet,
  onUpdateStock,
}) => {
  return (
    <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded">
      <span className="text-sm text-gray-700">Stock: {sweet.quantity}</span>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onUpdateStock(sweet.id, -1)}
          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
          aria-label="Decrease stock"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onUpdateStock(sweet.id, 1)}
          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
          aria-label="Increase stock"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Cart Quantity Display Component
 * Shows current quantity in cart with controls
 */
interface CartQuantityDisplayProps {
  cartQuantity: number;
  sweet: SweetWithQuantity;
  onUpdateCartQuantity: (sweetId: string, change: number) => void;
}

const CartQuantityDisplay: React.FC<CartQuantityDisplayProps> = ({
  cartQuantity,
  sweet,
  onUpdateCartQuantity,
}) => {
  return (
    <div className="flex items-center justify-center space-x-3 mb-3 p-2 bg-green-50 rounded-lg">
      <span className="text-sm text-gray-600">In Cart:</span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateCartQuantity(sweet.id, -1)}
          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
          aria-label="Remove one from cart"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-bold text-green-700">
          {cartQuantity}
        </span>
        <button
          onClick={() => onUpdateCartQuantity(sweet.id, 1)}
          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
          disabled={cartQuantity >= sweet.quantity}
          aria-label="Add one to cart"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Add to Cart Button Component
 * Handles adding items to cart with proper state display
 */
interface AddToCartButtonProps {
  sweet: SweetWithQuantity;
  isOutOfStock: boolean;
  isMaxQuantityAdded: boolean;
  onAddToCart: (sweet: SweetWithQuantity) => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  sweet,
  isOutOfStock,
  isMaxQuantityAdded,
  onAddToCart,
}) => {
  const getButtonText = () => {
    if (isOutOfStock) return 'Not Available';
    if (isMaxQuantityAdded) return 'Max Quantity Added';
    return 'Add to Cart';
  };

  const getButtonClasses = () => {
    const baseClasses = 'w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200';
    
    if (isOutOfStock || isMaxQuantityAdded) {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    
    return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
  };

  return (
    <button
      onClick={() => onAddToCart(sweet)}
      disabled={isOutOfStock || isMaxQuantityAdded}
      className={getButtonClasses()}
      aria-label={`Add ${sweet.name} to cart`}
    >
      {getButtonText()}
    </button>
  );
};

/**
 * Loading State Component
 * Shows loading state while sweets are being fetched
 */
export const SweetGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};