import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "vite";

const MARKER = '<div id="app"></div>';

function findHeroPreloadLink() {
  const assetsDir = new URL("../dist/assets", import.meta.url);
  const hero = readdirSync(assetsDir).find((name) =>
    /^big-logo[\w-]*\.webp$/.test(name),
  );
  return hero
    ? `<link rel="preload" as="image" href="/assets/${hero}" />`
    : "";
}

function fixAssetPaths(html) {
  const assetsDir = new URL("../dist/assets", import.meta.url);
  const map = new Map();
  for (const name of readdirSync(assetsDir)) {
    const m = name.match(/^(big-logo(?:-dark)?)[\w-]*\.webp$/);
    if (m) map.set(`/src/assets/${m[1]}.webp`, `/assets/${name}`);
  }
  return html.replace(/\/src\/assets\/[\w.-]+\.webp/g, (path) => map.get(path) ?? path);
}

function buildFaqJsonLd(items) {
  if (!items.length) return "";
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.title,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const json = JSON.stringify(faqPage).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

const EN_HEAD = [
  [
    '<html lang="ru">',
    '<html lang="en">',
  ],
  [
    /<title>[\s\S]*?<\/title>/,
    "<title>Ship-Monitor — industrial refrigeration temperature monitoring</title>",
  ],
  [
    /<meta\s+name="description"\s+content="[^"]*"/,
    '<meta name="description" content="Ship-Monitor — refrigeration controller and temperature sensors for automated cold chain monitoring at food production facilities, warehouses, pharmacies and retail chains."',
  ],
  [
    '<link rel="canonical" href="https://ship-monitor.ru/" />',
    '<link rel="canonical" href="https://ship-monitor.ru/en/" />',
  ],
  ['<meta property="og:title" content="ШиП-Монитор" />', '<meta property="og:title" content="Ship-Monitor" />'],
  ['<meta property="og:site_name" content="ШиП-Монитор" />', '<meta property="og:site_name" content="Ship-Monitor" />'],
  [
    /<meta\s+property="og:description"\s+content="[^"]*"/,
    '<meta property="og:description" content="Refrigeration controller and temperature sensors: 24/7 online monitoring, reading history and alerts when values leave configured limits — web, push or SMS."',
  ],
  ['<meta property="og:url" content="https://ship-monitor.ru/" />', '<meta property="og:url" content="https://ship-monitor.ru/en/" />'],
  ['<meta property="og:locale" content="ru_RU" />', '<meta property="og:locale" content="en_US" />\n    <meta property="og:locale:alternate" content="ru_RU" />'],
  ['"inLanguage": "ru"', '"inLanguage": "en"'],
];

function toEnglishHead(indexHtml) {
  let html = indexHtml;
  for (const [from, to] of EN_HEAD) {
    if (!html.match(from)) {
      throw new Error(`prerender: EN head pattern not found: ${from}`);
    }
    html = html.replace(from, to);
  }
  return html;
}

const server = await createServer({
  mode: "production",
  appType: "custom",
  server: { middlewareMode: true },
  logLevel: "error",
});

try {
  const { renderLanding, getFaqItems } = await server.ssrLoadModule(
    "/src/prerender/landing-entry.ts",
  );

  const indexPath = new URL("../dist/index.html", import.meta.url);
  const template = readFileSync(indexPath, "utf8");
  if (!template.includes(MARKER)) {
    throw new Error("marker <div id=\"app\"></div> not found in dist/index.html");
  }

  const ruHtml = fixAssetPaths(await renderLanding("ru"));
  const ruFaqJsonLd = buildFaqJsonLd(getFaqItems("ru"));

  const enHtml = fixAssetPaths(await renderLanding("en"));
  const enFaqJsonLd = buildFaqJsonLd(getFaqItems("en"));

  const heroPreload = findHeroPreloadLink();

  let index = template.replace(MARKER, `<div id="app">${ruHtml}</div>`);
  if (ruFaqJsonLd) {
    index = index.replace("</head>", `  ${ruFaqJsonLd}\n  </head>`);
  }
  if (heroPreload) {
    index = index.replace("</head>", `  ${heroPreload}\n  </head>`);
  }
  writeFileSync(indexPath, index);

  let enIndex = toEnglishHead(template);
  enIndex = enIndex.replace(MARKER, `<div id="app">${enHtml}</div>`);
  if (enFaqJsonLd) {
    enIndex = enIndex.replace("</head>", `  ${enFaqJsonLd}\n  </head>`);
  }
  if (heroPreload) {
    enIndex = enIndex.replace("</head>", `  ${heroPreload}\n  </head>`);
  }
  mkdirSync(new URL("../dist/en", import.meta.url), { recursive: true });
  writeFileSync(new URL("../dist/en/index.html", import.meta.url), enIndex);

  const faqCount = getFaqItems("ru").length;
  if (faqCount === 0) {
    console.warn(
      "prerender: WARNING — CMS data is empty (timeout or unreachable); FAQ/roadmap sections are prerendered without content",
    );
  }
  console.log(
    `prerender: RU inlined into dist/index.html (faq items: ${faqCount}), EN into dist/en/index.html (faq items: ${getFaqItems("en").length})`,
  );
} finally {
  await server.close();
}
