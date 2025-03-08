/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3498db',
        'secondary': '#2ecc71',
        'accent': '#9b59b6',
        'background': '#f5f7fa',
        'card': '#ffffff',
        'text': '#2c3e50',
        'error': '#e74c3c',
        'success': '#2ecc71',
        'warning': '#f39c12',
      },
      fontFamily: {
        'sans': ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 