import { ref, type Ref } from "vue";
import cmsApi from "@/composables/api_cms";
import type { Lead, LeadRequest, LeadsResponse } from "@/types/lead";

const leads = ref<Lead[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export const useLeads = () => {
  const fetchLeads = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await cmsApi.get<LeadsResponse>("/items/leads");

      if (response.status === 200 && response.data) {
        leads.value = response.data.data;
      } else {
        error.value = "Failed to fetch leads data";
      }
    } catch (err) {
      error.value = "Error fetching leads data";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const createLead = async (leadData: LeadRequest): Promise<boolean> => {
    try {
      const response = await cmsApi.post("/items/leads", leadData);

      if (response.status === 200 || response.status === 201) {
        await fetchLeads();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error creating lead:", err);
      return false;
    }
  };

  return {
    leads,
    isLoading,
    error,
    fetchLeads,
    createLead,
  };
};
