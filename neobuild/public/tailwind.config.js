/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          '50': '#eef6ff',
          '100': '#d8eaff',
          '200': '#badfff',
          '300': '#91caff',
          '400': '#6c9cff', // Accent
          '500': '#5e89f4', // Accent
          '600': '#5078e9', // Accent
          '700': '#3f66de', // Main
          '800': '#2a55d4', // Main
          '900': '#0044c9', // Dark
          'primary': '#2563EB', // Given Blue
        },
        teal: {
          '500': '#14b8a6',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
