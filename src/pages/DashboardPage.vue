<template>
  <div class="space-y-5 sm:space-y-6 animate-fade-in">
    <!-- Заголовок -->
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          Мониторинг
        </h1>
        <p class="text-sm text-ink-500 mt-0.5">
          Контроль температуры в реальном времени
        </p>
      </div>
      <div
        v-if="autoRefreshActive"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium ring-1 ring-inset ring-brand-200 w-fit"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"
          />
          <span
            class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"
          />
        </span>
        Автообновление активно
      </div>
    </div>

    <!-- Счётчики -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4">
      <div class="ship-card p-4 sm:p-5 text-center animate-fade-in-up">
        <p class="text-2xl sm:text-3xl font-bold text-ink-900">
          {{ stats.total }}
        </p>
        <p class="text-xs text-ink-500 mt-0.5">
          Всего
        </p>
      </div>
      <div
        class="ship-card p-4 sm:p-5 text-center animate-fade-in-up delay-100"
      >
        <p class="text-2xl sm:text-3xl font-bold text-brand-600">
          {{ stats.online }}
        </p>
        <p class="text-xs text-ink-500 mt-0.5">
          В сети
        </p>
      </div>
      <div
        class="ship-card p-4 sm:p-5 text-center animate-fade-in-up delay-200"
      >
        <p class="text-2xl sm:text-3xl font-bold text-ink-400">
          {{ stats.offline }}
        </p>
        <p class="text-xs text-ink-500 mt-0.5">
          Не в сети
        </p>
      </div>
    </div>

    <!-- Поиск и фильтры -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <label
          class="sr-only"
          for="dashboard-search"
        >Поиск по названию или ID устройства</label>
        <input
          id="dashboard-search"
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по названию..."
          class="ship-field pl-10"
        >
        <svg
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <label
        class="sr-only"
        for="dashboard-status-filter"
      >Фильтр по статусу</label>
      <select
        id="dashboard-status-filter"
        v-model="statusFilter"
        class="ship-field sm:w-44 cursor-pointer"
      >
        <option value="all">
          Все статусы
        </option>
        <option value="online">
          В сети
        </option>
        <option value="offline">
          Не в сети
        </option>
        <option value="error">
          Ошибка
        </option>
      </select>
    </div>

    <!-- Ошибка загрузки -->
    <div
      v-if="loadError"
      class="ship-card p-8 text-center animate-scale-in"
    >
      <p class="text-lg font-semibold text-ink-900 mb-1">
        Не удалось загрузить устройства
      </p>
      <p class="text-sm text-red-600 mb-4">
        {{ loadError }}
      </p>
      <button
        class="px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
        @click="loadSensors"
      >
        Повторить
      </button>
    </div>

    <!-- Загрузка (skeleton) -->
    <div
      v-else-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="ship-card p-5"
      >
        <div class="skeleton h-5 w-32 mb-3" />
        <div class="skeleton h-3 w-20 mb-6" />
        <div class="skeleton h-12 w-24 mx-auto" />
      </div>
    </div>

    <!-- Пусто -->
    <div
      v-else-if="
        filteredSensors.length === 0 && !searchQuery && statusFilter === 'all'
      "
      class="ship-card p-8 sm:p-12 text-center animate-scale-in"
    >
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ink-100 flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-ink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      </div>
      <p class="text-lg font-semibold text-ink-900 mb-1">
        Нет подключенных устройств
      </p>
      <p class="text-sm text-ink-500 mb-5">
        Подключите устройство, чтобы начать мониторинг
      </p>
      <router-link
        :to="ROUTES.CONNECT_DEVICE"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
      >
        Подключить устройство
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </router-link>
    </div>

    <!-- Ничего не найдено -->
    <div
      v-else-if="filteredSensors.length === 0"
      class="ship-card p-8 text-center text-ink-500 animate-scale-in"
    >
      <p class="text-sm">
        Ничего не найдено
      </p>
      <button
        class="mt-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
        @click="
          searchQuery = '';
          statusFilter = 'all';
        "
      >
        Сбросить фильтры
      </button>
    </div>

    <!-- Сетка устройств -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      <device-card
        v-for="device in filteredSensors"
        :key="device.id"
        :sensor="device"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onActivated } from "vue";
import { ROUTES } from "@/constants/routes";
import { getUserDevices, getDeviceState } from "@/data";
import { fetchOnlineStatus } from "@/utils/utils";
import { useAuthStore } from "@/stores/authStore";
import safeStorage from "@/utils/storage";
import DeviceCard, {
  type SensorCard,
  type SensorCardStatus,
} from "@/components/DeviceCard.vue";

interface SensorDisplay extends SensorCard {
  displayName: string;
}

const authStore = useAuthStore();

