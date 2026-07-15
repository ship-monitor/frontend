<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-semibold">Мои организации</h2>
      <router-link
        :to="route.organizations()"
        class="text-blue-500 hover:text-blue-700"
      >
        Все организации →
      </router-link>
    </div>

    <div v-if="loading" class="text-gray-500">Загрузка...</div>

    <div
      v-else-if="organizations.length === 0"
      class="bg-gray-50 rounded p-6 text-center"
    >
      <p class="text-gray-500 mb-4">У вас пока нет организаций</p>
      <router-link
        :to="route.organizations()"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
      >
        Создать организацию
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="org in organizations.slice(0, 6)"
        :key="org.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="$router.push(route.organizationDetails(org.id))"
      >
        <h3 class="font-semibold mb-1">{{ org.name }}</h3>
        <p class="text-sm text-gray-500">
          Создано: {{ formatDate(org.createdAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { route } from "@/constants/routes";
import { getUsersOrganizations, type Organization } from "@/data";

const organizations = ref<Organization[]>([]);
const loading = ref(true);

const loadOrganizations = async () => {
  organizations.value = (await getUsersOrganizations())
    .inspectErr((err) => console.error("Failed load organizations: %s", err))
    .unwrapOr([]);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU");
};

onMounted(loadOrganizations);
</script>
