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
          DEFAULT: '#8fa8ff',
          hover: '#7a93ff',
        },
        secondary: {
          DEFAULT: '#b59adf',
          hover: '#a585d4',
        },
        tertiary: {
          DEFAULT: '#a576e6',
          hover: '#9565db',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
