
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        brand: {
          green: "#166534",    // Dark green-800 to match header
          dark: "#14532d",     // Dark green-900 to match header  
          muted: "#dcfce7"     // Light emerald green
        }
      },
      boxShadow:{
        soft:"0 10px 30px rgba(16, 185, 129, 0.15)",
        'green-glow': '0 0 20px rgba(16, 185, 129, 0.5)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
      }
    }
  },
  plugins: [],
}
