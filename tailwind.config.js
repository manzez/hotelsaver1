
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{brand:{green:"#009739",dark:"#036a2a",muted:"#e8fff1"}},
      boxShadow:{soft:"0 10px 30px rgba(0,0,0,.06)"},
    }
  },
  plugins: [],
}
