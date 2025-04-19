// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { remarkReadingTime } from "./remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://isabelroses.com",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-high-contrast',
        catppuccin_latte: 'catppuccin-latte',
        catppuccin_mocha: 'catppuccin-mocha',
        catppuccin_macchiato: 'catppuccin-macchiato',
        catppuccin_frappe: 'catppuccin-frappe',
      },
      defaultColor: 'catppuccin_mocha',
    },
  },
  // legacy self healing urls
  redirects: {
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
  },
});
