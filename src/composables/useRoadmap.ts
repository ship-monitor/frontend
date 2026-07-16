import { ref, type Ref } from "vue";
import cmsApi from "@/composables/api_cms";
import type { RoadmapItem, RoadmapResponse } from "@/types/roadmap";

const roadmapItems = ref<RoadmapItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export const useRoadmap = () => {
  const fetchRoadmap = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await cmsApi.get<RoadmapResponse>("/items/roadmap_items");

      if (response.status === 200 && response.data) {
        roadmapItems.value = response.data.data.sort((a, b) => {
          const dateA = new Date(a.stage_date).getTime();
          const dateB = new Date(b.stage_date).getTime();
          return dateA - dateB;
        });
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

  return {
    roadmapItems,
    isLoading,
    error,
    fetchRoadmap,
  };
};
