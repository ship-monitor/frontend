<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Настройки</h1>
    
    <div class="bg-white rounded-lg border p-6 space-y-6">
      <div>
        <h2 class="text-lg font-semibold mb-4">Уведомления</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="settings.emailNotifications" class="rounded" />
            <span>Email уведомления о приглашениях</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="settings.browserNotifications" class="rounded" />
            <span>Уведомления в браузере</span>
          </label>
        </div>
      </div>
      
      <div class="border-t pt-6">
        <h2 class="text-lg font-semibold mb-4">Интерфейс</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="settings.compactView" class="rounded" />
            <span>Компактный вид</span>
          </label>
        </div>
      </div>
      
      <div class="border-t pt-6">
        <button 
          @click="saveSettings"
          class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Сохранить настройки
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const settings = ref({
  emailNotifications: true,
  browserNotifications: false,
  compactView: false,
});

const saveSettings = () => {
  localStorage.setItem('user-settings', JSON.stringify(settings.value));
  alert('Настройки сохранены');
};

onMounted(() => {
  const saved = localStorage.getItem('user-settings');
  if (saved) {
    try {
      settings.value = JSON.parse(saved);
    } catch (e) {
      // Используем значения по умолчанию
    }
  }
});
</script>
