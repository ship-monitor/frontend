<template>
  <div class="max-w-lg mx-auto p-4 sm:p-6">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Настройки</h1>

    <!-- Автообновление -->
    <div class="bg-white rounded-xl border p-5 sm:p-6 mb-6">
      <h2 class="text-base font-semibold text-gray-800 mb-4">
        Автообновление дашборда
      </h2>
      <p class="text-xs text-gray-500 mb-4">
        Статусы устройств будут автоматически проверяться через указанный
        интервал.
      </p>

      <div class="space-y-3">
        <label
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg touch-target cursor-pointer"
        >
          <div>
            <p class="text-sm font-medium text-gray-800">Автообновление</p>
            <p class="text-xs text-gray-500">
              Периодически проверять статус устройств
            </p>
          </div>
          <input
            v-model="settings.autoRefresh"
            type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 shrink-0"
            @change="save"
          />
        </label>

        <div v-if="settings.autoRefresh">
          <label class="block text-xs text-gray-500 mb-1.5"
            >Интервал обновления</label
          >
          <div class="relative">
            <select
              v-model="settings.interval"
              @change="save"
              class="w-full px-4 py-3 border rounded-lg text-base appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option :value="10000">10 секунд</option>
              <option :value="30000">30 секунд</option>
              <option :value="60000">1 минута</option>
              <option :value="300000">5 минут</option>
            </select>
            <svg
              class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Примечание -->
    <div class="bg-gray-50 rounded-xl border p-4">
      <p class="text-xs text-gray-500">
        Настройки email-уведомлений, изменение email и пароля находятся в
        разделе
        <router-link
          :to="ROUTES.PROFILE"
          class="text-blue-500 hover:text-blue-700"
          >Профиль</router-link
        >.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ROUTES } from "@/constants/routes";

const settings = ref({
  autoRefresh: true,
  interval: 30000,
});

function save() {
  localStorage.setItem("app-settings", JSON.stringify(settings.value));
}

onMounted(() => {
  const saved = localStorage.getItem("app-settings");
  if (saved) {
    try {
      settings.value = JSON.parse(saved);
    } catch {
      /* */
    }
  }
});
</script>
