/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdebd2',
          200: '#fad4a5',
          300: '#f7b566',
          400: '#f48d2a',
          500: '#f2700f',
          600: '#e35405',
          700: '#bc3e08',
          800: '#95310f',
          900: '#782910',
          950: '#411206',
        },
        sweet: {
          pink: '#ff69b4',
          purple: '#9370db',
          yellow: '#ffd700',
          red: '#ff1493',
          blue: '#00bfff',
        }
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

