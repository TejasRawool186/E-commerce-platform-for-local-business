/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6',
          700: '#1D4ED8',
        },
        background: '#F9FAFB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        success: '#10B981',
        danger: '#EF4444',
      },
      maxWidth: {
        '7xl': '1280px',
      }
    },
  },
  plugins: [],
}
