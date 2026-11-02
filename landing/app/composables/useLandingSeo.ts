import { computed } from "vue";

import { useFaq } from "@/composables/useFaq";
import type { AppLocale } from "@/i18n";
import bigLogo from "@/assets/big-logo.webp";

const SITE_URL = "https://ship-monitor.ru";

const SEO: Record<
  AppLocale,
  {
    title: string;
    description: string;
    ogDescription: string;
    siteName: string;
    ogLocale: string;
  }
> = {
  ru: {
    title: "ШиП-Монитор — система мониторинга холодильного оборудования",
    description:
      "Система мониторинга холодильного оборудования: промышленные датчики температуры, онлайн-контроль 24/7, push и SMS-уведомления, автоматический журнал температуры и отчёты для складов, магазинов, аптек и пищевых производств.",
    ogDescription:
      "Холодильный контроллер и датчики температуры: онлайн-мониторинг 24/7, история показаний и уведомления при выходе за заданные границы — на сайте, push или SMS.",
    siteName: "ШиП-Монитор",
    ogLocale: "ru_RU",
  },
  en: {
    title: "Ship-Monitor — industrial refrigeration temperature monitoring",
    description:
      "Ship-Monitor — refrigeration controller and temperature sensors for automated cold chain monitoring at food production facilities, warehouses, pharmacies and retail chains.",
    ogDescription:
      "Refrigeration controller and temperature sensors: 24/7 online monitoring, reading history and alerts when values leave configured limits — web, push or SMS.",
    siteName: "Ship-Monitor",
    ogLocale: "en_US",
  },
};

export function useLandingSeo(locale: AppLocale): void {
  const { faqItems } = useFaq();
  const seo = SEO[locale];
  const canonical = locale === "en" ? `${SITE_URL}/en/` : `${SITE_URL}/`;

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogType: "website",
    ogSiteName: seo.siteName,
    ogTitle: seo.siteName,
    ogDescription: seo.ogDescription,
    ogUrl: canonical,
    ogImage: `${SITE_URL}/logo.png`,
    ogLocale: seo.ogLocale,
    ogLocaleAlternate: locale === "en" ? "ru_RU" : "en_US",
    twitterCard: "summary",
  });

  const siteJsonLd = computed(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: seo.siteName,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo.png`,
        email: "support@ship-monitor.ru",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: seo.siteName,
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  }));

  const faqJsonLd = computed(() => {
    const items = faqItems.value;
    if (items.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.title,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    };
  });

  const escapeJsonLd = (value: string): string => value.replace(/</g, "\\u003c");

  const jsonLdScripts = computed(() => {
    const scripts: Array<{
      type: "application/ld+json";
      innerHTML: string;
    }> = [
      {
        type: "application/ld+json",
        innerHTML: escapeJsonLd(JSON.stringify(siteJsonLd.value)),
      },
    ];

    if (faqJsonLd.value) {
      scripts.push({
        type: "application/ld+json",
        innerHTML: escapeJsonLd(JSON.stringify(faqJsonLd.value)),
      });
    }

    return scripts;
  });

  useHead({
    link: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hreflang: "ru", href: `${SITE_URL}/` },
      { rel: "alternate", hreflang: "en", href: `${SITE_URL}/en/` },
      { rel: "alternate", hreflang: "x-default", href: `${SITE_URL}/` },
      { rel: "preload", as: "image", href: bigLogo },
    ],
    script: jsonLdScripts,
  });
}
