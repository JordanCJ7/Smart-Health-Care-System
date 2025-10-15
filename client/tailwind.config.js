/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3498db',
          600: '#2980b9',
          700: '#1e3a8a',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          500: '#27ae60',
          600: '#229954',
        },
        danger: {
          500: '#e74c3c',
          600: '#c0392b',
        },
        warning: {
          500: '#f39c12',
        },
        dark: {
          500: '#2c3e50',
          600: '#34495e',
        },
      },
    },
  },
  plugins: [],
}