const sensors = ref<SensorDisplay[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const autoRefreshActive = ref(false);
const searchQuery = ref("");
const statusFilter = ref("all");

let refreshTimer: ReturnType<typeof setInterval> | null = null;
let refreshInFlight = false;

const MIN_INTERVAL_MS = 5000;
const MAX_INTERVAL_MS = 300000;
const DEFAULT_INTERVAL_MS = 10000;

// Счётчики: unknown не считается ни онлайн, ни офлайн.
const stats = computed(() => ({
  total: sensors.value.length,
  online: sensors.value.filter((s) => s.status === "online").length,
  offline: sensors.value.filter(
    (s) => s.status === "offline" || s.status === "error"
  ).length,
}));

// Фильтрация
const filteredSensors = computed(() => {
  let result: SensorDisplay[] = sensors.value;

  if (statusFilter.value === "online") {
    result = result.filter((s) => s.status === "online");
  } else if (statusFilter.value === "offline") {
    // Как и счётчик «Не в сети», фильтр включает error-устройства.
    result = result.filter(
      (s) => s.status === "offline" || s.status === "error"
    );
  } else if (statusFilter.value === "error") {
    result = result.filter((s) => s.status === "error");
  }

  const query = searchQuery.value.toLowerCase().trim();
  if (query) {
    result = result.filter(
      (s) =>
        s.displayName.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query)
    );
  }

  return result;
});

// Вспомогательные функции
function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function getDisplayName(deviceId: string, apiName: string): string {
  const settings = asRecord(safeStorage.getJson(`device_settings_${deviceId}`));
  const name = settings?.["name"];
  if (typeof name === "string" && name.trim() !== "") {
    return name;
  }
  if (apiName && apiName !== "Unknown Device" && apiName !== "") return apiName;
  return deviceId.substring(0, 8);
}

function loadPingHistory(deviceId: string): boolean[] {
  const stored = safeStorage.getJson(`device_pings_${deviceId}`);
  if (Array.isArray(stored)) {
    const history = stored.filter((p): p is boolean => typeof p === "boolean");
    if (history.length > 0) return history.slice(-10);
  }
  return [];
}

function savePingHistory(deviceId: string, history: boolean[]) {
  safeStorage.setItem(
    `device_pings_${deviceId}`,
    JSON.stringify(history.slice(-10))
  );
}

function readCachedTemperature(deviceId: string): number | null {
  const data = asRecord(safeStorage.getJson(`device_data_${deviceId}`));
  const temp = data?.["currentTemp"];
  if (typeof temp === "number") {
    return temp;
  }
  return null;
}

async function loadSensors() {
  if (refreshInFlight) return;
  refreshInFlight = true;

  const devicesResult = await getUserDevices();
  if (devicesResult.isErr) {
    loadError.value = devicesResult.error;
    refreshInFlight = false;
    loading.value = false;
    return;
  }
  loadError.value = null;

  // Единый снапшот: на каждое устройство — статус и температура параллельно.
  const snapshot = await Promise.all(
    devicesResult.value.map(async (device) => {
      const [ok, tempRecord] = await Promise.all([
        fetchOnlineStatus(device.id),
        getDeviceState<number>(device.id, "temperature"),
      ]);
      return {
        device,
        ok,
        temp: tempRecord.isOk ? tempRecord.value : null,
      };
    })
  );

  const allSensors: SensorDisplay[] = [];
  const previousStatus = new Map(
    sensors.value.map((sensor) => [sensor.id, sensor.status])
  );

  for (const { device, ok, temp } of snapshot) {
    const pingHistory = loadPingHistory(device.id);
    if (ok !== null) {
      pingHistory.push(ok);
      if (pingHistory.length > 10) pingHistory.shift();
      savePingHistory(device.id, pingHistory);
    }

    let status: SensorCardStatus;

    if (ok === null) {
      // Статус неизвестен (сбой запроса): сохраняем прежнее состояние,
      // а не показываем устройство отключённым.
      status = previousStatus.get(device.id) ?? "unknown";
    } else {
      const lastPings = pingHistory.slice(-5);
      const allOffline = lastPings.length >= 3 && lastPings.every((p) => !p);
      status = ok ? "online" : "offline";
      if (allOffline && lastPings.length >= 3) {
        status = "error";
      }
    }

    const temperature: number | null =
      temp?.value ?? readCachedTemperature(device.id);
    if (temp?.value !== null && temp?.value !== undefined) {
      safeStorage.setItem(
        `device_data_${device.id}`,
        JSON.stringify({ currentTemp: temp.value, savedAt: Date.now() })
      );
    }

    allSensors.push({
      id: device.id,
      name: device.name,
      displayName: getDisplayName(device.id, device.name),
      status,
      temperature,
      tempUpdatedAt: temp ? new Date(temp.timestamp).getTime() : null,
    });
  }

  sensors.value = allSensors;
  refreshInFlight = false;
  loading.value = false;
}

function startAutoRefresh() {
  stopAutoRefresh();
  if (!authStore.isAuthenticated) return;

  const parsed = asRecord(safeStorage.getJson("app-settings")) ?? {};
  const autoRefresh = parsed["autoRefresh"] !== false;
  const rawInterval = Number(parsed["interval"]);
  const interval =
    Number.isFinite(rawInterval) && rawInterval > 0
      ? Math.min(Math.max(rawInterval, MIN_INTERVAL_MS), MAX_INTERVAL_MS)
      : DEFAULT_INTERVAL_MS;

  if (autoRefresh) {
    autoRefreshActive.value = true;
    refreshTimer = setInterval(() => {
      loadSensors();
    }, interval);
  }
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  autoRefreshActive.value = false;
}

onMounted(async () => {
  await loadSensors();
  startAutoRefresh();
});

onActivated(async () => {
  await loadSensors();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>
