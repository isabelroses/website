import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "satteri-expressive-code";
import umami from "@yeskunall/astro-umami";
import icon from "astro-icon";
import mailObfuscation from "astro-mail-obfuscation";
import compress from "astro-compress";
import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri";
import { readingTime } from "@xsynaptic/satteri-reading-time";
import satteriExternalLinks from "satteri-external-links";
import { satteriHeadingLink } from "satteri-heading-link";
import { darkCode, lightCode } from "./src/lib/code-themes";
import { codeBlockLabels } from "./src/lib/code-labels";
import { copyIcon } from "./src/lib/copy-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://isabelroses.com",

  trailingSlash: "never",

  build: { format: "file" },

  compressHTML: true,

  integrations: [
    sitemap(),
    icon(),
    umami({
      endpointUrl: "https://analytics.isabelroses.com/script.js",
      id: "be210218-aad1-4b3a-a6a3-366952e22d8e",
    }),
    mailObfuscation(),
    // kept for png/html/svg; vite already minifies css and js
    compress({ CSS: false, JavaScript: false }),
  ],

  redirects: {
    // legacy self healing urls
    "/blog/custom-lib-nixossystem-11": "/blog/custom-lib-nixossystem",
    "/blog/im-not-mad-im-disappointed-10": "/blog/im-not-mad-im-disappointed",
    "/blog/2024-wrapped-9": "/blog/2024-wrapped",
    "/blog/nix-shells-8": "/blog/nix-shells",
    "/blog/experimenting-with-nix-7": "/blog/experimenting-with-nix",
    "/blog/writing-a-neovim-plugin-6": "/blog/writing-a-neovim-plugin",
    "/blog/my-journey-so-far-5": "/blog/my-journey-so-far",
    "/blog/2023-wrapped-4": "/blog/2023-wrapped",
    "/blog/my-workflow-3": "/blog/my-workflow",
    "/blog/self-healing-urls-2": "/blog/self-healing-urls",
    "/blog/nixos-and-postgresql-1": "/blog/nixos-and-postgresql",
  },

  // faster markdown processing
  markdown: {
    // let expressive-code own code blocks instead of satteri's built-in shiki,
    // which would otherwise highlight them first and leave EC nothing to do
    syntaxHighlight: false,
    processor: satteri({
      features: { directive: true },
      mdastPlugins: [readingTime({ countCodeBlocks: true })],
      hastPlugins: [
        () => satteriHeadingIdsPlugin(),
        satteriHeadingLink({ levels: [2, 3, 4], icon: copyIcon() }),
        satteriExternalLinks({
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        }),
        expressiveCode({
          themes: [lightCode, darkCode],
          styleOverrides: {
            frames: {
              inlineButtonBackground: "var(--color-card)",
              inlineButtonForeground: "var(--color-fg-lighter)",
              inlineButtonBorder: "transparent",
              tooltipSuccessBackground: "var(--color-blood)",
              tooltipSuccessForeground: "var(--color-on-blood)",
            },
          },
        }),
        codeBlockLabels,
      ],
    }),
  },

  vite: {
    plugins: [tailwindcss()],

    // opengraph.tsx uses satori's React JSX. astro has no react integration,
    // so tell vite/oxc to transform the jsx itself.
    oxc: {
      jsx: {
        runtime: "automatic",
        importSource: "react",
      },
    },

    // https://github.com/thx/resvg-js/issues/175#issuecomment-1577291297
    ssr: { external: ["@resvg/resvg-js"] },
    optimizeDeps: { exclude: ["@resvg/resvg-js"] },
    build: { rollupOptions: { external: ["@resvg/resvg-js"] } },
  },
});
