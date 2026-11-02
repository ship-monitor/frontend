import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";

import LandingLayout from "@/components/layout/LandingLayout.vue";
import LandingPage from "@/pages/LandingPage.vue";
import ZhurnalTemperaturPage from "@/pages/ZhurnalTemperaturPage.vue";
import SegmentPage from "@/pages/SegmentPage.vue";
import { i18n, setLocale, type AppLocale } from "@/i18n";
import { useFaq } from "@/composables/useFaq";
import { useRoadmap } from "@/composables/useRoadmap";

const SEED_TIMEOUT_MS = 5000;

async function seedCmsData(): Promise<void> {
  const faq = useFaq();
  const roadmap = useRoadmap();

  const timeout = new Promise((resolve) => setTimeout(resolve, SEED_TIMEOUT_MS));
  await Promise.race([
    Promise.allSettled([faq.fetchFaq(), roadmap.fetchRoadmap()]),
    timeout,
  ]);

  faq.isLoading.value = false;
  roadmap.isLoading.value = false;
  faq.error.value = null;
  roadmap.error.value = null;
}

export async function renderPage(
  path: string,
  locale: AppLocale,
): Promise<string> {
  await seedCmsData();
  setLocale(locale);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: LandingPage },
      { path: "/en", component: LandingPage },
      { path: "/zhurnal-temperatur", component: ZhurnalTemperaturPage },
      { path: "/apteki", component: SegmentPage, meta: { segment: "apteki" } },
      { path: "/restorany", component: SegmentPage, meta: { segment: "restorany" } },
      { path: "/sklady", component: SegmentPage, meta: { segment: "sklady" } },
      { path: "/refrizheratory", component: SegmentPage, meta: { segment: "refrizheratory" } },
    ],
  });
  await router.push(path);
  await router.isReady();

  const app = createSSRApp({
    render: () => h(LandingLayout, null, { default: () => h(RouterView) }),
  });
  app.use(router);
  app.use(createPinia());
  app.use(i18n);

  return renderToString(app);
}

export async function renderLanding(locale: AppLocale): Promise<string> {
  return renderPage("/", locale);
}

export function getFaqItems(locale: AppLocale) {
  setLocale(locale);
  return useFaq().faqItems.value;
}
