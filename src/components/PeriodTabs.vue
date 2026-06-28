<template>
  <div class="flex flex-wrap gap-2">
    <transition-group name="period-tabs" tag="div" class="flex flex-wrap gap-2">
      <ShipButton
        v-for="period in periods"
        :key="period.value"
        variant="secondary"
        :class="selectedPeriod === period.value ? 'bg-blue-500 text-white' : ''"
        @click="$emit('select', period.value)"
      >
        {{ period.label }}
      </ShipButton>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import ShipButton from "@/components/ShipButton.vue";

defineProps<{
  selectedPeriod: string;
  periods: Array<{ label: string; value: string; ms: number }>;
}>();

defineEmits<{ select: [value: string] }>();
</script>

<style scoped>
.period-tabs-enter-active,
.period-tabs-leave-active {
  transition: all 0.2s ease;
}
.period-tabs-enter-from,
.period-tabs-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
