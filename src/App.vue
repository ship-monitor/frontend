<template>
  <div class="flex flex-row min-h-svh">
    <aside
      v-if="$route.meta.hideNav !== true"
      class="w-64 bg-[#1E293B] text-white"
    >
      Sidebar
    </aside>
    <div class="flex flex-col grow">
      <TheHeader v-if="$route.meta.hideNav !== true" />
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import TheHeader from "./components/TheHeader.vue";
</script>
