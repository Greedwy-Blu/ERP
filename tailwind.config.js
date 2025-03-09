/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './App.js',
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './screens/**/*.{js,jsx,ts,tsx}',
      // If you use a `src` directory, add: './src/**/*.{js,tsx,ts,jsx}'
      // Do the same with `components`, `hooks`, `styles`, or any other top-level directories
    ],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        animation: {
          load1: 'load1 7.2s ease infinite',
          load2: 'load2 7.2s ease 0.6s infinite',
          load3: 'load3 7.2s ease 1.2s infinite',
          load4: 'load4 7.2s ease 1.8s infinite',
          load5: 'load5 7.2s ease 2.4s infinite',
          load6: 'load6 7.2s ease 3s infinite',
        },
        keyframes: {
          load1: {
            '0%': { bottom: '0', height: '0' },
            '6.944444444%': { bottom: '0', height: '100%' },
            '50%': { top: '0', height: '100%' },
            '59.944444433%': { top: '0', height: '0' },
          },
          load2: {
            '0%': { top: '0', height: '0' },
            '6.944444444%': { top: '0', height: '100%' },
            '50%': { bottom: '0', height: '100%' },
            '59.944444433%': { bottom: '0', height: '0' },
          },
          load3: {
            '0%': { top: '0', height: '0' },
            '6.944444444%': { top: '0', height: '100%' },
            '50%': { bottom: '0', height: '100%' },
            '59.94444443%': { bottom: '0', height: '0' },
          },
          load4: {
            '0%': { top: '0', height: '0' },
            '6.944444444%': { top: '0', height: '100%' },
            '50%': { bottom: '0', height: '100%' },
            '59.94444443%': { bottom: '0', height: '0' },
          },
          load5: {
            '0%': { bottom: '0', height: '0' },
            '6.944444444%': { bottom: '0', height: '100%' },
            '50%': { top: '0', height: '100%' },
            '59.94444443%': { top: '0', height: '0' },
          },
          load6: {
            '0%': { bottom: '0', height: '0' },
            '6.944444444%': { bottom: '0', height: '100%' },
            '50%': { top: '0', height: '100%' },
            '59.94444443%': { top: '0', height: '0' },
          },
        },
      },
    },
    plugins: [require("daisyui")],
  };
  