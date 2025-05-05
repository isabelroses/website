import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { remarkReadingTime } from "./remark-reading-time.mjs";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import umami from "@yeskunall/astro-umami";

// https://astro.build/config
export default defineConfig({
  site: "https://isabelroses.com",
  integrations: [
    sitemap(),
    umami({
      endpointUrl: "https://analytics.isabelroses.com/script.js",
      id: "be210218-aad1-4b3a-a6a3-366952e22d8e",
    }),
    expressiveCode({
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
    }),
  ],

  markdown: {
    remarkPlugins: [remarkReadingTime],
  },

  redirects: {
    // legacy self healing urls
    "/blog/custom-lib-nixossystem-11": "/blog/custom-lib-nixossystem",
    "/blog/im-not-mad-im-disappointed-10": "/blog/im-not-mad-im-disappointed",
    "/blog/2024-wrapped-9": "/blog/2024-wrapped",
    "/blog/nix-shells-8": "/blog/nix-shells",
    "/blog/experimenting-with-nix-7": "/blog/experimenting-with-nix",
    "/blog/writing-a-neovim-plugin-6": "/blog/writing-a-neovim-plugin",
    "blog/my-journey-so-far-5": "/blog/my-journey-so-far",
    "/blog/2023-wrapped-4": "/blog/2023-wrapped",
    "/blog/my-workflow-3": "/blog/my-workflow",
    "/blog/self-healing-urls-2": "/blog/self-healing-urls",
    "/blog/nixos-and-postgresql-1": "/blog/nixos-and-postgresql",
    // discord api
    "/api/discord": "https://discord.gg/8RVhHeJH3x",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
