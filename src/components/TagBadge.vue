<template>
  <transition name="tag-fade" mode="out-in">
    <span class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-1.5">
      {{ tag }}
      <button
        type="button"
        @click="$emit('remove')"
        class="text-blue-400 hover:text-red-500 transition-colors ml-0.5"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
  </transition>
</template>

<script setup lang="ts">
defineProps<{ tag: string }>();
defineEmits<{ remove: [] }>();
</script>

<style scoped>
.tag-fade-enter-active,
.tag-fade-leave-active {
  transition: all 0.2s ease;
}
.tag-fade-enter-from,
.tag-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.tag-fade-enter-to,
.tag-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>