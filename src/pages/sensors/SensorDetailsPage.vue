<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6">
    <div v-if="loading" class="text-center py-12 text-gray-500">
      <div class="animate-spin text-4xl mb-2">⚡</div>
      <p>Загрузка...</p>
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
          @cancel="loadSettingsFromStorage"
          @update="handleDeviceUpdate"
        />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
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
const selectedPeriod = ref("1d");

let refreshTimer: ReturnType<typeof setInterval> | null = null;

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

const STORAGE_KEY = `device_data_${deviceId}`;
const SETTINGS_KEY = `device_settings_${deviceId}`;

function getDisplayName(apiName?: string): string {
  if (settings.value.name && settings.value.name.trim() !== "")
    return settings.value.name;
  if (apiName && apiName !== "Unknown Device" && apiName !== "") return apiName;
  return deviceId.substring(0, 8);
}

async function loadDeviceFromApi(): Promise<string | undefined> {
  try {
    const device = await getDeviceById(deviceId);
    return device?.name;
  } catch {
    return undefined;
  }
}

function loadStoredData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.tempHistory) tempHistory.value = data.tempHistory;
      if (data.currentTemp !== undefined) currentTemp.value = data.currentTemp;
      if (data.lastTempTime) lastTempTime.value = data.lastTempTime;
    } catch {
      /* */
    }
  }
}

function loadSettingsFromStorage() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      settings.value = { ...settings.value, ...parsed };
    } catch {
      /* */
    }
  }
}

async function saveSettings(s: SensorSettings) {
  saving.value = true;

  // Update device name via API if it changed
  if (s.name !== settings.value.name) {
    try {
      await updateDevice(deviceId, s.name);
    } catch (error) {
      console.error("Failed to update device name:", error);
    }
  }

  settings.value = s;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  sensorName.value = getDisplayName();
  setTimeout(() => {
    saving.value = false;
  }, 300);
}

function handleDeviceUpdate(device: { id: string; name: string }) {
  sensorName.value = device.name;
  settings.value.name = device.name;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value));
}

async function pingAndUpdateStatus() {
  deviceIsConnected.value = await isOnline(deviceId);
}

async function loadTemperatureHistory() {
  try {
    const history = await getDeviceStates<number>(deviceId, "temperature", 100);
    if (history) {
      tempHistory.value = history.map((record) => ({
        time: record.timestamp,
        value: record.value as number,
        timestamp: new Date(record.timestamp).getTime(),
      }));
    }
  } catch (error) {
    console.error("Failed to load temperature history:", error);
  }
}

async function refreshTemperature() {
  tempLoading.value = true;
  tempError.value = "";

  try {
    const temp = await getDeviceState<number>(deviceId, "temperature");
    currentTemp.value = temp;
    if (temp) {
      lastTempTime.value = new Date(temp.timestamp).toLocaleString("ru-RU");
      await loadTemperatureHistory();
    }
  } catch (error) {
    tempError.value = `Ошибка связи: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    tempLoading.value = false;
  }
}

async function loadDeviceData() {
  loadStoredData();
  loadSettingsFromStorage();

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
  }, 60000);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

watch([currentTemp, lastTempTime, tempHistory], () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  data.currentTemp = currentTemp.value;
  data.lastTempTime = lastTempTime.value;
  data.tempHistory = tempHistory.value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
});

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
