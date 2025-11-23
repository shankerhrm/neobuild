/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbf0',
          100: '#ffca4c',
          200: '#f4b73e',
          300: '#e8a331',
          400: '#dc9023',
          500: '#d07d13',
          600: '#c46a00',
          700: '#9d5500',
          800: '#764000',
          900: '#4f2b00',
        }
      }
    },
  },
  plugins: [],
}