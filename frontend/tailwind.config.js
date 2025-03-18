/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Include React components
    './components/ui/**/*.{js,ts,jsx,tsx}', // For ShadCN components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
