import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gf-dark':     '#1B4332',
        'gf-mid':      '#2D6A4F',
        'gf-light':    '#40916C',
        'gf-pale':     '#D8F3DC',
        'gf-offwhite': '#F9FDF9',
        'gf-text':     '#1A1A1A',
        'gf-muted':    '#444444',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '8px' },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
