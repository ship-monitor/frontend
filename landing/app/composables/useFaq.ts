import { computed, ref } from "vue";

import { localeRef } from "@/i18n";
import cmsApi from "@/composables/api_cms";
import { pickTranslation } from "@/utils/cms_locale";
import type { FaqItem, FaqResponse } from "@/types/faq";

// Модульное состояние живёт до процесса сервера и работает как кэш CMS.
// In-flight промис разделяется между параллельными запросами, чтобы
// конкурентный рендер не получил пустые данные.
const rawItems = ref<FaqItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

let translationsSupported = true;
let inflight: Promise<void> | null = null;

function localize(item: FaqItem, locale: string): FaqItem {
  return {
    ...item,
    title: pickTranslation(item.translations, locale, "title") ?? item.title,
    answer:
      pickTranslation(item.translations, locale, "answer") ?? item.answer,
  };
}

async function doFetch(): Promise<void> {
  error.value = null;

  try {
    let response = translationsSupported
      ? await cmsApi.get<FaqResponse>("/items/faq?fields=*,translations.*")
      : null;

    if (response && response.status !== 200) {
      translationsSupported = false;
      response = null;
    }

    if (!response) {
      response = await cmsApi.get<FaqResponse>("/items/faq");
    }

    if (response.status === 200 && response.data) {
      rawItems.value = response.data.data;
    } else {
      error.value = "Failed to fetch FAQ data";
    }
  } catch (err) {
    error.value = "Error fetching FAQ data";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

export const useFaq = () => {
  const locale = localeRef();

  const fetchFaq = (): Promise<void> => {
    if (rawItems.value.length > 0) return Promise.resolve();
    if (!inflight) {
      isLoading.value = true;
      inflight = doFetch().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  };

  const faqItems = computed<FaqItem[]>(() =>
    rawItems.value.map((item) => localize(item, locale.value)),
  );

  return {
    faqItems,
    isLoading,
    error,
    fetchFaq,
  };
};

// Сериализация кэша через payload Nuxt: сервер отдаёт сырые данные в HTML,
// клиент гидратирует модульное состояние без повторного запроса к CMS.
export function getRawFaqItems(): FaqItem[] {
  return rawItems.value;
}

export function hydrateFaqItems(items: FaqItem[]): void {
  if (rawItems.value.length === 0 && items.length > 0) {
    rawItems.value = items;
  }
}
