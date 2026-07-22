<template>
  <input
    v-model="model"
    v-bind="$attrs"
    class="ship-field"
  />
</template>

<script setup lang="ts">
const model = defineModel();
</script>
