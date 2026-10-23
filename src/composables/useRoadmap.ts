import { computed, ref } from "vue";

import { currentLocale } from "@/i18n";
import cmsApi from "@/composables/api_cms";
import { pickTranslation } from "@/utils/cms_locale";
import type { RoadmapItem, RoadmapResponse } from "@/types/roadmap";

const rawItems = ref<RoadmapItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

let translationsSupported = true;

const sortItems = (items: RoadmapItem[]): RoadmapItem[] =>
  items.sort((a, b) => {
    const dateA = new Date(a.stage_date).getTime();
    const dateB = new Date(b.stage_date).getTime();
    return dateA - dateB;
  });

function localize(item: RoadmapItem, locale: string): RoadmapItem {
  return {
    ...item,
    stage_name:
      pickTranslation(item.translations, locale, "stage_name") ??
      item.stage_name,
    stage_description:
      pickTranslation(item.translations, locale, "stage_description") ??
      item.stage_description,
  };
}

export const useRoadmap = () => {
  const fetchRoadmap = async (): Promise<void> => {
    if (isLoading.value || rawItems.value.length > 0) return;
    isLoading.value = true;
    error.value = null;

    try {
      let response = translationsSupported
        ? await cmsApi.get<RoadmapResponse>(
            "/items/roadmap_items?fields=*,translations.*",
          )
        : null;

      if (response && response.status !== 200) {
        translationsSupported = false;
        response = null;
      }

      if (!response) {
        response = await cmsApi.get<RoadmapResponse>("/items/roadmap_items");
      }

      if (response.status === 200 && response.data) {
        rawItems.value = sortItems(response.data.data);
      } else {
        error.value = "Failed to fetch roadmap data";
      }
    } catch (err) {
      error.value = "Error fetching roadmap data";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const roadmapItems = computed<RoadmapItem[]>(() =>
    rawItems.value.map((item) => localize(item, currentLocale())),
  );

  return {
    roadmapItems,
    isLoading,
    error,
    fetchRoadmap,
  };
};
