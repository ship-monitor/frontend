<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Панель управления</h1>

    <div v-if="loading" class="text-gray-500">Загрузка данных сессии...</div>

    <div v-else-if="session" class="bg-white p-6 rounded-lg shadow-md border">
      <h2 class="text-xl font-semibold mb-3">Информация о сессии</h2>

      <div class="space-y-2">
        <div v-if="session">
          <p>ID: {{ session.id }}</p>
        </div>
        <p><strong>User ID:</strong> {{ session.userId }}</p>
        <p>
          <strong>Статус:</strong>
          <span
            :class="session.userBlocked ? 'text-red-500' : 'text-green-500'"
          >
            {{ session.userBlocked ? "Заблокирован" : "Активен" }}
          </span>
        </p>
      </div>

      <div class="mt-4">
        <p class="font-bold mb-2">Ваши права:</p>
        <div class="flex gap-2">
          <span
            v-for="perm in session.permissions"
            :key="perm"
            class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
          >
            {{ perm }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../api"; // Импортируем наш настроенный axios

const loading = ref(true);

interface Session {
  id: string;
  userId: string;
  userBlocked: boolean;
  permissions: string[];
}

// Теперь при создании ref укажи этот тип (или null)
const session = ref<Session | null>(null);

onMounted(async () => {
  try {
    const response = await api.get("/api/sessions/current");
    session.value = response.data.session;
  } catch (error) {
    console.error("Не удалось загрузить сессию:", error);
  } finally {
    loading.value = false;
  }
});
</script>
