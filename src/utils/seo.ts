import { SITE_URL, type SeoMeta } from "@/constants/seo";

const setMetaContent = (
  attribute: "name" | "property",
  key: string,
  content: string,
): void => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

const setCanonicalHref = (path: string): void => {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = `${SITE_URL}${path}`;
};

export const applySeoMeta = (seo: SeoMeta): void => {
  const url = `${SITE_URL}${seo.canonicalPath}`;

  document.title = seo.title;
  setMetaContent("name", "description", seo.description);
  setMetaContent("property", "og:site_name", seo.siteName);
  setMetaContent("property", "og:title", seo.title);
  setMetaContent("property", "og:description", seo.description);
  setMetaContent("property", "og:url", url);
  setMetaContent("property", "og:locale", seo.ogLocale);
  setCanonicalHref(seo.canonicalPath);
};
