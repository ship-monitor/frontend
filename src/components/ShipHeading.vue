<script setup lang="ts">
defineProps<{
  heading: string;
  headingAlt: string;
  description: string;
}>();
</script>
<template>
  <hgroup
    class="mb-12 grid gap-6 md:mb-16 md:grid-cols-[0.8fr_1fr] md:items-end"
  >
    <div>
      <p
        class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-electric-blue"
      >
        {{ headingAlt }}
      </p>
      <h2
        class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl"
      >
        {{ heading }}
      </h2>
    </div>
    <p
      class="max-w-xl text-base leading-7 text-moonless-night/50 md:justify-self-end md:text-lg"
    >
      {{ description }}
    </p>
  </hgroup>
</template>
