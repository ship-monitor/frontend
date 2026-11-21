<template>
  <RouterLink
    :to="route.sensorDetails(sensor.deviceId, sensor.id)"
    :class="[
      'block rounded-xl border border-ink-200 bg-white px-3 py-3 transition-all hover:border-ink-300 hover:shadow-sm active:scale-[0.98]',
      stacked ? 'flex flex-col items-center gap-1 text-center' : 'flex items-center gap-3',
    ]"
    :aria-label="`Датчик ${sensor.displayName}`"
  >
    <p
      :class="[
        'font-semibold text-ink-900 truncate',
        stacked ? 'w-full' : 'min-w-0',
      ]"
    >
      {{ sensor.displayName }}
    </p>
    <span
      v-if="sensor.temperature !== null"
      :class="[
        'font-bold text-ink-900 tabular-nums shrink-0',
        stacked ? 'text-2xl' : 'font-semibold',
      ]"
    >{{ sensor.temperature.toFixed(1) }}°C</span>
    <span
      v-else
      :class="['shrink-0', stacked ? 'text-ink-300 text-2xl font-bold' : 'text-ink-300']"
      aria-label="Нет данных о температуре"
    >—</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { type SensorWithTemperature } from "@/data";
import { route } from "@/constants/routes";

defineProps<{
  sensor: SensorWithTemperature;
  stacked?: boolean;
}>();
</script>
