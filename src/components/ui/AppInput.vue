<template>
  <input
    v-model="model"
    class="app-field"
  >
</template>

<script setup lang="ts">
const model = defineModel<string | number>();
</script>
