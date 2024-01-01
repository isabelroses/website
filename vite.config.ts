import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),

      // Runtime compilation
      vue: "vue/dist/vue.esm-bundler.js",
    },
    dedupe: ["vue"],
  },
  server: {
    port: 3000,
    watch: {
      ignored: ["node_modules", "dist", ".git", ".github", ".direnv"],
    },
  },
});
