<template>
  <div>
    <input v-model="model" v-bind="$attrs" class="ship-field" />
  </div>
</template>

<script setup lang="ts">
// TODO: Disable inheritAttrs and forward attributes only to the input; current fallthrough duplicates IDs/listeners on the wrapper and native control.
// TODO: Consolidate this with ShipInput and give the canonical model an explicit value type.
const model = defineModel();
</script>
