import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import pkg from "./package.json" with { type: "json" };

const version = pkg.version;

// Point the dev server at a local backend with API_PROXY=http://localhost:8080
const apiProxy = process.env.API_PROXY || "https://api.beampipe.io";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    proxy: {
      "/graphql": apiProxy,
      "/login": apiProxy,
      "/logout": apiProxy,
      "/oauth": apiProxy,
    },
  },
});
