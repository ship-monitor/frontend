import { ref } from "vue";
import cmsApi from "@/composables/api_cms";
import type { LeadRequest } from "@/types/lead";

const isLoading = ref(false);
const error = ref<string | null>(null);

export const useLeads = () => {
  /**
   * Отправляет лид. Возвращает null при успехе или строку с причиной ошибки.
   */
  const createLead = async (leadData: LeadRequest): Promise<string | null> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await cmsApi.post("/items/leads", leadData);
      if (response.status === 200 || response.status === 201) {
        return null;
      }
      error.value = `Не удалось отправить заявку (код ${response.status}). Попробуйте ещё раз или напишите нам.`;
      return error.value;
    } catch {
      error.value =
        "Не удалось отправить заявку: проверьте соединение и попробуйте ещё раз.";
      return error.value;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    createLead,
  };
};
