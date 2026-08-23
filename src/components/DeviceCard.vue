<template>
  <!-- Skeleton при загрузке -->
  <div v-if="loading" class="ship-card p-4 sm:p-5">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <div class="skeleton h-4 w-28 mb-2"></div>
        <div class="skeleton h-3 w-20"></div>
      </div>
      <div class="skeleton h-6 w-16 rounded-full"></div>
    </div>
    <div class="text-center py-3">
      <div class="skeleton h-10 w-24 mx-auto mb-2"></div>
      <div class="skeleton h-3 w-32 mx-auto"></div>
    </div>
  </div>

  <RouterLink
    v-else-if="!error && device"
    :to="route.sensorDetails(deviceId)"
    class="ship-card ship-card-hover p-4 sm:p-5 block active:scale-[0.98]"
    :class="{ 'opacity-60': !online?.value }"
  >
    <div class="flex justify-between items-start mb-4">
      <div class="min-w-0 flex-1 mr-2">
        <h3 class="font-semibold text-ink-900 text-sm sm:text-base truncate">
          {{ device.name }}
        </h3>
        <p class="text-xs text-ink-400 font-mono truncate">
          {{ device.id }}
        </p>
      </div>
      <span :class="['ship-badge', badgeClass(online)]">
        <span
          v-if="online?.value"
          class="w-1.5 h-1.5 rounded-full bg-brand-500"
        ></span>
        <span v-else class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
        {{ statusLabel(online) }}
      </span>
    </div>

    <div class="text-center py-2">
      <div
        class="text-3xl sm:text-4xl font-bold tracking-tight"
        :class="tempColor(temp)"
      >
        {{
          temp?.value !== null && temp?.value !== undefined
            ? Number(temp.value).toFixed(1) + "°C"
            : "--"
        }}
      </div>
      <div class="text-xs text-ink-400 mt-1" v-if="temp">
        {{ new Date(temp.timestamp).toLocaleDateString("ru") }}
        {{ new Date(temp.timestamp).toLocaleTimeString("ru") }}
      </div>
    </div>
  </RouterLink>

  <!-- Ошибка -->
  <div v-else class="ship-card p-4 sm:p-5">
    <div class="text-center py-3">
      <div
        class="w-10 h-10 mx-auto mb-2 rounded-full bg-red-50 flex items-center justify-center"
      >
        <svg
          class="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p class="text-sm text-red-500 font-medium">Ошибка загрузки</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { route } from "@/constants/routes";
import {
  getDeviceById,
  getDeviceState,
  type Device,
  type DeviceStateRecord,
} from "@/data";
import { getLastTemperature } from "@/utils/utils";

const props = defineProps<{ deviceId: string }>();

const device = ref<Device | null>(null);
const online = ref<DeviceStateRecord<boolean> | null>(null);
const temp = ref<DeviceStateRecord<number> | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);
let timer: ReturnType<typeof setInterval> | null = null;

// TODO: Centralize polling in the dashboard/store; current parent plus per-card polling duplicates requests and can display inconsistent snapshots.
// TODO: Make refresh non-reentrant, handle all request failures, and reset initial loading in finally without replacing existing data with a skeleton.
async function loadAll() {
  loading.value = true;
  error.value = null;

  device.value = (await getDeviceById(props.deviceId))
    .inspectErr((err) =>
      console.error("Failed load device %s: %s", props.deviceId, err)
    )
    .unwrapOr(null);

  online.value = (await getDeviceState<boolean>(props.deviceId, "online"))
    .inspectErr((err) => console.error("Failed load online status: %s", err))
    .unwrapOr(null);

  try {
    temp.value = await getLastTemperature(props.deviceId);
  } catch (e) {
    console.warn("[DeviceCard] failed to load temperature", props.deviceId, e);
    temp.value = null;
  }

  loading.value = false;
}

watch(() => props.deviceId, loadAll);

onMounted(() => {
  loadAll();
  timer = setInterval(loadAll, 10000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const tempColor = (temp: DeviceStateRecord<number> | null) => {
  if (temp === null) return "text-ink-400";

  const t = temp.value;
  if (t < -99 || t > 99) return "text-red-600";
  if (t < -20) return "text-blue-600";
  if (t < 0) return "text-cyan-500";
  if (t < 15) return "text-brand-500";
  return "text-orange-500";
};

// TODO: Represent online, offline, unknown, and request-error states separately instead of reporting missing data as offline.
function statusLabel(record: DeviceStateRecord<boolean> | null) {
  if (!record) return "Не в сети";
  return record.value ? "В сети" : "Не в сети";
}

function badgeClass(record: DeviceStateRecord<boolean> | null) {
  if (!record) return "ship-badge-muted";
  return record.value ? "ship-badge-success" : "ship-badge-danger";
}
</script>
