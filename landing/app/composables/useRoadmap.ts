import { computed, ref } from "vue";

import { localeRef } from "@/i18n";
import cmsApi from "@/composables/api_cms";
import { pickTranslation } from "@/utils/cms_locale";
import type { RoadmapItem, RoadmapResponse } from "@/types/roadmap";

// Модульное состояние живёт до процесса сервера и работает как кэш CMS.
// In-flight промис разделяется между параллельными запросами, чтобы
// конкурентный рендер не получил пустые данные.
const rawItems = ref<RoadmapItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

let translationsSupported = true;
let inflight: Promise<void> | null = null;

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

async function doFetch(): Promise<void> {
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
}

export const useRoadmap = () => {
  const locale = localeRef();

  const fetchRoadmap = (): Promise<void> => {
    if (rawItems.value.length > 0) return Promise.resolve();
    if (!inflight) {
      isLoading.value = true;
      inflight = doFetch().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  };

  const roadmapItems = computed<RoadmapItem[]>(() =>
    rawItems.value.map((item) => localize(item, locale.value)),
  );

  return {
    roadmapItems,
    isLoading,
    error,
    fetchRoadmap,
  };
};

// Сериализация кэша через payload Nuxt: сервер отдаёт сырые данные в HTML,
// клиент гидратирует модульное состояние без повторного запроса к CMS.
export function getRawRoadmapItems(): RoadmapItem[] {
  return rawItems.value;
}

export function hydrateRoadmapItems(items: RoadmapItem[]): void {
  if (rawItems.value.length === 0 && items.length > 0) {
    rawItems.value = items;
  }
}
