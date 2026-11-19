<template>
  <RouterLink
    :to="route.deviceDetails(device.id)"
    class="app-card app-card-hover group relative block overflow-hidden p-5 active:scale-[0.98]"
    :aria-label="`Устройство ${device.name}: ${statusConfig.label}`"
  >
    <span
      :class="['absolute inset-y-0 left-0 w-1', statusConfig.rail]"
      aria-hidden="true"
    />

    <div class="pl-2.5 flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="text-[15px] font-semibold text-ink-900 leading-snug truncate">
          {{ device.name }}
        </h3>
        <p class="mt-1 font-mono text-xs text-ink-400 truncate num">
          {{ shortId }}
        </p>
      </div>
      <span
        :class="['app-badge app-badge-' + statusConfig.badge, 'shrink-0']"
        role="status"
      >
        <span
          :class="['size-1.5 rounded-full', statusConfig.dot]"
          aria-hidden="true"
        />
        {{ statusConfig.label }}
      </span>
    </div>

    <div
      v-if="device.batteryLevel !== null"
      class="pl-2.5 mt-4"
    >
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs text-ink-500">Заряд батареи</span>
        <span
          :class="['font-mono text-xs font-semibold num', batteryTextClass]"
        >
          {{ batteryLabel }}
        </span>
      </div>
      <div class="h-1.5 rounded-full bg-ink-100 overflow-hidden">
        <div
          :class="['h-full w-full origin-left rounded-full', batteryBarClass]"
          :style="{ transform: `scaleX(${batteryScale})` }"
        />
      </div>
    </div>

    <div class="pl-2.5 mt-4 pt-3 border-t border-ink-100 flex items-center justify-between gap-3">
      <span
        v-if="device.powerConnected !== null"
        class="inline-flex items-center gap-1.5 text-xs"
        :class="device.powerConnected ? 'text-ink-500' : 'text-amber-600'"
      >
        <icon-plug class="size-3.5" />
        {{ device.powerConnected ? "Питание от сети" : "Питание от батареи" }}
      </span>
      <span
        v-else
        class="text-xs text-ink-400"
      >
        Нет данных телеметрии
      </span>
      <svg
        class="size-4 shrink-0 text-ink-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { route } from "@/constants/routes";
import IconPlug from "@/components/icons/IconPlug.vue";
import type { DeviceSummary } from "@/stores/devicesStore";

const props = defineProps<{
  device: DeviceSummary;
}>();

const statusConfig = computed(() => {
  switch (props.device.status) {
    case "online":
      return {
        label: "В сети",
        rail: "bg-ok-500",
        badge: "success",
        dot: "bg-ok-500",
      };
    case "offline":
      return {
        label: "Не в сети",
        rail: "bg-red-400",
        badge: "danger",
        dot: "bg-red-400",
      };
    case "error":
      return {
        label: "Ошибка связи",
        rail: "bg-red-500",
        badge: "danger",
        dot: "bg-red-500",
      };
    default:
      return {
        label: "Статус неизвестен",
        rail: "bg-ink-300",
        badge: "muted",
        dot: "bg-ink-400",
      };
  }
});

const shortId = computed(() => {
  const id = props.device.id;
  return id.length > 20 ? `${id.slice(0, 18)}…` : id;
});

const batteryLevel = computed(() =>
  props.device.batteryLevel === null ? null : Math.round(props.device.batteryLevel)
);

const batteryScale = computed(() =>
  batteryLevel.value === null
    ? 0
    : Math.min(Math.max(batteryLevel.value, 0), 100) / 100
);

const batteryLabel = computed(() =>
  batteryLevel.value === null ? "—" : `${batteryLevel.value}%`
);

const batteryTier = computed(() => {
  const level = batteryLevel.value;
  if (level === null) return "none";
  if (level >= 40) return "ok";
  if (level >= 15) return "warn";
  return "low";
});

const batteryTextClass = computed(() => {
  switch (batteryTier.value) {
    case "ok":
      return "text-ok-700";
    case "warn":
      return "text-amber-600";
    case "low":
      return "text-red-600";
    default:
      return "text-ink-400";
  }
});

const batteryBarClass = computed(() => {
  switch (batteryTier.value) {
    case "ok":
      return "bg-ok-500";
    case "warn":
      return "bg-amber-500";
    case "low":
      return "bg-red-500";
    default:
      return "bg-ink-300";
  }
});
</script>
