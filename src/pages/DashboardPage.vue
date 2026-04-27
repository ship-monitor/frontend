<template>
  <div class="p-8 max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Панель управления</h1>
    <UserOrganizationsList />
  </div>
</template>

<script setup lang="ts">
import UserOrganizationsList from "@/components/UserOrganizationsList.vue";
</script>
