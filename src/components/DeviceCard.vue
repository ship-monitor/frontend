<template>
  <RouterLink
    :to="route.deviceDetails(device.id)"
    class="ship-card ship-card-hover p-4 sm:p-5 block active:scale-[0.98]"
    :class="{
      'opacity-60': device.status === 'offline' || device.status === 'error',
    }"
    :aria-label="`Устройство ${device.displayName}: ${statusLabel}`"
  >
    <div class="flex justify-between items-start mb-4">
      <div class="min-w-0 flex-1 mr-2">
        <h3 class="font-semibold text-ink-900 text-sm sm:text-base truncate">
          {{ device.displayName }}
        </h3>
      </div>
      <span
        class="inline-flex items-center gap-1.5 text-xs text-ink-500"
        role="status"
      >
        <span :class="['w-1.5 h-1.5 rounded-full', dotClass]" />
        {{ statusLabel }}
      </span>
    </div>

    <div class="text-center py-2">
      <div
        v-if="device.temperature !== null"
        class="mb-1"
      >
        <span class="text-4xl font-bold text-ink-900 tabular-nums">
          {{ device.temperature.toFixed(1) }}°
        </span>
        <p
          v-if="device.tempUpdatedAt !== null"
          class="text-xs text-ink-400 mt-1"
        >
          обновлено {{ new Date(device.tempUpdatedAt).toLocaleTimeString("ru") }}
        </p>
      </div>
      <p
        v-else
        class="text-sm text-ink-400"
      >
        нет данных
      </p>
      <div
        v-if="device.batteryLevel !== null || device.powerConnected !== null"
        class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink-500 mt-2"
      >
        <span
          v-if="device.powerConnected !== null"
          class="inline-flex items-center gap-1"
          :class="device.powerConnected ? 'text-ink-500' : 'text-amber-600'"
        >
          <icon-plug class="size-3.5" />
          {{ device.powerConnected ? "От сети" : "От батареи" }}
        </span>
        <span
          v-if="device.batteryLevel !== null"
          class="inline-flex items-center gap-1"
        >
          <icon-battery class="size-3.5" />
          {{ Math.round(device.batteryLevel ?? 0) }}%
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { route } from "@/constants/routes";
import IconBattery from "@/components/icons/IconBattery.vue";
import IconPlug from "@/components/icons/IconPlug.vue";
import type { DeviceSummary } from "@/stores/devicesStore";

const props = defineProps<{
  device: DeviceSummary;
}>();

const statusLabel = computed(() => {
  switch (props.device.status) {
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

const dotClass = computed(() => {
  switch (props.device.status) {
    case "online":
      return "bg-brand-500";
    case "offline":
    case "error":
      return "bg-red-400";
    default:
      return "bg-ink-400";
  }
});
</script>
