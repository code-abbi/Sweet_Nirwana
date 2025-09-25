// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        'brand-palace': {
          DEFAULT: '#8B4513', // A brown color for text
          light: '#D2B48C', // Tan
          extralight: '#F5DEB3', // Wheat
        },
        'brand-gold': {
          DEFAULT: '#FFD700', // Gold
          dark: '#DAA520', // GoldenRod
        },
        'brand-orange': {
          DEFAULT: '#F97316',
          light: '#FB923C',
        },
        'brand-bg': {
          DEFAULT: '#FBF9F6',
          light: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};