// tailwind.config.js
module.exports = {
  darkMode: "class", // use class strategy, not media query
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      // custom colors and variables
    },
  },
  plugins: [],
};
