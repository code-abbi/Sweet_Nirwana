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
  
  // Only show Popular badge for specific sweets (~25% of sweets)
  const popularSweets = ['Kaju Katli', 'Gulab Jamun', 'Rasgulla', 'Rasmalai'];
  const isPopular = popularSweets.includes(sweet.name);

  // Variable ratings for different sweets
  const getRating = (sweetName: string) => {
    const ratings: { [key: string]: { stars: string; score: string } } = {
      // Popular sweets get higher ratings (4.7-4.9)
      'Kaju Katli': { stars: '⭐⭐⭐⭐⭐', score: '4.9' },
      'Gulab Jamun': { stars: '⭐⭐⭐⭐⭐', score: '4.8' },
      'Rasgulla': { stars: '⭐⭐⭐⭐⭐', score: '4.7' },
      'Rasmalai': { stars: '⭐⭐⭐⭐⭐', score: '4.8' },
      // Other sweets get good ratings (4.0-4.6)
      'Barfi': { stars: '⭐⭐⭐⭐☆', score: '4.4' },
      'Jalebi': { stars: '⭐⭐⭐⭐☆', score: '4.2' },
      'Ladoo': { stars: '⭐⭐⭐⭐☆', score: '4.0' },
      'Halwa': { stars: '⭐⭐⭐⭐☆', score: '4.3' },
      'Sandesh': { stars: '⭐⭐⭐⭐☆', score: '4.5' },
      'Malai Roll': { stars: '⭐⭐⭐⭐☆', score: '4.6' },
      'Kheer': { stars: '⭐⭐⭐⭐☆', score: '4.1' }
    };
    return ratings[sweetName] || { stars: '⭐⭐⭐⭐☆', score: '4.0' };
  };

  return (
    <div className="bg-brand-bg-light rounded-2xl shadow-md overflow-hidden group">
      <div className="relative">
        <img
          src={getImageUrl(sweet.imageUrl)}
          alt={sweet.name}
          className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPopular && (
              <span className="text-xs font-bold bg-white/80 backdrop-blur-sm text-brand-palace px-2 py-1 rounded-full">
                ⭐ Popular
              </span>
            )}
            <span className="text-xs font-bold bg-white/80 backdrop-blur-sm text-brand-palace px-2 py-1 rounded-full">
              {sweet.category}
            </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-brand-palace">{sweet.name}</h3>
        <p className="text-sm text-brand-palace/70 mt-1 mb-2 line-clamp-2">{sweet.description}</p>
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-400 text-sm">{getRating(sweet.name).stars}</span>
          <span className="text-xs text-brand-palace/60">({getRating(sweet.name).score})</span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xl font-bold text-brand-palace">₹{sweet.price}</p>
            <p className="text-xs text-brand-palace/60">Stock: {sweet.quantity}</p>
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