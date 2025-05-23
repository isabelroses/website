import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  themes: [
    "github-light",
    "github-dark-high-contrast",
    "catppuccin-latte",
    "catppuccin-mocha",
    "catppuccin-macchiato",
    "catppuccin-frappe",
  ],
  customizeTheme: (theme) => {
    const newName = {
      "github-light": "light",
      "github-dark-high-contrast": "dark",
      "catppuccin-latte": "catppuccin_latte",
      "catppuccin-mocha": "catppuccin_mocha",
      "catppuccin-macchiato": "catppuccin_macchiato",
      "catppuccin-frappe": "catppuccin_frappe",
    }[theme.name] || theme.name;

    theme.name = newName;
    return theme;
  },
  // useDarkModeMediaQuery: true,
})
