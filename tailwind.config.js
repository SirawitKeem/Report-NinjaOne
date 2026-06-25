/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        '0.5': '2px',
        '0.75': '3px',
        '9': '36px',
        '25': '100px',
        '27.5': '110px',
        '30': '120px',
        '32': '128px',
        '34': '136px',
        '36.25': '145px',
        '31.75': '127px',
        '14.75': '59px',
        '198.5': '794px',
        '287.5': '1150px',
      }
    },
  },
  plugins: [],
}
