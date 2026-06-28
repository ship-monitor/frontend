<template>
  <button
    v-bind="$attrs"
    :class="[
      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 touch-target active:scale-[0.98] cursor-pointer',
      variant === 'primary'
        ? 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
        : '',
      variant === 'success'
        ? 'bg-green-500 text-white hover:bg-green-600 disabled:opacity-50'
        : '',
      variant === 'secondary' ? 'border text-gray-600 hover:bg-gray-50' : '',
      $attrs.class,
    ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: "primary" | "success" | "secondary";
}>();
</script>
