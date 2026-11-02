import tailwindcss from "@tailwindcss/vite";

const METRIKA_COUNTER_ID = 113958488;

const METRIKA_LOADER = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}(k=e.createElement(t)),(a=e.getElementsByTagName(t)[0]),(k.async=1),(k.src=r),a.parentNode.insertBefore(k,a);})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${METRIKA_COUNTER_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true,ecommerce:"dataLayer"});`;

export default defineNuxtConfig({
  compatibilityDate: "2026-11-01",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: (filePath: string) =>
        filePath.endsWith(".webp") ? false : undefined,
    },
  },

  app: {
    head: {
      meta: [
        { name: "yandex-verification", content: "4bde25607dc35e04" },
        {
          name: "google-site-verification",
          content: "hr-Lcolt4Ic0qKPom9bmBwKHT87NvhbFYVEmIFOtVjg",
        },
      ],
      link: [
        { rel: "icon", href: "/logo.png" },
        {
          rel: "preconnect",
          href: "https://cms.ship-monitor.ru",
          crossorigin: "",
        },
        {
          rel: "preload",
          href: "/Dobryak_font.ttf",
          as: "font",
          type: "font/ttf",
          crossorigin: "",
        },
      ],
      script: [{ type: "text/javascript", innerHTML: METRIKA_LOADER }],
    },
  },

  nitro: {
    routeRules: {
      "/logo.png": {
        headers: { "cache-control": "public, max-age=86400" },
      },
      "/Dobryak_font.ttf": {
        headers: { "cache-control": "public, max-age=31536000, immutable" },
      },
      "/robots.txt": { headers: { "cache-control": "no-cache" } },
      "/sitemap.xml": { headers: { "cache-control": "no-cache" } },
      "/llms.txt": { headers: { "cache-control": "no-cache" } },
      "/ai-catalog.json": { headers: { "cache-control": "no-cache" } },
      "/.well-known/ai-catalog.json": {
        headers: { "cache-control": "no-cache" },
      },
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
  },
});
