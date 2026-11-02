<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    heading: string;
    headingAlt?: string;
    description?: string;
    level?: 1 | 2 | 3;
  }>(),
  { headingAlt: "", description: "", level: 2 }
);

const headingTag = computed(() => `h${props.level}`);
</script>
<template>
  <div
    class="mb-12 grid gap-6 md:mb-16 md:grid-cols-[0.8fr_1fr] md:items-end"
  >
    <div>
      <p
        v-if="headingAlt"
        class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-electric-blue"
      >
        {{ headingAlt }}
      </p>
      <component
        :is="headingTag"
        class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl"
      >
        {{ heading }}
      </component>
    </div>
    <p
      v-if="description"
      class="max-w-xl text-base leading-7 text-moonless-night/50 md:justify-self-end md:text-lg"
    >
      {{ description }}
    </p>
  </div>
</template>
