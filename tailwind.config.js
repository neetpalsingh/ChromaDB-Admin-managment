/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 9px at 75% scale
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 10.5px at 75% scale
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 12px at 75% scale
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 13.5px at 75% scale
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 15px at 75% scale
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 18px at 75% scale
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 22.5px at 75% scale
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 27px at 75% scale
        '5xl': ['3rem', { lineHeight: '1' }],          // 36px at 75% scale
        '6xl': ['3.75rem', { lineHeight: '1' }],       // 45px at 75% scale
      },
      spacing: {
        // Slightly reduce spacing to match smaller font sizes
        '0.5': '0.125rem',  // 1.5px at 75% scale
        '1': '0.25rem',     // 3px at 75% scale
        '1.5': '0.375rem',  // 4.5px at 75% scale
        '2': '0.5rem',      // 6px at 75% scale
        '2.5': '0.625rem',  // 7.5px at 75% scale
        '3': '0.75rem',     // 9px at 75% scale
        '3.5': '0.875rem',  // 10.5px at 75% scale
        '4': '1rem',        // 12px at 75% scale
        '5': '1.25rem',     // 15px at 75% scale
        '6': '1.5rem',      // 18px at 75% scale
        '8': '2rem',        // 24px at 75% scale
        '10': '2.5rem',     // 30px at 75% scale
        '12': '3rem',       // 36px at 75% scale
      }
    },
  },
  plugins: [],
}


