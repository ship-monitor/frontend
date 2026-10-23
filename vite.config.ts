import { fileURLToPath, URL } from "node:url";

import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

function preloadHeroLogo(): Plugin {
  return {
    name: "preload-hero-logo",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const links: string[] = [];
        for (const file of Object.values(ctx.bundle ?? {})) {
          if (file.type !== "asset") continue;
          const original = file.originalFileNames[0] ?? file.name ?? "";
          if (/(^|\/)big-logo\.webp$/.test(original)) {
            links.push(`<link rel="preload" as="image" href="/${file.fileName}" />`);
          }
        }
        return links.length
          ? html.replace("</head>", `${links.join("\n    ")}\n  </head>`)
          : html;
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), preloadHeroLogo()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
