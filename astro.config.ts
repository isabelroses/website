import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "satteri-expressive-code";
import umami from "@yeskunall/astro-umami";
import icon from "astro-icon";
import mailObfuscation from "astro-mail-obfuscation";
import compress from "astro-compress";
import { satteri } from "@astrojs/markdown-satteri";
import { darkCode, lightCode } from "./src/lib/code-themes";

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
      hastPlugins: [
        expressiveCode({
          themes: [lightCode, darkCode],
          // replaced by the site's own copy button (src/components/CodeBlocks.astro)
          frames: { showCopyToClipboardButton: false },
        }),
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
