/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#392C7D',
        secondary: '#FF4667'
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}
