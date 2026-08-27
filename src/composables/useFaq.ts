import { ref } from "vue";
import cmsApi from "@/composables/api_cms";
import type { FaqItem, FaqResponse } from "@/types/faq";

const faqItems = ref<FaqItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export const useFaq = () => {
  const fetchFaq = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await cmsApi.get<FaqResponse>("/items/faq");

      if (response.status === 200 && response.data) {
        faqItems.value = response.data.data;
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

  return {
    faqItems,
    isLoading,
    error,
    fetchFaq,
  };
};