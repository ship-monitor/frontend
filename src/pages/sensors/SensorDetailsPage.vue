<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6">
    <div
      v-if="loading"
      class="text-center py-12"
    >
      <svg
        class="w-8 h-8 mx-auto text-brand-500 animate-spin mb-3"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p class="text-ink-400">
        Загрузка...
      </p>
    </div>

    <div
      v-else-if="loadError"
      class="ship-card p-8 text-center"
    >
      <p class="text-lg font-semibold text-ink-900 mb-1">
        {{ loadError }}
      </p>
      <p class="text-sm text-ink-500 mb-4">
        Проверьте соединение и повторите
      </p>
      <button
        class="px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
        @click="loadDeviceData"
      >
        Повторить
      </button>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <SensorHeader
        :name="sensorName"
        :device-id="deviceId"
        :is-connected="deviceIsConnected"
        :status-unknown="statusUnknown"
        :status-loading="statusLoading"
        :tags="settings.tags"
        @ping="pingAndUpdateStatus"
      />

      <SensorTabs
        v-model="activeTab"
        :tabs="tabs"
        @select="activeTab = $event"
      />

      <div
        id="sensor-tabpanel"
        role="tabpanel"
        :aria-labelledby="`sensor-tab-${activeTab}`"
        tabindex="0"
      >
        <transition
          name="fade"
          mode="out-in"
        >
          <SensorTemperatureTab
            v-if="activeTab === 'temperature'"
            :current-temp="currentTemp"
            :last-temp-time="lastTempTime"
            :error="tempError"
            :stale="tempStale"
            :loading="tempLoading"
            :selected-period="selectedPeriod"
            :history="tempHistory"
            :thresholds="{
              min: settings.minThreshold,
              max: settings.maxThreshold,
            }"
            :is-connected="deviceIsConnected"
            @refresh="refreshTemperature"
            @update:period="selectedPeriod = $event"
          />

          <SensorInfoTab
            v-else-if="activeTab === 'info'"
            :settings="settings"
            :saving="saving"
            :error="saveError"
            @save="saveSettings"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
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
import { fetchOnlineStatus } from "@/utils/utils";
import safeStorage from "@/utils/storage";

const route = useRoute();
const deviceId = computed(() => {
  const id = route.params.id;
  return typeof id === "string" ? id : "";
});

const loading = ref(true);
const tempLoading = ref(false);
const statusLoading = ref(false);
const saving = ref(false);
const activeTab = ref("temperature");
const deviceIsConnected = ref(false);
const sensorName = ref("");
const statusUnknown = ref(true);

const currentTemp = ref<DeviceStateRecord<number> | null>(null);
const lastTempTime = ref("");
const tempError = ref("");
const tempStale = ref(false);
const saveError = ref("");
const loadError = ref("");
const tempHistory = ref<
  Array<{ time: string; value: number; timestamp: number }>
>([]);
const selectedPeriod = ref("24h");

let refreshTimer: ReturnType<typeof setInterval> | null = null;
let refreshInFlight = false;
// Счётчик поколений: ответы от предыдущего устройства не перезаписывают новое.
let generation = 0;

const DEFAULT_THRESHOLDS = { min: -17, max: -15 };

function loadSettings(): SensorSettings {
  const stored = safeStorage.getJson(`device_settings_${deviceId.value}`);
  const record =
    stored && typeof stored === "object"
      ? (stored as Record<string, unknown>)
      : {};
  const min = record["minThreshold"];
  const max = record["maxThreshold"];
  return {
    id: deviceId.value,
    name: typeof record["name"] === "string" ? record["name"] : "",
    minThreshold: typeof min === "number" && Number.isFinite(min) ? min : DEFAULT_THRESHOLDS.min,
    maxThreshold: typeof max === "number" && Number.isFinite(max) ? max : DEFAULT_THRESHOLDS.max,
    tags: Array.isArray(record["tags"])
      ? record["tags"].filter((t): t is string => typeof t === "string")
      : [],
  };
}

const settings = ref<SensorSettings>(loadSettings());

function persistLocalSettings() {
  safeStorage.setItem(
    `device_settings_${deviceId.value}`,
    JSON.stringify({
      name: settings.value.name,
      minThreshold: settings.value.minThreshold,
      maxThreshold: settings.value.maxThreshold,
      tags: settings.value.tags,
    })
  );
}

