import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "satteri-expressive-code";
import umami from "@yeskunall/astro-umami";
import icon from "astro-icon";
import mailObfuscation from "astro-mail-obfuscation";
import autoprefixer from "autoprefixer";
import compress from "astro-compress";
import { satteri } from "@astrojs/markdown-satteri";

// https://astro.build/config
export default defineConfig({
  site: "https://isabelroses.com",

  compressHTML: true,

  integrations: [
    sitemap(),
    icon(),
    umami({
      endpointUrl: "https://analytics.isabelroses.com/script.js",
      id: "be210218-aad1-4b3a-a6a3-366952e22d8e",
    }),
    mailObfuscation(),
    compress({
      // csso can't parse the media query range syntax tailwind v4 emits
      // (`@media (width >= 40rem)`) and silently drops those rules, which
      // strips every responsive breakpoint from the production css
      CSS: { csso: false, lightningcss: { minify: true } },
    }),
  ],

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
          themes: ["github-light", "github-dark-high-contrast"],
          customizeTheme: (theme) => {
            theme.name =
              {
                "github-light": "light",
                "github-dark-high-contrast": "dark",
              }[theme.name] || theme.name;

            return theme;
          },
        }),
      ],
    }),
  },

  vite: {
    plugins: [tailwindcss()],

    // opengraph.tsx uses satori's React JSX. astro has no react integration,
    // so tell vite/oxc to transform the jsx itself (classic runtime matches
    // the `import React` in that file).
    esbuild: {
      jsx: "transform",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
    },

    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },

    // https://github.com/thx/resvg-js/issues/175#issuecomment-1577291297
    ssr: { external: ["@resvg/resvg-js"] },
    optimizeDeps: { exclude: ["@resvg/resvg-js"] },
    build: { rollupOptions: { external: ["@resvg/resvg-js"] } },
  },
});
