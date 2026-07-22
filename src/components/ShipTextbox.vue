<template>
  <div>
    <input
      v-model="model"
      v-bind="$attrs"
      class="ship-field"
    />
  </div>
</template>

<script setup lang="ts">
const model = defineModel();
</script>
