// frontend/src/components/SweetComponents.tsx
import React from 'react';
import { Sweet } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return 'https://placehold.co/400x300/FBF9F6/8B4513?text=No+Image';
  return `${API_BASE_URL}${imageUrl}`;
};

interface SweetCardProps {
  sweet: Sweet;
  onAddToCart: () => void;
}

export const SweetCard: React.FC<SweetCardProps> = ({ sweet, onAddToCart }) => {
  const isOutOfStock = sweet.quantity === 0;

  return (
    <div className="bg-brand-bg-light rounded-2xl shadow-md overflow-hidden group">
      <div className="relative">
        <img
          src={getImageUrl(sweet.imageUrl)}
          alt={sweet.name}
          className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className="text-xs font-bold bg-white/80 backdrop-blur-sm text-brand-palace px-2 py-1 rounded-full">
              ⭐ Popular
            </span>
            <span className="text-xs font-bold bg-white/80 backdrop-blur-sm text-brand-palace px-2 py-1 rounded-full">
              {sweet.category}
            </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-brand-palace">{sweet.name}</h3>
        <p className="text-sm text-brand-palace/70 mt-1 h-10">{sweet.description}</p>
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xl font-bold text-brand-palace">₹{sweet.price}</p>
            <p className="text-xs text-brand-palace/60">Stock: {sweet.quantity} pieces</p>
          </div>
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-brand-gold text-brand-palace hover:bg-brand-gold-dark shadow-sm'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};