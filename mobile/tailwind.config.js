/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        sage: '#93AC80',
        navy: '#152A4E',
        'navy-soft': '#22406F',
        ink: '#111208',
        'brand-purple': '#7557FF',
        'brand-purple-deep': '#4B2FD1',
        'brand-purple-soft': '#A78BFA',
      },
      fontFamily: {
        display: ['Rubik_700Bold'],
        sans: ['Heebo_400Regular'],
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
  plugins: [],
};
