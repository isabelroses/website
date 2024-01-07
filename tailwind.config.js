/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.{html,go}"],
  safelist: [{
    pattern: /hljs+/,
  }],
  theme: {
    hljs: {
      theme: "../../../ctp-highlightjs-theme", // this is so cursed
    },
  },
  plugins: [
    require("@catppuccin/tailwindcss"),
    require("@tailwindcss/typography"),
    require("tailwind-highlightjs"),
  ],
};
