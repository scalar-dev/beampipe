import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "beampipe docs",
      favicon: "/favicon.png",
      customCss: [],
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
