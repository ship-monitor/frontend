<template>
  <div
    role="group"
    :aria-label="label"
    class="flex flex-wrap gap-2"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="rounded-full border px-4 py-2 font-medium transition-colors touch-target active:translate-y-px cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      :class="
        model === option.value
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
      "
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
defineProps<{
  options: Array<{ value: T; label: string }>;
  label: string;
}>();

const model = defineModel<T>();
</script>
