const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["../templates/**/*.{html,go}"],
  safelist: [
    { pattern: /hljs+/ },
    { pattern: /theme+/ },
  ],
  darkMode: "class",
  theme: {
    colors: {
      "fg": "var(--fg)",
      "fg-lighter": "var(--fg-lighter)",
      "bg": "var(--bg)",
      "bg-lighter": "var(--bg-lighter)",
      "bg-darker": "var(--bg-darker)",
      "card": "var(--card)",
      "card-lighter": "var(--card-lighter)",
      "special": "var(--special)",
    },
    fontFamily: {
      sans: ['"Roboto"', ...defaultTheme.fontFamily.sans],
      mono: ['"Roboto Mono"', ...defaultTheme.fontFamily.mono],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
