/** @type {import('tailwindcss').Config} */
export default {
  content: [    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      display: ['group-hover'],
      animation: {
        keyframes : {
          'fade-in': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        },
        'fade-in': 'fade-in .5s ease-in-out',
      }
    },
  },
  plugins: [],
}

