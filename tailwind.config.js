/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50:  '#fdf2f4',
          100: '#fbe8ec',
          200: '#f5c7d0',
          300: '#eda0b0',
          400: '#e06680',
          500: '#c94060',
          600: '#a62f4a',
          700: '#6B2737',
          800: '#4e1d28',
          900: '#2C1810',
        },
        gold: {
          300: '#d4b483',
          400: '#c9a86c',
          500: '#9B7D4C',
          600: '#7d6236',
        },
        ivory: {
          50:  '#fdfaf5',
          100: '#F5EFE0',
          200: '#EDE4CC',
          300: '#E8DCC8',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        body:  ['Source Serif 4', 'Georgia', 'serif'],
        sans:  ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
