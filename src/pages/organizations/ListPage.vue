<template>
  <div class="max-w-5xl mx-auto">
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6"
    >
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800">
        Мои организации
      </h1>
      <button
        @click="showCreateModal = true"
        class="px-4 py-3 sm:py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium touch-target self-start sm:self-auto"
      >
        + Создать организацию
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin text-3xl mb-2">⚡</div>
      <p class="text-gray-500">Загрузка...</p>
    </div>

    <!-- Пусто -->
    <div
      v-else-if="organizations.length === 0"
      class="text-center py-12 bg-gray-50 rounded-xl"
    >
      <p class="text-gray-500 text-base mb-4">У вас пока нет организаций</p>
      <button
        @click="showCreateModal = true"
        class="px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 touch-target"
      >
        Создать первую организацию
      </button>
    </div>

    <!-- Список -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      <div
        v-for="org in organizations"
        :key="org.id"
        class="bg-white border rounded-xl p-4 sm:p-5 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer touch-target"
        @click="router.push(route.organizationDetails(org.id))"
      >
        <h3 class="text-lg font-semibold mb-1 truncate">{{ org.name }}</h3>
        <p class="text-xs text-gray-400 mb-3 font-mono truncate">
          {{ org.id }}
        </p>
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-400">
            {{ formatDate(org.createdAt) }}
          </span>
          <span class="text-blue-500 text-sm font-medium">Открыть →</span>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания организации -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        @click.self="showCreateModal = false"
      >
        <div
          class="bg-white rounded-t-xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        >
          <h3 class="text-lg font-semibold mb-4">Создать организацию</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Название организации
              </label>
              <input
                v-model="newOrgName"
                type="text"
                placeholder="Моя организация"
                class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
                @keyup.enter="createOrg"
              />
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              @click="showCreateModal = false"
              class="flex-1 px-4 py-3 text-gray-600 border rounded-lg hover:bg-gray-50 touch-target"
            >
              Отмена
            </button>
            <button
              @click="createOrg"
              :disabled="!newOrgName.trim()"
              class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 touch-target font-medium"
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { route } from "@/constants/routes";
import {
  getUsersOrganizations,
  createOrganization,
  type Organization,
} from "@/data";

const router = useRouter();
const organizations = ref<Organization[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newOrgName = ref("");

const loadOrganizations = async () => {
  try {
    organizations.value = await getUsersOrganizations();
  } catch (error) {
    console.error("Failed to load organizations:", error);
  } finally {
    loading.value = false;
  }
};

const createOrg = async () => {
  if (!newOrgName.value.trim()) return;
  try {
    const org = await createOrganization(newOrgName.value);
    organizations.value.unshift(org);
    showCreateModal.value = false;
    newOrgName.value = "";
  } catch (error) {
    console.error("Failed to create organization:", error);
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU");
};

onMounted(loadOrganizations);
</script>
