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

      <!-- NOTE: вкладка «Температура» вернётся, когда в API появится
           хранение и отдача метрик (GET .../metrics — заглушка). -->
      <SensorInfoTab
        :settings="settings"
        :saving="saving"
        :error="saveError"
        :disconnecting="disconnecting"
        :disconnect-error="disconnectError"
        @save="saveSettings"
        @disconnect="disconnectSensor"
      />

      <SensorsCard
        :device-id="deviceId"
        :sensors="sensors"
        :loading="sensorsLoading"
        :error="sensorsError"
        @renamed="onSensorRenamed"
      />

      <div class="ship-card p-6">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-lg font-bold text-ink-900">
            Температура
          </h2>
          <span
            v-if="temperature.current !== null"
            class="text-2xl font-bold text-ink-900"
          >{{ temperature.current.toFixed(1) }}°C</span>
        </div>
        <p class="text-sm text-ink-500 mb-4">
          <template v-if="temperature.updatedAt !== null">
            обновлено {{ new Date(temperature.updatedAt).toLocaleTimeString("ru") }}
          </template>
          <template v-else>
            нет данных
          </template>
        </p>

        <TemperatureChart
          :history="chartHistory"
          :thresholds="{ min: settings.minThreshold, max: settings.maxThreshold }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  updateDevice,
  getDeviceById,
  disconnectDevice,
  getDeviceSensors,
  getDeviceTemperature,
  type Sensor,
  type DeviceTemperature,
} from "@/data";
import { ROUTES } from "@/constants/routes";
import SensorHeader from "./SensorHeader.vue";
import SensorInfoTab, { type SensorSettings } from "./SensorInfoTab.vue";
import SensorsCard from "./SensorsCard.vue";
import TemperatureChart from "@/components/TemperatureChart.vue";
import { fetchOnlineStatus } from "@/utils/utils";
import safeStorage from "@/utils/storage";

const route = useRoute();
const router = useRouter();
const deviceId = computed(() => {
  const id = route.params.id;
  return typeof id === "string" ? id : "";
});

const loading = ref(true);
const statusLoading = ref(false);
const saving = ref(false);
const deviceIsConnected = ref(false);
const sensorName = ref("");
const statusUnknown = ref(true);
const saveError = ref("");
const loadError = ref("");
const disconnecting = ref(false);
const disconnectError = ref("");
const sensors = ref<Sensor[]>([]);
const sensorsLoading = ref(true);
const sensorsError = ref("");
const temperature = ref<DeviceTemperature>({
  current: null,
  updatedAt: null,
  history: [],
});

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

async function disconnectSensor() {
  disconnecting.value = true;
  const result = await disconnectDevice(deviceId.value);
  disconnecting.value = false;

  result
    .map(() => {
      safeStorage.removeItem(`device_settings_${deviceId.value}`);
      void router.push(ROUTES.DASHBOARD);
    })
    .inspectErr((err) => {
      disconnectError.value = err;
    })
    .unwrapOr(undefined);
}

async function loadSensors() {
  sensorsLoading.value = true;
  const result = await getDeviceSensors(deviceId.value);
  result
    .map((list) => {
      sensors.value = list;
      sensorsError.value = "";
    })
    .inspectErr((err) => {
      sensorsError.value = err;
    })
    .unwrapOr(undefined);
  sensorsLoading.value = false;
}

function onSensorRenamed(updated: Sensor) {
  sensors.value = sensors.value.map((s) =>
    s.id === updated.id ? updated : s
  );
}

async function loadTemperature() {
  const result = await getDeviceTemperature(deviceId.value);
  result
    .map((data) => {
      temperature.value = data;
    })
    .inspectErr((err) => {
      console.error("Faild load temperature: %s", err);
    })
    .unwrapOr(undefined);
}

const chartHistory = computed(() =>
  temperature.value.history.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString("ru"),
    value: point.value,
    timestamp: point.timestamp,
  }))
);

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
  void loadSensors();
  void loadTemperature();
  await pingAndUpdateStatus();
  loading.value = false;
}

function resetState() {
  generation++;
  statusLoading.value = false;
  saveError.value = "";
  statusUnknown.value = true;
  deviceIsConnected.value = false;
  sensorName.value = "";
  sensors.value = [];
  sensorsLoading.value = true;
  sensorsError.value = "";
  temperature.value = { current: null, updatedAt: null, history: [] };
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
</script>
