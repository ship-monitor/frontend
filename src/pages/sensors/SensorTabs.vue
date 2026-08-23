<template>
  <!-- TODO(a11y): Add tablist/tab semantics, aria-selected/panel linkage, and keyboard arrow navigation. -->
  <div class="border-b border-ink-200 mb-6 overflow-x-auto">
    <div class="flex gap-2 sm:gap-4 min-w-max">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="$emit('select', tab.value)"
        :class="[
          'px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap touch-target',
          modelValue === tab.value
            ? 'border-brand-500 text-brand-600'
            : 'border-transparent text-ink-500 hover:text-ink-700',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  tabs: Array<{ value: string; label: string }>;
}>();

defineEmits<{
  select: [value: string];
}>();
</script>
