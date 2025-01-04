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
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      webjsx: resolve(__dirname, "../../node_modules/webjsx/dist/index.js"),
      "webjsx/jsx-runtime": resolve(
        __dirname,
        "../../node_modules/webjsx/dist/jsx-runtime.js"
      ),
    },
  },
});
