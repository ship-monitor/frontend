<template>
  <div class="max-w-5xl mx-auto space-y-5 animate-fade-in">
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          Мои организации
        </h1>
        <p class="text-sm text-ink-500 mt-0.5">Управление организациями и устройствами</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all font-semibold text-sm touch-target self-start sm:self-auto"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Создать
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div v-for="i in 3" :key="i" class="ship-card p-5">
        <div class="skeleton h-5 w-32 mb-2"></div>
        <div class="skeleton h-3 w-20 mb-4"></div>
        <div class="skeleton h-4 w-24"></div>
      </div>
    </div>

    <!-- Пусто -->
    <div
      v-else-if="organizations.length === 0"
      class="ship-card p-8 sm:p-12 text-center animate-scale-in"
    >
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
        <svg class="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <p class="text-lg font-semibold text-ink-900 mb-1">У вас пока нет организаций</p>
      <p class="text-sm text-ink-500 mb-5">Создайте первую организацию для добавления устройств</p>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
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
        class="ship-card ship-card-hover p-5 active:scale-[0.98] cursor-pointer touch-target"
        @click="router.push(route.organizationDetails(org.id))"
      >
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-base font-semibold text-ink-900 truncate">{{ org.name }}</h3>
            <p class="text-xs text-ink-400 font-mono truncate">{{ org.id }}</p>
          </div>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-ink-100">
          <span class="text-xs text-ink-400">{{ formatDate(org.createdAt) }}</span>
          <span class="text-brand-600 text-sm font-medium flex items-center gap-1">
            Открыть
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания организации -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCreateModal"
          class="fixed inset-0 bg-ink-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          @click.self="showCreateModal = false"
        >
          <div
            class="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <h3 class="text-lg font-bold text-ink-900 mb-4">Создать организацию</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-1.5">
                  Название организации
                </label>
                <input
                  v-model="newOrgName"
                  type="text"
                  placeholder="Моя организация"
                  class="ship-field"
                  @keyup.enter="createOrg"
                />
              </div>
            </div>

            <div class="mt-6 flex gap-3">
              <button
                @click="showCreateModal = false"
                class="flex-1 px-4 py-3 text-ink-600 border border-ink-200 rounded-xl hover:bg-ink-50 touch-target transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                @click="createOrg"
                :disabled="!newOrgName.trim()"
                class="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:pointer-events-none touch-target transition-colors font-semibold"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      </Transition>
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
    organizations.value = (await getUsersOrganizations()).unwrapOr([]);
  } catch (error) {
    console.error("Failed to load organizations:", error);
  } finally {
    loading.value = false;
  }
};

const createOrg = async () => {
  if (!newOrgName.value.trim()) return;
  const org = (await createOrganization(newOrgName.value))
    .inspectErr((err) => console.error("Failed create organization: %s", err))
    .unwrapOr(null);
  if (!org) {
    console.error("Organization create request failed");
    return;
  }
  organizations.value.unshift(org);
  showCreateModal.value = false;
  newOrgName.value = "";
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU");
};

onMounted(loadOrganizations);
</script>
