<template>
  <RouterLink
    :to="route.sensorDetails(sensor.deviceId, sensor.id)"
    class="py-3 flex items-center border-1 border-gray-300 rounded-2xl justify-between gap-3 -mx-2 px-2 transition-colors hover:bg-ink-50 active:scale-[0.98]"
    :aria-label="`Датчик ${sensor.displayName}`"
  >
    <p class="font-semibold text-ink-900 truncate min-w-0">
      {{ sensor.displayName }}
    </p>
    <span
      v-if="sensor.temperature !== null"
      class="font-semibold text-ink-900 tabular-nums shrink-0"
    >{{ sensor.temperature.toFixed(1) }}°C</span>
    <span
      v-else
      class="text-ink-300 shrink-0"
      aria-label="Нет данных о температуре"
    >—</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { type SensorWithTemperature } from "@/data";
import { route } from "@/constants/routes";

defineProps<{ sensor: SensorWithTemperature }>();
</script>
