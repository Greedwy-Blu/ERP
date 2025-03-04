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
      extend: {},
    },
    plugins: [],
  };
  