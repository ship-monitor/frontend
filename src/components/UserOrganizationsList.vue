<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-ink-900 tracking-tight">Мои организации</h2>
      <router-link
        :to="route.organizations()"
        class="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1"
      >
        Все организации
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </router-link>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="ship-card p-4">
        <div class="skeleton h-5 w-32 mb-2"></div>
        <div class="skeleton h-4 w-24"></div>
      </div>
    </div>

    <div
      v-else-if="organizations.length === 0"
      class="ship-card p-8 text-center"
    >
      <p class="text-ink-500 mb-4">У вас пока нет организаций</p>
      <router-link
        :to="route.organizations()"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
      >
        Создать организацию
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="org in organizations.slice(0, 6)"
        :key="org.id"
        class="ship-card ship-card-hover p-4 cursor-pointer"
        @click="$router.push(route.organizationDetails(org.id))"
      >
        <h3 class="font-semibold text-ink-900 mb-1 truncate">{{ org.name }}</h3>
        <p class="text-sm text-ink-500">
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
  loading.value = false;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU");
};

onMounted(loadOrganizations);
</script>