const tabs = [
  { value: "temperature", label: "Температура" },
  { value: "info", label: "Информация" },
];

function getDisplayName(apiName?: string): string {
  if (settings.value.name && settings.value.name.trim() !== "")
    return settings.value.name;
  if (apiName && apiName !== "Unknown Device" && apiName !== "") return apiName;
  return deviceId.value.substring(0, 8);
}

async function saveSettings(s: SensorSettings) {
  saveError.value = "";
  const name = s.name.trim();
  if (name === settings.value.name.trim()) return;
  if (!name) {
    saveError.value = "Название не может быть пустым";
    return;
  }

  saving.value = true;
  const result = await updateDevice(deviceId.value, name);
  result
    .map(() => {
      settings.value = { ...s, name };
      persistLocalSettings();
      sensorName.value = getDisplayName();
    })
    .inspectErr((err) => {
      saveError.value = err;
    })
    .unwrapOr(undefined);
  saving.value = false;
}

async function pingAndUpdateStatus() {
  if (statusLoading.value) return;
  statusLoading.value = true;
  const currentGeneration = generation;
  const ok = await fetchOnlineStatus(deviceId.value);
  if (currentGeneration !== generation) return;
  if (ok === null) {
    // Сбой проверки: оставляем прежний статус и помечаем неизвестность.
    statusUnknown.value = true;
  } else {
    statusUnknown.value = false;
    deviceIsConnected.value = ok;
  }
  statusLoading.value = false;
}

async function loadTemperatureHistory(currentGeneration: number) {
  const result = await getDeviceStates<number>(
    deviceId.value,
    "temperature",
    100
  );
  if (currentGeneration !== generation) return;
  result
    .map((history) => {
      const mapped = history.map((record) => ({
        time: record.timestamp,
        value: record.value as number,
        timestamp: new Date(record.timestamp).getTime(),
      }));
      mapped.sort((a, b) => a.timestamp - b.timestamp);
      tempHistory.value = mapped;
    })
    .inspectErr((err) =>
      console.error("Failed load state history: %s", err)
    );
}

async function refreshTemperature() {
  if (refreshInFlight) return;
  refreshInFlight = true;
  tempLoading.value = true;
  tempError.value = "";
  const currentGeneration = generation;

  const result = await getDeviceState<number>(deviceId.value, "temperature");
  // Ответ от прошлого устройства: флаги мог уже перехватить новый refresh
  // (resetState сбросил их при смене) — ничего не трогаем.
  if (currentGeneration !== generation) return;

  if (result.isOk) {
    currentTemp.value = result.value;
    tempStale.value = false;
    lastTempTime.value = new Date(result.value.timestamp).toLocaleString(
      "ru-RU"
    );
    await loadTemperatureHistory(currentGeneration);
  } else {
    // Показанные данные могли устареть — помечаем, но не прячем.
    tempError.value = result.error;
    if (currentTemp.value) tempStale.value = true;
  }

  tempLoading.value = false;
  refreshInFlight = false;
}

async function loadDeviceData() {
  const currentGeneration = ++generation;
  loading.value = true;
  loadError.value = "";
  settings.value = loadSettings();

  const deviceResult = await getDeviceById(deviceId.value);
  if (currentGeneration !== generation) return;
  if (deviceResult.isErr) {
    loadError.value = deviceResult.error;
    loading.value = false;
    return;
  }

  sensorName.value = getDisplayName(deviceResult.value.name);
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

function resetState() {
  stopAutoRefresh();
  generation++;
  refreshInFlight = false;
  statusLoading.value = false;
  currentTemp.value = null;
  tempHistory.value = [];
  lastTempTime.value = "";
  tempError.value = "";
  tempStale.value = false;
  saveError.value = "";
  statusUnknown.value = true;
  deviceIsConnected.value = false;
  sensorName.value = "";
  activeTab.value = "temperature";
}

// Vue Router переиспользует компонент при смене :id — перезагружаем состояние.
watch(
  deviceId,
  (id) => {
    if (!id) return;
    resetState();
    loadDeviceData();
  }
);

onMounted(() => {
  if (deviceId.value) {
    loadDeviceData();
  } else {
    loadError.value = "Некорректный идентификатор устройства";
    loading.value = false;
  }
});

onUnmounted(stopAutoRefresh);
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
