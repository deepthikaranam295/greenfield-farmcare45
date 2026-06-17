/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gf-dark':   '#1B4332',
        'gf-mid':    '#2D6A4F',
        'gf-light':  '#40916C',
        'gf-pale':   '#D8F3DC',
        'gf-offwhite': '#F9FDF9',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
