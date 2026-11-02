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

function toEnglishHead(indexHtml, seoRu, seoEn, siteUrl) {
  const replacements = [
    ['<html lang="ru">', '<html lang="en">'],
    [/<title>[\s\S]*?<\/title>/, `<title>${seoEn.title}</title>`],
    [
      /<meta\s+name="description"\s+content="[^"]*"/,
      `<meta name="description" content="${seoEn.description}"`,
    ],
    [
      `<link rel="canonical" href="${siteUrl}${seoRu.canonicalPath}" />`,
      `<link rel="canonical" href="${siteUrl}${seoEn.canonicalPath}" />`,
    ],
    [
      `<meta property="og:title" content="${seoRu.siteName}" />`,
      `<meta property="og:title" content="${seoEn.siteName}" />`,
    ],
    [
      `<meta property="og:site_name" content="${seoRu.siteName}" />`,
      `<meta property="og:site_name" content="${seoEn.siteName}" />`,
    ],
    [
      /<meta\s+property="og:description"\s+content="[^"]*"/,
      `<meta property="og:description" content="${seoEn.description}"`,
    ],
    [
      `<meta property="og:url" content="${siteUrl}${seoRu.canonicalPath}" />`,
      `<meta property="og:url" content="${siteUrl}${seoEn.canonicalPath}" />`,
    ],
    [
      `<meta property="og:locale" content="${seoRu.ogLocale}" />`,
      `<meta property="og:locale" content="${seoEn.ogLocale}" />\n    <meta property="og:locale:alternate" content="${seoRu.ogLocale}" />`,
    ],
    ['"inLanguage": "ru"', '"inLanguage": "en"'],
  ];
  let html = indexHtml;
  for (const [from, to] of replacements) {
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

function applyPageHead(indexHtml, seo, siteUrl) {
  const replacements = [
    [/<title>[\s\S]*?<\/title>/, `<title>${seo.title}</title>`],
    [
      /<meta\s+name="description"\s+content="[^"]*"/,
      `<meta name="description" content="${seo.description}"`,
    ],
    [
      `<link rel="canonical" href="${siteUrl}/" />`,
      `<link rel="canonical" href="${siteUrl}${seo.canonicalPath}" />`,
    ],
    [
      /<meta\s+property="og:title"\s+content="[^"]*"/,
      `<meta property="og:title" content="${seo.title}"`,
    ],
    [
      /<meta\s+property="og:description"\s+content="[^"]*"/,
      `<meta property="og:description" content="${seo.description}"`,
    ],
    [
      `<meta property="og:url" content="${siteUrl}/" />`,
      `<meta property="og:url" content="${siteUrl}${seo.canonicalPath}" />`,
    ],
  ];
  let html = indexHtml;
  for (const [from, to] of replacements) {
    if (!html.match(from)) {
      throw new Error(`prerender: page head pattern not found: ${from}`);
    }
    html = html.replace(from, to);
  }
  return html;
}

try {
  const { renderLanding, renderPage, getFaqItems } = await server.ssrLoadModule(
    "/src/prerender/landing-entry.ts",
  );
  const { SEO, SEO_PAGES, SITE_URL } = await server.ssrLoadModule(
    "/src/constants/seo.ts",
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

  let enIndex = toEnglishHead(template, SEO.ru, SEO.en, SITE_URL);
  enIndex = enIndex.replace(MARKER, `<div id="app">${enHtml}</div>`);
  if (enFaqJsonLd) {
    enIndex = enIndex.replace("</head>", `  ${enFaqJsonLd}\n  </head>`);
  }
  if (heroPreload) {
    enIndex = enIndex.replace("</head>", `  ${heroPreload}\n  </head>`);
  }
  mkdirSync(new URL("../dist/en", import.meta.url), { recursive: true });
  writeFileSync(new URL("../dist/en/index.html", import.meta.url), enIndex);

  const subPages = [
    { path: "/zhurnal-temperatur", dir: "zhurnal-temperatur", seoKey: "ZhurnalTemperatur" },
    { path: "/apteki", dir: "apteki", seoKey: "Apteki" },
    { path: "/restorany", dir: "restorany", seoKey: "Restorany" },
    { path: "/sklady", dir: "sklady", seoKey: "Sklady" },
    { path: "/refrizheratory", dir: "refrizheratory", seoKey: "Refrizheratory" },
  ];

  for (const subPage of subPages) {
    const seo = SEO_PAGES[subPage.seoKey];
    if (!seo) {
      throw new Error(`prerender: unknown SEO key ${subPage.seoKey}`);
    }
    const html = fixAssetPaths(await renderPage(subPage.path, "ru"));
    let page = applyPageHead(template, seo, SITE_URL);
    page = page.replace(MARKER, `<div id="app">${html}</div>`);
    if (heroPreload) {
      page = page.replace("</head>", `  ${heroPreload}\n  </head>`);
    }
    mkdirSync(new URL(`../dist/${subPage.dir}`, import.meta.url), { recursive: true });
    writeFileSync(new URL(`../dist/${subPage.dir}/index.html`, import.meta.url), page);
  }

  const faqCount = getFaqItems("ru").length;
  if (faqCount === 0) {
    console.warn(
      "prerender: WARNING — CMS data is empty (timeout or unreachable); FAQ/roadmap sections are prerendered without content",
    );
  }
  console.log(
    `prerender: RU inlined into dist/index.html (faq items: ${faqCount}), EN into dist/en/index.html (faq items: ${getFaqItems("en").length}), sub pages: ${subPages.map((p) => p.dir).join(", ")}`,
  );
} finally {
  await server.close();
}
