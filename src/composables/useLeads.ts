import { ref } from "vue";
import cmsApi from "@/composables/api_cms";
import type { LeadRequest } from "@/types/lead";

const isLoading = ref(false);
const error = ref<string | null>(null);

export const useLeads = () => {
  // TODO: Update the exposed loading/error refs (or remove them) and return an actionable failure reason instead of only false.
  const createLead = async (leadData: LeadRequest): Promise<boolean> => {
    try {
      const response = await cmsApi.post("/items/leads", leadData);

      if (response.status === 200 || response.status === 201) {
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error creating lead:", err);
      return false;
    }
  };

  return {
    isLoading,
    error,
    createLead,
  };
};
