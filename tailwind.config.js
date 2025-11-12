
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        brand: {
          green: "#166534",    // Dark green-800
          dark: "#14532d",     // Dark green-900
          muted: "#dcfce7"     // Light emerald green
        }
      },
      boxShadow:{
        soft:"0 10px 30px rgba(16, 185, 129, 0.15)",
        'green-glow': '0 0 20px rgba(16, 185, 129, 0.5)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
      }
    }
  },
  plugins: [],
}
