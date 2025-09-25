// frontend/src/components/FeaturedSweets.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Sweet } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return 'https://placehold.co/400x300/FBF9F6/8B4513?text=No+Image';
  return `${API_BASE_URL}${imageUrl}`;
};

// Helper function to get variable ratings for different sweets
const getRating = (sweetName: string) => {
  const ratings: { [key: string]: { stars: string; score: string } } = {
    // Popular sweets get higher ratings (4.7-4.9) - Mix of traditional and global favorites
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

interface FeaturedSweetsProps {
  sweets: Sweet[];
  onAddToCart: (sweet: Sweet) => void;
  onMixedBoxClick?: () => void;
}

export const FeaturedSweets: React.FC<FeaturedSweetsProps> = ({ sweets, onAddToCart, onMixedBoxClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Filter global desserts for Most Loved section and randomize their order
  const globalCategories = ['European', 'Middle Eastern', 'French', 'American', 'Japanese', 'Spanish', 'Australian', 'Italian', 'Latin American'];
  const globalSweets = Array.isArray(sweets) ? sweets.filter(sweet => globalCategories.includes(sweet.category)) : [];
  const featuredSweets = useMemo(() => {
    if (globalSweets.length === 0) return [];
    return [...globalSweets].sort(() => Math.random() - 0.5).slice(0, 6);
  }, [globalSweets.length, refreshKey]);
  
  // Refresh order periodically to show different combinations
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Auto-rotate slides - pause on hover
  useEffect(() => {
    if (featuredSweets.length > 3 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.ceil(featuredSweets.length / 3));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredSweets.length, isPaused]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % Math.ceil(featuredSweets.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev === 0 ? Math.ceil(featuredSweets.length / 3) - 1 : prev - 1);
  };

  if (featuredSweets.length === 0) {
    return (
      <section className="mb-16">
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
            <span className="text-2xl">🌍</span>
            <span className="text-white font-semibold">Global Favorites</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Most Loved Global Desserts
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Our international dessert collection is coming soon! Stay tuned for delicious global treats.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slide-in-right {
          0% { transform: translateX(100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(210, 105, 30, 0.3); }
          50% { box-shadow: 0 0 30px rgba(210, 105, 30, 0.6); }
        }
        
        @keyframes shine {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        
        .animate-slide-in { animation: slide-in-right 0.6s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shine-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -200px;
          width: 200px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shine 3s infinite;
        }
      `}</style>
      
      <section className="mb-16">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
            <span className="text-2xl">🌍</span>
            <span className="text-white font-semibold">Global Favorites</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Most Loved Global Desserts
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Discover our most popular international desserts from around the world - each visit brings a new selection
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {featuredSweets.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/20 hover:border-white/40"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/20 hover:border-white/40"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Carousel Track */}
          <div 
            className="overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm p-8 border border-white/10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-8"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(featuredSweets.length / 3) }).map((_, slideIndex) => (
                <div key={slideIndex} className="flex-none w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredSweets.slice(slideIndex * 3, (slideIndex + 1) * 3).map((sweet, index) => (
                      <div
                        key={sweet.id}
                        className="group bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden shine-effect animate-slide-in border border-white/20 hover:border-white/30"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        {/* Sweet Image */}
                        <div className="relative overflow-hidden h-64">
                          <img
                            src={getImageUrl(sweet.imageUrl)}
                            alt={sweet.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          
                          {/* Overlay with Quick Actions */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                              <div>
                                <div className="text-white text-sm font-medium">Quick Add</div>
                              </div>
                              <button
                                onClick={() => onAddToCart(sweet)}
                                className="bg-brand-orange hover:bg-brand-orange/90 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Popular Badge - Only for selected sweets */}
                          {(['Kaju Katli', 'Gulab Jamun', 'Rasgulla', 'Rasmalai', 'Tiramisu', 'New York Cheesecake'].includes(sweet.name)) && (
                            <div className="absolute top-4 left-4">
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse-glow">
                                🔥 Popular
                              </span>
                            </div>
                          )}
                          
                          {/* Stock Status */}
                          {sweet.quantity > 0 ? (
                            <div className="absolute top-4 right-4">
                              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                ✅ In Stock
                              </span>
                            </div>
                          ) : (
                            <div className="absolute top-4 right-4">
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                ✖️ Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Sweet Details */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-orange transition-colors duration-300">
                            {sweet.name}
                          </h3>
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {sweet.description || "Delicious traditional sweet made with authentic ingredients and time-honored recipes."}
                          </p>
                          
                          {/* Price and Rating */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-brand-orange">₹{sweet.price}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">{getRating(sweet.name).stars}</span>
                              <span className="text-xs text-gray-400">({getRating(sweet.name).score})</span>
                            </div>
                          </div>
                          
                          {/* Add to Cart Button */}
                          <button
                            onClick={() => onAddToCart(sweet)}
                            disabled={sweet.quantity <= 0}
                            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                              sweet.quantity > 0
                                ? 'bg-gradient-to-r from-brand-orange to-yellow-500 hover:from-yellow-500 hover:to-brand-orange text-white hover:scale-105 shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {sweet.quantity > 0 ? (
                              <span className="flex items-center justify-center gap-2">
                                🛒 Add to Cart
                              </span>
                            ) : (
                              'Out of Stock'
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          {featuredSweets.length > 3 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: Math.ceil(featuredSweets.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-brand-orange scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-white/20">
            <span className="text-2xl">🎯</span>
            <span className="text-white font-semibold">Can't decide? Try our</span>
            <button 
              onClick={onMixedBoxClick}
              className="bg-gradient-to-r from-brand-orange to-yellow-500 text-white font-bold px-6 py-2 rounded-full hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Mixed Box Special
            </button>
          </div>
        </div>
      </section>
    </>
  );
};