<template>
  <span
    class="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm flex items-center gap-1.5 ring-1 ring-inset ring-brand-200"
  >
    {{ tag }}
    <button
      type="button"
      class="text-brand-400 hover:text-red-500 transition-colors ml-0.5"
      :aria-label="`Удалить тег ${tag}`"
      @click="$emit('remove')"
    >
      <svg
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
defineProps<{ tag: string }>();
defineEmits<{ remove: [] }>();
</script>
