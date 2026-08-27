<template>
  <input
    v-model="model"
    class="ship-field"
  >
</template>

<script setup lang="ts">
const model = defineModel<string | number>();
</script>
