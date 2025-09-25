// frontend/src/components/CartSidebar.tsx
import React from 'react';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CartItem } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return 'https://placehold.co/100x100/FBF9F6/8B4513?text=No+Image';
  return `${API_BASE_URL}${imageUrl}`;
};

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalPrice: number;
  onUpdateQuantity: (sweetId: string, newQuantity: number) => void;
  onRemoveItem: (sweetId: string) => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalPrice,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-brand-bg-light shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-brand-palace/10">
            <h2 className="text-xl font-bold text-brand-palace">Your Cart ({cartItems.reduce((acc, item) => acc + item.cartQuantity, 0)} items)</h2>
            <button onClick={onClose} className="p-1 text-brand-palace/50 hover:text-brand-palace">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-brand-palace/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-brand-palace">Your cart is empty</h3>
              <p className="text-brand-palace/70 mt-1">Add some delicious sweets to get started!</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-grow">
                    <p className="font-semibold text-brand-palace">{item.name}</p>
                    <p className="text-sm text-brand-palace/70">₹{item.price} each</p>
                    <div className="flex items-center mt-2">
                      <button onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)} className="p-1 border rounded-md"><MinusIcon className="w-4 h-4" /></button>
                      <span className="px-3 font-semibold">{item.cartQuantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)} className="p-1 border rounded-md"><PlusIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-palace">₹{(parseFloat(item.price) * item.cartQuantity).toFixed(2)}</p>
                    <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 mt-2">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="p-6 border-t border-brand-palace/10">
              <div className="flex justify-between items-center text-lg font-bold text-brand-palace mb-4">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <button onClick={onCheckout} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-3 rounded-lg text-center transition-colors">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};