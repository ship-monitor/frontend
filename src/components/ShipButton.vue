<template>
  <!-- TODO: Default the shared button to type="button" while allowing callers to explicitly request type="submit". -->
  <button
    v-bind="$attrs"
    :class="[
      'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 touch-target active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
      variantClasses,
      $attrs.class,
    ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "success" | "danger" | "ghost" | "secondary";
  }>(),
  { variant: "primary" }
);

const variantClasses = computed(() => {
  switch (props.variant) {
    case "primary":
      return "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md";
    case "success":
      return "bg-brand-500 text-white shadow-sm hover:bg-brand-600 hover:shadow-md";
    case "danger":
      return "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md";
    case "ghost":
      return "text-ink-600 hover:bg-ink-100";
    case "secondary":
      return "bg-white text-ink-700 border border-ink-200 hover:border-ink-300 hover:bg-ink-50 shadow-sm";
    default:
      return "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md";
  }
});
</script>
