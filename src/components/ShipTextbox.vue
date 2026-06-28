<template>
  <div>
    <input
      v-model="model"
      v-bind="$attrs"
      class="px-4 py-3 w-full focus:ring-blue-500 outline-none border rounded-lg text-base focus:ring-2"
    />
  </div>
</template>

<script setup lang="ts">
const model = defineModel();
</script>
