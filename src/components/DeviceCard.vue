<template>
  <RouterLink
    :to="route.sensorDetails(sensor.id)"
    class="ship-card ship-card-hover p-4 sm:p-5 block active:scale-[0.98]"
    :class="{
      'opacity-60': sensor.status === 'offline' || sensor.status === 'error',
    }"
    :aria-label="`Устройство ${sensor.displayName}: ${statusLabel}`"
  >
    <div class="flex justify-between items-start mb-4">
      <div class="min-w-0 flex-1 mr-2">
        <h3 class="font-semibold text-ink-900 text-sm sm:text-base truncate">
          {{ sensor.displayName }}
        </h3>
        <p class="text-xs text-ink-400 font-mono truncate">
          {{ sensor.id }}
        </p>
      </div>
      <span
        :class="['ship-badge', badgeClass]"
        role="status"
      >
        <span
          :class="[
            'w-1.5 h-1.5 rounded-full',
            dotClass,
          ]"
        />
        {{ statusLabel }}
      </span>
    </div>

    <div class="text-center py-2">
      <div
        class="text-3xl sm:text-4xl font-bold tracking-tight"
        :class="tempColor"
      >
        {{
          sensor.temperature !== null && sensor.temperature !== undefined
            ? Number(sensor.temperature).toFixed(1) + "°C"
            : "--"
        }}
      </div>
      <div
        v-if="sensor.tempUpdatedAt"
        class="text-xs text-ink-400 mt-1"
      >
        {{ new Date(sensor.tempUpdatedAt).toLocaleString("ru") }}
      </div>
      <div
        v-else
        class="text-xs text-ink-400 mt-1"
      >
        Нет данных о температуре
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { route } from "@/constants/routes";

export type SensorCardStatus = "online" | "offline" | "error" | "unknown";

export interface SensorCard {
  id: string;
  name: string;
  displayName: string;
  status: SensorCardStatus;
  temperature: number | null;
  tempUpdatedAt: number | null;
}

const props = defineProps<{
  sensor: SensorCard;
}>();

const statusLabel = computed(() => {
  switch (props.sensor.status) {
    case "online":
      return "В сети";
    case "offline":
      return "Не в сети";
    case "error":
      return "Ошибка связи";
    default:
      return "Статус неизвестен";
  }
});

const badgeClass = computed(() => {
  switch (props.sensor.status) {
    case "online":
      return "ship-badge-success";
    case "offline":
    case "error":
      return "ship-badge-danger";
    default:
      return "ship-badge-muted";
  }
});

const dotClass = computed(() => {
  switch (props.sensor.status) {
    case "online":
      return "bg-brand-500";
    case "offline":
    case "error":
      return "bg-red-400";
    default:
      return "bg-ink-400";
  }
});

const tempColor = computed(() => {
  const t = props.sensor.temperature;
  if (t === null || t === undefined) return "text-ink-400";

  if (t < -99 || t > 99) return "text-red-600";
  if (t < -20) return "text-blue-600";
  if (t < 0) return "text-cyan-500";
  if (t < 15) return "text-brand-500";
  return "text-orange-500";
});
</script>
