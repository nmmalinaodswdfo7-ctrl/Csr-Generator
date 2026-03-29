/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./main/index.html",
    "./main/*.html",
    "./main/**/*.html",
    "./main/*.js",
    "./main/**/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
      },
      fontFamily: {
        display: ["Public Sans", "sans-serif"],
        lexend: ["Lexend", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        print: ["Calibri", "Arial", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      screens: {
        print: { raw: "print" },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
