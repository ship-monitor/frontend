<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  getOrganizationById,
  getOrganizationMembers,
  type Organization,
  type Member,
} from "@/data";

const route = useRoute();
const organization = ref<Organization | null>(null);
const members = ref<Member[]>([]);
const loading = ref(true);
const error = ref("");

const loadData = async () => {
  try {
    const orgId = route.params.id as string;
    const [org, membersList] = await Promise.all([
      getOrganizationById(orgId),
      getOrganizationMembers(orgId),
    ]);
    organization.value = org;
    members.value = membersList;
  } catch (e) {
    error.value = "Ошибка загрузки данных организации";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin text-4xl">⚙️</div>
      <p class="mt-2 text-gray-600">Загрузка...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <template v-else-if="organization">
      <!-- Заголовок организации -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-3xl font-bold text-gray-800">{{ organization.name }}</h1>
        <div class="mt-4 text-sm text-gray-500">
          <p>ID: {{ organization.id }}</p>
          <p>Создана: {{ new Date(organization.createdAt).toLocaleDateString() }}</p>
        </div>
      </div>

      <!-- Список участников -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          Участники ({{ members.length }})
        </h2>

        <div v-if="members.length === 0" class="text-gray-500 text-center py-8">
          Нет участников
        </div>

        <div v-else class="space-y-3">
          <div v-for="member in members" :key="member.userId"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-4">
              <!-- Аватар -->
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ member.name?.charAt(0) || member.email?.charAt(0) || "?" }}
              </div>

              <!-- Информация -->
              <div>
                <p class="font-medium text-gray-800">
                  {{ member.name || "Без имени" }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ member.email || "Email не указан" }}
                </p>
              </div>
            </div>

            <!-- ID пользователя -->
            <div class="text-xs text-gray-400 font-mono">
              {{ member.userId?.substring(0, 8) || '...' }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
