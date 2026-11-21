<template>
  <div
    class="app-card app-card-hover overflow-hidden"
    :class="{
      'opacity-60': device.status === 'offline' || device.status === 'error',
    }"
  >
    <RouterLink
      :to="route.deviceDetails(device.id)"
      class="block px-4 pt-4 sm:px-5 sm:pt-5 active:scale-[0.98]"
      :aria-label="`Устройство ${device.name}: ${statusLabel}`"
    >
      <div class="flex justify-between items-start mb-3">
        <div class="min-w-0 flex-1 mr-2">
          <h3 class="font-semibold text-ink-900 text-sm sm:text-base truncate">
            {{ device.name }}
          </h3>
        </div>
        <span
          v-if="device.status === 'offline' || device.status === 'error'"
          class="inline-flex items-center gap-1.5 text-xs text-ink-500"
          role="status"
        >
          <span :class="['w-1.5 h-1.5 rounded-full', dotClass]" />
          {{ statusLabel }}
        </span>
      </div>

      <div
        v-if="device.powerConnected === false"
        class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 pb-2"
      >
        <span class="inline-flex items-center gap-1 text-amber-600">
          <icon-plug class="size-3.5" />
          От батареи
        </span>
        <span
          v-if="device.batteryLevel !== null"
          class="inline-flex items-center gap-1"
        >
          <icon-battery class="size-3.5" />
          {{ Math.round(device.batteryLevel ?? 0) }}%
        </span>
      </div>
    </RouterLink>

    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-ink-100 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors active:translate-y-px cursor-pointer"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="inline-flex items-center gap-2">
        Датчики
        <span
          v-if="sensors"
          class="text-ink-400 font-normal tabular-nums"
        >{{ sensors.length }}</span>
      </span>
      <svg
        class="size-4 text-ink-400 transition-transform duration-200"
        :class="expanded ? 'rotate-180' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div
      v-if="expanded"
      class="px-4 pb-4 sm:px-5 animate-fade-in"
    >
      <div
        v-if="sensorsLoading"
        class="space-y-3 py-2"
      >
        <div
          v-for="i in 2"
          :key="i"
          class="skeleton h-8 w-full max-w-md"
        />
      </div>

      <div
        v-else-if="sensorsError"
        class="flex flex-col items-center gap-3 py-4 text-center"
      >
        <p class="text-sm text-red-600">
          Не удалось загрузить датчики
        </p>
        <AppButton
          variant="secondary"
          @click="emit('reloadSensors')"
        >
          Повторить
        </AppButton>
      </div>

      <p
        v-else-if="!sensors || sensors.length === 0"
        class="text-sm text-ink-400 py-3"
      >
        Нет подключённых датчиков
      </p>

      <ul
        v-else
        class="divide-y divide-ink-100"
      >
        <li
          v-for="sensor in sensors"
          :key="sensor.id"
        >
          <SensorCard :sensor="sensor" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Sensor } from "@/data";
import { route } from "@/constants/routes";
import IconBattery from "@/components/icons/IconBattery.vue";
import IconPlug from "@/components/icons/IconPlug.vue";
import SensorCard from "@/components/devices/SensorCard.vue";
import AppButton from "@/components/ui/AppButton.vue";
import type { DeviceSummary } from "@/stores/devicesStore";

const props = defineProps<{
  device: DeviceSummary;
  sensors?: Sensor[];
  sensorsLoading?: boolean;
}>();

const emit = defineEmits<{ reloadSensors: [] }>();

const expanded = ref(false);

const sensorsError = computed(
  () => !props.sensorsLoading && props.sensors === undefined
);

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
