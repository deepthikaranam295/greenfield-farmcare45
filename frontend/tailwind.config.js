/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gf-dark':     '#367C2B',
        'gf-mid':      '#2A6121',
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
