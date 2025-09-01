/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#F6FAFD',
        'primary': '#0A1931',
        'secondary': '#1A3D63',
        'accent': '#4A7FA7',
        'light-accent': '#B3CFE5',
        // Dark theme colors
        dark: {
          background: '#0A1931',
          primary: '#F6FAFD',
          secondary: '#B3CFE5',
          accent: '#4A7FA7',
        }
      }
    },
  },
  plugins: [],
}
