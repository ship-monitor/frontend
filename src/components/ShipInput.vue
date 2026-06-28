<template>
  <input
    v-model="model"
    v-bind="$attrs"
    :class="[
      'px-4 py-3 border rounded-lg text-base outline-none transition-all duration-150 focus:ring-2',
      $attrs.class
    ]"
  />
</template>

<script setup lang="ts">
const model = defineModel();
</script>