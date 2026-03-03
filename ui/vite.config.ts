import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

const version = (() => {
  try {
    return readFileSync(resolve(__dirname, "../VERSION"), "utf-8").trim();
  } catch {}
  try {
    return execSync("git describe --tags --always", { encoding: "utf-8" }).trim();
  } catch {}
  return "unknown";
})();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    proxy: {
      "/graphql": "https://api.beampipe.io",
    },
  },
});
