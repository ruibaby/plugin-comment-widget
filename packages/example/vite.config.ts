import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 4000,
    proxy: {
      "/actuator": {
        target: "http://localhost:8090",
        changeOrigin: true,
      },
    },
  },
});
