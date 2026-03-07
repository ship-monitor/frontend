<template>
  <div>
    <input
      v-model="model" 
      v-bind="$attrs"
      class="border rounded px-2 py-1 w-full"
    />
  </div>
</template>

<script setup>
const model = defineModel(); // Это свяжет v-model из auth.vue с этим инпутом
</script>
