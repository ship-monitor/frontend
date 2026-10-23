import { computed, ref } from "vue";

import { currentLocale } from "@/i18n";
import cmsApi from "@/composables/api_cms";
import { pickTranslation } from "@/utils/cms_locale";
import type { FaqItem, FaqResponse } from "@/types/faq";

const rawItems = ref<FaqItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

let translationsSupported = true;

function localize(item: FaqItem, locale: string): FaqItem {
  return {
    ...item,
    title: pickTranslation(item.translations, locale, "title") ?? item.title,
    answer:
      pickTranslation(item.translations, locale, "answer") ?? item.answer,
  };
}

export const useFaq = () => {
  const fetchFaq = async (): Promise<void> => {
    if (isLoading.value || rawItems.value.length > 0) return;
    isLoading.value = true;
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
  };

  const faqItems = computed<FaqItem[]>(() =>
    rawItems.value.map((item) => localize(item, currentLocale())),
  );

  return {
    faqItems,
    isLoading,
    error,
    fetchFaq,
  };
};

export function getFaqItems(locale: string): FaqItem[] {
  return rawItems.value.map((item) => localize(item, locale));
}
