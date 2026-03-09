/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can add custom DPS colors here if needed
      colors: {
        dps: {
          blue: '#2563eb',
          dark: '#0f172a',
        }
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [],
}