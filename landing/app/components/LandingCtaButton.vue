<template>
  <button
    :type="type"
    :disabled="disabled"
    class="cta-btn group inline-flex cursor-pointer items-center rounded-full bg-electric-blue font-semibold text-cotton select-none focus-visible:ring-2 focus-visible:ring-electric-blue/60 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
    :class="sizeClass"
  >
    <slot />
    <svg
      class="cta-arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    size?: "md" | "lg";
    disabled?: boolean;
  }>(),
  { type: "button", size: "md", disabled: false },
);

const sizeClass = computed(() =>
  props.size === "lg" ? "px-6 py-3 text-lg sm:text-xl" : "px-8 py-3.5",
);
</script>

<style scoped>
.cta-arrow {
  width: 1.1em;
  height: 1.1em;
  margin-left: 0.55em;
  transition: transform 0.2s ease;
}

.group:hover .cta-arrow {
  transform: translateX(0.18em);
}

.cta-btn:active {
  scale: 0.97;
}

@media (prefers-reduced-motion: reduce) {
  .cta-arrow {
    transition: none;
  }
}
</style>
