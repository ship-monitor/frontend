<template>
  <RouterLink
    :to="route.sensorDetails(sensor.deviceId, sensor.id)"
    class="py-3 flex items-center justify-between gap-4 rounded-lg -mx-2 px-2 transition-colors hover:bg-ink-50 active:scale-[0.98]"
    :aria-label="`Датчик ${sensor.displayName}`"
  >
    <div class="min-w-0">
      <p class="font-semibold text-ink-900 truncate">
        {{ sensor.displayName }}
      </p>
    </div>
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
