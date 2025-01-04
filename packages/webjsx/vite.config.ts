import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "webjsx",
  },
  preview: {
    port: 4173,
  },
  resolve: {
    alias: {
      webjsx: "webjsx",
      "webjsx/jsx-runtime": "webjsx/jsx-runtime.js",
      "webjsx/jsx-dev-runtime": "webjsx/jsx-dev-runtime.js",
    },
  },
});
