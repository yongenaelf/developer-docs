import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://yongenaelf.github.io",
  base: "developer-docs",
  integrations: [
    starlight({
      title: "Developer Docs",
      social: {
        github: "https://github.com/yongenaelf/developer-docs",
      },
      sidebar: [
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
      ],
    }),
  ],
});
