<template>
  <div class="p-8 max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Панель управления</h1>

    <!-- Блок текущей сессии -->
    <div v-if="session" class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
      <h2 class="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
        <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        Текущая сессия
      </h2>
      <p class="text-sm text-blue-700">ID: {{ session.id }}</p>
      <div class="mt-3 flex gap-2">
        <span v-for="p in session.permissions" :key="p" class="px-2 py-1 bg-white border border-blue-300 rounded text-xs text-blue-600 font-mono">
          {{ p }}
        </span>
      </div>
    </div>

    <!-- Список всех сессий -->
    <div class="bg-white shadow-sm border rounded-xl overflow-hidden">
      <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 class="font-bold text-gray-700">Активные сессии</h2>
        <button @click="fetchData" class="text-sm text-blue-600 hover:underline">Обновить</button>
      </div>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-xs uppercase text-gray-400 border-b">
            <th class="px-6 py-3 font-medium">ID Сессии</th>
            <th class="px-6 py-3 font-medium text-right">Действие</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="s in sessionsList" :key="s.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm font-mono text-gray-600">
              {{ s.id }} 
              <span v-if="s.id === session?.id" class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">это вы</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button 
                @click="deleteSession(s.id)"
                :disabled="s.id === session?.id"
                class="text-red-500 hover:text-red-700 disabled:opacity-30 text-sm font-medium"
              >
                Завершить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';

const session = ref<any>(null);
const sessionsList = ref<any[]>([]);
const loading = ref(true);

const fetchData = async () => {
  loading.value = true;
  try {
    // Тянем текущую сессию
    const resCurr = await api.get('/api/sessions/current');
    session.value = resCurr.data.session;

    // Тянем все сессии
    const resAll = await api.get('/api/sessions/');
    sessionsList.value = resAll.data.sessions;
  } catch (e) {
    console.error('Ошибка загрузки данных:', e);
  } finally {
    loading.value = false;
  }
};

const deleteSession = async (id: string) => {
  if (!confirm('Завершить эту сессию?')) return;
  try {
    await api.delete(`/api/sessions/${id}`);
    // Обновляем список после удаления
    sessionsList.value = sessionsList.value.filter(s => s.id !== id);
  } catch (e) {
    alert('Не удалось удалить сессию');
  }
};

onMounted(fetchData);
</script>
