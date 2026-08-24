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
          ></span>
          <span
            class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"
          ></span>
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
        <p class="text-xs text-ink-500 mt-0.5">Всего</p>
      </div>
      <div
        class="ship-card p-4 sm:p-5 text-center animate-fade-in-up delay-100"
      >
        <p class="text-2xl sm:text-3xl font-bold text-brand-600">
          {{ stats.online }}
        </p>
        <p class="text-xs text-ink-500 mt-0.5">В сети</p>
      </div>
      <div
        class="ship-card p-4 sm:p-5 text-center animate-fade-in-up delay-200"
      >
        <p class="text-2xl sm:text-3xl font-bold text-ink-400">
          {{ stats.offline }}
        </p>
        <p class="text-xs text-ink-500 mt-0.5">Не в сети</p>
      </div>
    </div>

    <!-- Поиск и фильтры -->
    <!-- TODO(a11y): Add programmatically associated labels for the search and status filter controls. -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по названию..."
          class="ship-field pl-10"
        />
        <svg
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <select v-model="statusFilter" class="ship-field sm:w-44 cursor-pointer">
        <option value="all">Все статусы</option>
        <option value="online">В сети</option>
        <option value="offline">Не в сети</option>
        <option value="error">Ошибка</option>
      </select>
    </div>

    <!-- Загрузка (skeleton) -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      <div v-for="i in 6" :key="i" class="ship-card p-5">
        <div class="skeleton h-5 w-32 mb-3"></div>
        <div class="skeleton h-3 w-20 mb-6"></div>
        <div class="skeleton h-12 w-24 mx-auto"></div>
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
      <p class="text-sm">Ничего не найдено</p>
      <button
        @click="
          searchQuery = '';
          statusFilter = 'all';
        "
        class="mt-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
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
        :device-id="device.id"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onActivated } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ROUTES } from "@/constants/routes";
import { getUserDevices } from "@/data";
import { fetchOnlineStatus, isAuthError } from "@/utils/utils";
import { useAuthStore } from "@/stores/authStore";
import DeviceCard from "@/components/DeviceCard.vue";

const currentRoute = useRoute();
const router = useRouter();
const authStore = useAuthStore();

interface SensorDisplay {
  id: string;
  name: string;
  displayName: string;
  status: "online" | "offline" | "error";
  isConnected: boolean;
  temperature: number | null;
  lastPingTime: number | null;
  pingHistory: boolean[];
  tags: string[];
}

const sensors = ref<SensorDisplay[]>([]);
const loading = ref(true);
const autoRefreshActive = ref(false);
const searchQuery = ref("");
const statusFilter = ref("all");

let refreshTimer: ReturnType<typeof setInterval> | null = null;

// Счётчики
const stats = computed(() => ({
  total: sensors.value.length,
  online: sensors.value.filter((s) => s.status === "online").length,
  offline: sensors.value.filter(
    (s) => s.status === "offline" || s.status === "error"
  ).length,
}));

// Фильтрация
const filteredSensors = computed(() => {
  let result = sensors.value;

  // По статусу
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

  // По поиску
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
function getDisplayName(deviceId: string, apiName: string): string {
  const savedSettings = localStorage.getItem(`device_settings_${deviceId}`);
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      if (settings.name && settings.name.trim() !== "") return settings.name;
    } catch {
      /* */
    }
  }
  if (apiName && apiName !== "Unknown Device" && apiName !== "") return apiName;
  return deviceId.substring(0, 8);
}

function getTags(deviceId: string): string[] {
  const savedSettings = localStorage.getItem(`device_settings_${deviceId}`);
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      if (settings.tags && Array.isArray(settings.tags)) return settings.tags;
    } catch {
      /* */
    }
  }
  return [];
}

