import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "beampipe docs",
      logo: {
        src: "./src/assets/logo.svg",
      },
      customCss: ["./src/styles/custom.css"],
      favicon: "/favicon.png",
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      sidebar: [
        { label: "Introduction", slug: "index" },
        { label: "Getting started", slug: "getting-started" },
        {
          label: "Advanced topics",
          items: [
            { label: "Custom events", slug: "custom-events" },
            { label: "Slack integration", slug: "slack-integration" },
          ],
        },
        {
          label: "Links",
          items: [
            { label: "Beampipe", link: "https://beampipe.io" },
            { label: "Changelog", slug: "changelog" },
          ],
        },
      ],
    }),
  ],
});
