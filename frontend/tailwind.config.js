/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
 hover: '#2563eb',
          light: '#dbeafe',
        },
        secondary: {
          DEFAULT: '#64748b',
          light: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
