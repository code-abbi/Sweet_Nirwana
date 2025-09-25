// frontend/src/components/Hero.tsx
import React from 'react';

const InfoChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-brand-palace shadow-sm">
    {children}
  </div>
);

export const Hero = () => {
  return (
    <div className="relative bg-brand-bg-light rounded-2xl shadow-md overflow-hidden mb-12 p-8 md:p-12">
      <div className="absolute inset-0">
        <img
          src="/hero-background.jpg"
          alt="Assortment of Indian sweets"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg-light via-brand-bg-light/80 to-transparent"></div>
      </div>
      <div className="relative z-10 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <span className="bg-brand-gold-dark text-white text-xs font-bold px-3 py-1 rounded-full">
            Premium Quality
          </span>
          <span className="text-brand-palace text-xs font-bold">⭐ 4.9 Rating</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-brand-palace leading-tight">Mithai Palace</h1>
        <p className="mt-4 max-w-2xl mx-auto text-brand-palace/80">
          Authentic Indian sweets crafted with traditional recipes and finest
          ingredients. Experience the taste of tradition in every bite.
        </p>
        <div className="mt-8 flex justify-center items-center gap-4 flex-wrap">
          <InfoChip>Fresh Daily</InfoChip>
          <InfoChip>Premium Ingredients</InfoChip>
          <InfoChip>Traditional Recipes</InfoChip>
        </div>
      </div>
    </div>
  );
};