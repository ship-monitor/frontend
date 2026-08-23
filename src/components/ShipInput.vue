<template>
  <input v-model="model" v-bind="$attrs" class="ship-field" />
</template>

<script setup lang="ts">
// TODO: Consolidate this duplicate abstraction with ShipTextbox and give defineModel an explicit supported value type.
const model = defineModel();
</script>
