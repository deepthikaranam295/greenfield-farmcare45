/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gf-dark':     '#4A7C59',
        'gf-mid':      '#3A6147',
        'gf-light':    '#FFDE00',
        'gf-pale':     '#FFF8C0',
        'gf-offwhite': '#F5F5F0',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
