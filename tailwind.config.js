/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        warning: '#f59e0b',
        critical: '#dc2626',
        success: '#10b981',
      }
    },
  },
  plugins: [],
}