// TODO(storage): Validate persisted JSON as boolean[] before mutating it; valid JSON such as null or an object currently breaks refresh.
function loadPingHistory(deviceId: string): boolean[] {
  const stored = localStorage.getItem(`device_pings_${deviceId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      /* */
    }
  }
  return [];
}

function savePingHistory(deviceId: string, history: boolean[]) {
  localStorage.setItem(
    `device_pings_${deviceId}`,
    JSON.stringify(history.slice(-10))
  );
}

async function loadSensors() {
  // TODO: Preserve device-list and status request failures as visible unknown/error states instead of converting them into an empty dashboard or offline devices.
  try {
    const devices = (await getUserDevices())
      .inspectErr((err) => console.error("Failed load devices: %s", err))
      .unwrapOr([]);

    const pingResults = await Promise.all(
      devices.map(async (device) => {
        const ok = await fetchOnlineStatus(device.id);
        return { device, ok };
      })
    );

    const allSensors: SensorDisplay[] = [];
    const previousById = new Map(
      sensors.value.map((sensor) => [sensor.id, sensor])
    );

    for (const { device, ok } of pingResults) {
      let temperature: number | null = null;
      const stored = localStorage.getItem(`device_data_${device.id}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          temperature = data.currentTemp ?? null;
        } catch {
          /* */
        }
      }

      const pingHistory = loadPingHistory(device.id);
      if (ok !== null) {
        pingHistory.push(ok);
        if (pingHistory.length > 10) pingHistory.shift();
        savePingHistory(device.id, pingHistory);
      }

      const previous = previousById.get(device.id);
      let status: "online" | "offline" | "error";
      let isConnected: boolean;
      let lastPingTime: number | null;

      if (ok === null) {
        // Статус неизвестен (сбой запроса): сохраняем прежнее состояние,
        // а не показываем устройство отключённым.
        status = previous?.status ?? "offline";
        isConnected = previous?.isConnected ?? false;
        lastPingTime = previous?.lastPingTime ?? null;
      } else {
        const lastPings = pingHistory.slice(-5);
        const allOffline = lastPings.length >= 3 && lastPings.every((p) => !p);
        status = ok ? "online" : "offline";
        if (allOffline && lastPings.length >= 3) {
          status = "error";
        }
        isConnected = ok;
        lastPingTime = ok ? Date.now() : null;
      }

      allSensors.push({
        id: device.id,
        name: device.name,
        displayName: getDisplayName(device.id, device.name),
        status,
        isConnected,
        temperature,
        lastPingTime,
        pingHistory,
        tags: getTags(device.id),
      });
    }

    sensors.value = allSensors;
    console.log("[Dashboard] loadSensors done, sensors:", allSensors.length);
  } catch (error) {
    console.error("[Dashboard] loadSensors error:", error);
    if (isAuthError(error)) {
      console.warn("[Dashboard] unauthorized/auth error, redirecting to login");
      stopAutoRefresh();
      if (currentRoute.path !== ROUTES.LOGIN) {
        router.push(ROUTES.LOGIN);
      }
    }
  }
}

// TODO(storage): Schema-check persisted settings and clamp the interval to a finite safe range before passing it to setInterval.
function startAutoRefresh() {
  stopAutoRefresh();
  if (!authStore.isAuthenticated) {
    console.log("[Dashboard] not authenticated, skip auto refresh");
    return;
  }
  let settings: { autoRefresh?: boolean; interval?: number } = {};
  const saved = localStorage.getItem("app-settings");
  if (saved) {
    try {
      settings = JSON.parse(saved);
    } catch {
      settings = {};
    }
  }
  console.log("[Dashboard] startAutoRefresh settings", settings);
  if (settings.autoRefresh === undefined) settings.autoRefresh = true;
  if (!settings.interval) settings.interval = 10000;
  if (settings.autoRefresh) {
    autoRefreshActive.value = true;
    refreshTimer = setInterval(() => {
      console.log("[Dashboard] auto refresh tick");
      loadSensors();
    }, settings.interval);
    console.log(
      "[Dashboard] auto refresh started, interval:",
      settings.interval
    );
  } else {
    console.log("[Dashboard] auto refresh disabled by settings");
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
  loading.value = false;
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
