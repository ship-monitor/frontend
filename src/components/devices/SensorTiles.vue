<template>
  <ul class="flex flex-wrap gap-2">
    <li
      v-for="sensor in sensors"
      :key="sensor.id"
      class="w-[calc(50%-4px)] sm:w-[calc(33.333%-5.34px)] lg:w-[calc(20%-6.4px)]"
    >
      <SensorCard
        :sensor="sensor"
        stacked
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SensorWithTemperature } from "@/data";
import SensorCard from "@/components/devices/SensorCard.vue";

defineProps<{ sensors: SensorWithTemperature[] }>();
</script>
