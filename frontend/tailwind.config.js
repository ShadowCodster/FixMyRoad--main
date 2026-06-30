/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Civic navy — primary brand / header / authority color
        civic: {
          50: '#eef3f8',
          100: '#d7e3ee',
          200: '#b0c7dd',
          300: '#7fa3c4',
          400: '#4d7ba6',
          500: '#2f5d87',
          600: '#234b70',
          700: '#1e3a5f',
          800: '#162c48',
          900: '#101f33',
        },
        // Institutional blue — links / interactive accents
        accent: {
          50: '#eef5fc',
          100: '#d9e9f8',
          500: '#2563a8',
          600: '#1d4f88',
          700: '#173f6d',
        },
        // Paper background — warm off-white, not stark
        paper: {
          DEFAULT: '#f7f5f0',
          100: '#fbfaf7',
          200: '#efece4',
        },
        // Road condition semantics kept distinct from brand color
        road: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}