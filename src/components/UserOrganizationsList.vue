<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-4">Мои организации</h2>

    <div v-if="loading" class="text-center py-4">
      <p class="text-gray-500">Загрузка...</p>
    </div>

    <ul v-else-if="organizations && organizations.length" class="space-y-2">
      <li v-for="organization in organizations" :key="organization.id" class="p-3 bg-gray-50 rounded hover:bg-gray-100">
        <router-link :to="'/organizations'" class="text-blue-600 hover:text-blue-800">
          {{ organization.name }}
        </router-link>
      </li>
    </ul>

    <p v-else class="text-gray-500">
      Вы не состоите в организации.
      <router-link to="/organizations" class="text-blue-600 hover:underline">
        Создать организацию?
      </router-link>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { getUsersOrganizations, type Organization } from "@/data";

const organizations = ref<Organization[] | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const orgs = await getUsersOrganizations();
    organizations.value = orgs;
  } catch (error) {
    console.error("Ошибка загрузки организаций:", error);
    organizations.value = [];
  } finally {
    loading.value = false;
  }
});
</script>