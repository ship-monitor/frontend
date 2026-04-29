<template>
  <div class="flex flex-row min-h-svh">
    <!-- Sidebar -->
    <aside v-if="$route.meta.hideNav !== true" class="w-64 bg-[#1E293B] text-white flex flex-col">
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-xl font-bold">Меню</h2>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <router-link to="/" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700"
          active-class="bg-gray-700">
          📊 Дашборд
        </router-link>
        <router-link to="/organizations" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700"
          active-class="bg-gray-700">
          🏢 Организации
        </router-link>
        <router-link to="/invitations" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700"
          active-class="bg-gray-700">
          ✉️ Приглашения
        </router-link>
        <router-link to="/profile" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700"
          active-class="bg-gray-700">
          👤 Профиль
        </router-link>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex flex-col grow">
      <TheHeader v-if="$route.meta.hideNav !== true" />
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import TheHeader from "./components/TheHeader.vue";
</script>