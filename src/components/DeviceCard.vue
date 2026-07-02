<template>
    <div v-if="loading" class="rounded-lg border grow p-4 sm:p-5 bg-white">
        <p class="text-sm text-gray-400 text-center">Загрузка...</p>
    </div>
    <RouterLink
        v-else-if="!error && device"
        :to="route.sensorDetails(deviceId)"
        class="rounded-lg border grow p-4 sm:p-5 hover:shadow-md transition-all active:scale-[0.98]"
        :class="{ 'bg-gray-200': !online?.value, 'bg-white': online?.value }"
    >
        <div class="flex justify-between items-start mb-3">
            <div class="min-w-0 flex-1 mr-2">
                <h3 class="font-semibold text-gray-800 text-sm sm:text-base truncate">
                    {{ device.name }}
                </h3>
                <p class="text-xs text-gray-400 font-mono truncate">
                    {{ device.id }}
                </p>
            </div>
            <span :class="statusBadgeClass(online)">
                {{ statusLabel(online) }}
            </span>
        </div>

        <div class="text-center py-3">
            <div class="text-3xl sm:text-4xl font-bold mb-1" :class="tempColor(temp)">
                {{
                    temp?.value !== null && temp?.value !== undefined
                        ? Number(temp.value).toFixed(1) + "°C"
                        : "--"
                }}
            </div>
            <div class="text-xs text-gray-400" v-if="temp">
                {{ new Date(temp.timestamp).toLocaleDateString("ru") }}
                {{ new Date(temp.timestamp).toLocaleTimeString("ru") }}
            </div>
        </div>
    </RouterLink>
    <div v-else class="rounded-lg border grow p-4 sm:p-5 bg-white">
        <p class="text-sm text-red-500 text-center">Ошибка загрузки</p>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { route } from '@/constants/routes';
import { getDeviceById, getDeviceState, type Device, type DeviceStateRecord } from '@/data';
import { getLastTemperature } from '@/utils/utils';

const props = defineProps<{ deviceId: string }>()

const device = ref<Device | null>(null);
const online = ref<DeviceStateRecord<boolean> | null>(null);
const temp = ref<DeviceStateRecord<number> | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);
let timer: ReturnType<typeof setInterval> | null = null;

async function loadAll() {
  loading.value = true;
  error.value = null;

  try {
    device.value = await getDeviceById(props.deviceId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Не удалось загрузить устройство";
    error.value = msg;
    console.error("[DeviceCard] load device error", props.deviceId, msg);
    loading.value = false;
    return;
  }

  try {
    online.value = await getDeviceState<boolean>(props.deviceId, "online");
  } catch (e) {
    console.warn("[DeviceCard] failed to load online state", props.deviceId, e);
    online.value = null;
  }

  try {
    temp.value = await getLastTemperature(props.deviceId);
  } catch (e) {
    console.warn("[DeviceCard] failed to load temperature", props.deviceId, e);
    temp.value = null;
  }

  console.log("[DeviceCard] loaded", props.deviceId, device.value?.name, online.value?.value, temp.value?.value);
  loading.value = false;
}

watch(() => props.deviceId, loadAll);

onMounted(() => {
  loadAll();
  timer = setInterval(loadAll, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const tempColor = (temp: DeviceStateRecord<number> | null) => {
    if (temp === null) return "text-gray-400";

    let min = -99;
    let max = 99;

    const t = temp.value;
    if (t < min || t > max) return "text-red-600";
    if (t < -20) return "text-blue-600";
    if (t < 0) return "text-cyan-500";
    if (t < 15) return "text-green-500";
    return "text-orange-500";
}

function statusLabel(record: DeviceStateRecord<boolean> | null) {
    if (!record) return "Не в сети";

    if (record.value) return "В сети";
    else return "Не в сети"
}

function statusBadgeClass(record: DeviceStateRecord<boolean> | null) {
    if (!record)
        return "px-2.5 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-600";

    if (record.value)
        return "px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800";
    else
        return "px-2.5 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800 border border-red-200";
}
</script>
