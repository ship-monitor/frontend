<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6">
    <div v-if="loading" class="text-center py-12">
      <svg
        class="w-8 h-8 mx-auto text-brand-500 animate-spin mb-3"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-ink-400">Загрузка...</p>
    </div>

    <div v-else class="space-y-6">
      <SensorHeader
        :name="sensorName"
        :device-id="deviceId"
        :is-connected="deviceIsConnected"
        :status-loading="statusLoading"
        :tags="settings.tags"
        @ping="pingAndUpdateStatus"
      />

      <SensorTabs
        v-model="activeTab"
        :tabs="tabs"
        @select="activeTab = $event"
      />

      <!-- TODO: Handle update:period and assign the emitted value to selectedPeriod so period controls affect the chart. -->
      <!-- TODO: Align SensorInfoTab events: handle cancel and remove or implement the update event that the child never emits. -->
      <transition name="fade" mode="out-in">
        <SensorTemperatureTab
          v-if="activeTab === 'temperature'"
          :current-temp="currentTemp"
          :last-temp-time="lastTempTime"
          :error="tempError"
          :loading="tempLoading"
          :selected-period="selectedPeriod"
          :history="tempHistory"
          :thresholds="{
            min: settings.minThreshold,
            max: settings.maxThreshold,
          }"
          :is-connected="deviceIsConnected"
          @refresh="refreshTemperature"
        />

        <SensorInfoTab
          v-else-if="activeTab === 'info'"
          :settings="settings"
          :saving="saving"
          @save="saveSettings"
          @update="handleDeviceUpdate"
        />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import {
  getDeviceState,
  getDeviceStates,
  updateDevice,
  getDeviceById,
  type DeviceStateRecord,
} from "@/data";
import SensorHeader from "./SensorHeader.vue";
import SensorTabs from "./SensorTabs.vue";
import SensorTemperatureTab from "./SensorTemperatureTab.vue";
import SensorInfoTab, { type SensorSettings } from "./SensorInfoTab.vue";
import { isOnline } from "@/utils/utils";

const route = useRoute();
// TODO(router): Validate and watch the route id, then stop/reset/reload state when Vue Router reuses this component for another sensor.
const deviceId = route.params.id as string;

const loading = ref(true);
const tempLoading = ref(false);
const statusLoading = ref(false);
const saving = ref(false);
const activeTab = ref("temperature");
const deviceIsConnected = ref(true);
const sensorName = ref("");

const currentTemp = ref<DeviceStateRecord<number> | null>(null);
const lastTempTime = ref("");
const tempError = ref("");
const tempHistory = ref<
  Array<{ time: string; value: number; timestamp: number }>
>([]);
const selectedPeriod = ref("24h");

let refreshTimer: ReturnType<typeof setInterval> | null = null;

// TODO(models): Load/persist every SensorSettings field or reduce this model to the name field actually supported by this flow.
const settings = ref<SensorSettings>({
  id: deviceId,
  name: "",
  minThreshold: -17,
  maxThreshold: -15,
  phone: "",
  smsFrequency: "both",
  defrostTime: 30,
  tags: [],
});

const tabs = [
  { value: "temperature", label: "Температура" },
  { value: "info", label: "Информация" },
];

function getDisplayName(apiName?: string): string {
  if (settings.value.name && settings.value.name.trim() !== "")
    return settings.value.name;
  if (apiName && apiName !== "Unknown Device" && apiName !== "") return apiName;
  return deviceId.substring(0, 8);
}

async function loadDeviceFromApi(): Promise<string | undefined> {
  return (await getDeviceById(deviceId))
    .map((dev) => dev.name)
    .unwrapOr(undefined);
}

// TODO: Reset saving in finally, update local state only for Result.Ok, and surface Err; success and failure control flow is currently reversed.
async function saveSettings(s: SensorSettings) {
  saving.value = true;

  if (s.name === settings.value.name) return;

  if (
    (await updateDevice(deviceId, s.name))
      .map(() => true)
      .inspectErr((err) => console.error("Failed update device: %s", err))
      .unwrapOr(false)
  )
    return;

  settings.value = s;
  sensorName.value = getDisplayName();
  setTimeout(() => {
    saving.value = false;
  }, 300);
}

function handleDeviceUpdate(device: { id: string; name: string }) {
  sensorName.value = device.name;
  settings.value.name = device.name;
}

// TODO: Set statusLoading in try/finally, prevent overlapping checks, and represent failed checks as stale/unknown rather than retaining a misleading status.
async function pingAndUpdateStatus() {
  deviceIsConnected.value = await isOnline(deviceId);
}

async function loadTemperatureHistory() {
  try {
    const history = (
      await getDeviceStates<number>(deviceId, "temperature", 100)
    )
      .inspectErr((err) => console.error("Failed load state: %s", err))
      .unwrapOr([]);
    if (history) {
      const mapped = history.map((record) => ({
        time: record.timestamp,
        value: record.value as number,
        timestamp: new Date(record.timestamp).getTime(),
      }));
      mapped.sort((a, b) => a.timestamp - b.timestamp);
      tempHistory.value = mapped;
    }
  } catch (error) {
    console.error("Failed to load temperature history:", error);
  }
}

// TODO: Serialize/cancel overlapping manual and interval refreshes, and surface Result.Err while marking retained readings as stale.
async function refreshTemperature() {
  tempLoading.value = true;
  tempError.value = "";

  try {
    const temp = (await getDeviceState<number>(deviceId, "temperature"))
      .inspectErr((err) => console.error("Failed load temperature: %s", err))
      .unwrapOr(null);
    if (temp) {
      currentTemp.value = temp;
      lastTempTime.value = new Date(temp.timestamp).toLocaleString("ru-RU");
      await loadTemperatureHistory();
    }
  } catch (error) {
    tempError.value = `Ошибка связи: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    tempLoading.value = false;
  }
}

// TODO: Wrap initial loading in try/catch/finally, always clear loading, and expose a retryable page-level transport error.
async function loadDeviceData() {
  const apiName = await loadDeviceFromApi();
  sensorName.value = getDisplayName(apiName);

  await pingAndUpdateStatus();

  await refreshTemperature();

  loading.value = false;
  startAutoRefresh();
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    refreshTemperature();
  }, 10000);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

onUnmounted(stopAutoRefresh);

onMounted(loadDeviceData);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
