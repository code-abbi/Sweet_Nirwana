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
  
  // Only show Popular badge for specific sweets (~25% of sweets) - Mix of traditional and global favorites
  const popularSweets = ['Kaju Katli', 'Gulab Jamun', 'Rasgulla', 'Rasmalai', 'Tiramisu', 'New York Cheesecake'];
  const isPopular = popularSweets.includes(sweet.name);

  // Variable ratings for different sweets
  const getRating = (sweetName: string) => {
    const ratings: { [key: string]: { stars: string; score: string } } = {
      // Popular sweets get higher ratings (4.7-4.9)
      'Kaju Katli': { stars: '⭐⭐⭐⭐⭐', score: '4.9' },
      'Gulab Jamun': { stars: '⭐⭐⭐⭐⭐', score: '4.8' },
      'Rasgulla': { stars: '⭐⭐⭐⭐⭐', score: '4.7' },
      'Rasmalai': { stars: '⭐⭐⭐⭐⭐', score: '4.8' },
      'Tiramisu': { stars: '⭐⭐⭐⭐⭐', score: '4.9' },
      'New York Cheesecake': { stars: '⭐⭐⭐⭐⭐', score: '4.8' },
      // Other traditional sweets get good ratings (4.0-4.6)
      'Barfi': { stars: '⭐⭐⭐⭐☆', score: '4.4' },
      'Jalebi': { stars: '⭐⭐⭐⭐☆', score: '4.2' },
      'Ladoo': { stars: '⭐⭐⭐⭐☆', score: '4.0' },
      'Halwa': { stars: '⭐⭐⭐⭐☆', score: '4.3' },
      'Sandesh': { stars: '⭐⭐⭐⭐☆', score: '4.5' },
      'Malai Roll': { stars: '⭐⭐⭐⭐☆', score: '4.6' },
      'Kheer': { stars: '⭐⭐⭐⭐☆', score: '4.1' },
      // Global desserts ratings (4.0-4.7)
      'Baklava': { stars: '⭐⭐⭐⭐⭐', score: '4.7' },
      'Crème Brûlée': { stars: '⭐⭐⭐⭐☆', score: '4.6' },
      'Mochi': { stars: '⭐⭐⭐⭐☆', score: '4.5' },
      'Churros': { stars: '⭐⭐⭐⭐☆', score: '4.3' },
      'French Macarons': { stars: '⭐⭐⭐⭐⭐', score: '4.7' },
      'Pavlova': { stars: '⭐⭐⭐⭐☆', score: '4.4' },
      'Artisan Gelato': { stars: '⭐⭐⭐⭐☆', score: '4.5' },
      'Tres Leches Cake': { stars: '⭐⭐⭐⭐☆', score: '4.6' }
    };
    return ratings[sweetName] || { stars: '⭐⭐⭐⭐☆', score: '4.0' };
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden group border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="relative">
        <img
          src={getImageUrl(sweet.imageUrl)}
          alt={sweet.name}
          className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPopular && (
              <span className="text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full shadow-lg animate-pulse">
                ⭐ Popular
              </span>
            )}
            <span className="text-xs font-bold bg-white/10 backdrop-blur-sm text-white px-2 py-1 rounded-full border border-white/20">
              {sweet.category}
            </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-brand-orange transition-colors duration-300">{sweet.name}</h3>
        <p className="text-sm text-gray-300 mt-1 mb-2 line-clamp-2">{sweet.description}</p>
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-400 text-sm">{getRating(sweet.name).stars}</span>
          <span className="text-xs text-gray-400">({getRating(sweet.name).score})</span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xl font-bold text-brand-orange">₹{sweet.price}</p>
            <p className="text-xs text-gray-400">Stock: {sweet.quantity}</p>
          </div>
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-orange to-yellow-500 hover:from-yellow-500 hover:to-brand-orange text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};