<template>
  <div class="relative">
    <select
      v-model="model"
      v-bind="$attrs"
      class="ship-field appearance-none pr-10 cursor-pointer"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <svg
      class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
// TODO: Disable inheritAttrs and forward attributes only to the select so IDs and bubbling listeners are not duplicated on the wrapper.
defineProps<{
  options: Array<{ value: string; label: string }>;
}>();

const model = defineModel<string>();
</script>
