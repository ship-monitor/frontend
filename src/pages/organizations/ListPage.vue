<template>
  <div class="p-8 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Мои организации</h1>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        + Создать организацию
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Загрузка...</p>
    </div>

    <div v-else-if="organizations.length === 0" class="text-center py-12 bg-gray-50 rounded">
      <p class="text-gray-500">У вас пока нет организаций</p>
      <button
        @click="showCreateModal = true"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Создать первую организацию
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="org in organizations"
        :key="org.id"
        class="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="router.push(`/organizations/${org.id}`)"
      >
        <h3 class="text-xl font-semibold mb-2">{{ org.name }}</h3>
        <p class="text-sm text-gray-500 mb-4">ID: {{ org.id }}</p>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-400">
            Создано: {{ formatDate(org.createdAt) }}
          </span>
          <router-link
            :to="`/organizations/${org.id}`"
            class="text-blue-500 hover:text-blue-700 text-sm"
            @click.stop
          >
            Открыть →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания организации -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Создать организацию</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Название организации
            </label>
            <input
              v-model="newOrgName"
              type="text"
              placeholder="Моя организация"
              class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              @keyup.enter="createOrg"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            @click="createOrg"
            :disabled="!newOrgName.trim()"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUsersOrganizations, createOrganization, type Organization } from '@/data';

const router = useRouter();

const organizations = ref<Organization[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newOrgName = ref('');

const loadOrganizations = async () => {
  try {
    organizations.value = await getUsersOrganizations();
  } catch (error) {
    console.error('Failed to load organizations:', error);
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
    newOrgName.value = '';
  } catch (error) {
    console.error('Failed to create organization:', error);
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ru-RU');
};

onMounted(loadOrganizations);
</script>
