<template>
    <div class="p-4 sm:p-6">
        <!-- Заголовок и кнопка обновления -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h1 class="text-xl sm:text-2xl font-bold">Мониторинг</h1>
            <div class="flex items-center gap-3">
                <span v-if="autoRefreshActive" class="text-xs text-gray-400">Авто</span>
                <button @click="refreshAll" :disabled="refreshing"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm touch-target">
                    {{ refreshing ? "Проверка..." : "Обновить" }}
                </button>
            </div>
        </div>
        <!-- Счётчики -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            <div class="bg-white rounded-xl border p-3 text-center">
                <p class="text-xl sm:text-2xl font-bold text-gray-800">
                    {{ stats.total }}
                </p>
                <p class="text-xs text-gray-500">Всего</p>
            </div>
            <div class="bg-white rounded-xl border p-3 text-center">
                <p class="text-xl sm:text-2xl font-bold text-green-600">
                    {{ stats.online }}
                </p>
                <p class="text-xs text-gray-500">В сети</p>
            </div>
            <div class="bg-white rounded-xl border p-3 text-center">
                <p class="text-xl sm:text-2xl font-bold text-gray-400">
                    {{ stats.offline }}
                </p>
                <p class="text-xs text-gray-500">Не в сети</p>
            </div>
        </div>
        <!-- Поиск и фильтры -->
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
            <div class="relative flex-1">
                <input v-model="searchQuery" type="text" placeholder="Поиск по названию или тегу..."
                    class="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <select v-model="statusFilter"
                class="px-4 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none touch-target">
                <option value="all">Все</option>
                <option value="online">В сети</option>
                <option value="offline">Не в сети</option>
                <option value="error">Ошибка</option>
            </select>
        </div>
        <!-- Загрузка -->
        <div v-if="loading" class="text-center py-12 text-gray-500">
            Загрузка...
        </div>
        <!-- Пусто -->
        <div v-else-if="
            filteredSensors.length === 0 && !searchQuery && statusFilter === 'all'
        " class="bg-white rounded-lg border p-6 sm:p-8 text-center text-gray-500">
            <p class="text-base sm:text-lg mb-2">Нет подключенных устройств</p>
            <p class="text-xs sm:text-sm mb-4">
                Добавьте устройства через раздел "Организации"
            </p>
            <router-link :to="route.organizations()"
                class="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                Перейти к организациям
            </router-link>
        </div>
        <!-- Ничего не найдено -->
        <div v-else-if="filteredSensors.length === 0"
            class="bg-white rounded-lg border p-6 sm:p-8 text-center text-gray-500">
            <p class="text-sm">Ничего не найдено</p>
            <button @click="
                searchQuery = '';
            statusFilter = 'all';
            " class="mt-2 text-blue-500 hover:text-blue-700 text-sm">
                Сбросить фильтры
            </button>
        </div>
        <!-- Сетка устройств -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <device-card v-for="device in sensors" :device-id="device.id" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { route } from "@/constants/routes";
import { getUsersOrganizations, getOrganizationDevices } from "@/data";
import { isOnline } from "@/utils/utils";
import DeviceCard from "@/components/DeviceCard.vue";

const router = useRouter();

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
    organizationName: string;
    organizationId: string;
}

const sensors = ref<SensorDisplay[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const autoRefreshActive = ref(false);
const searchQuery = ref("");
const statusFilter = ref("all");

let refreshTimer: ReturnType<typeof setInterval> | null = null;

// Счётчики
const stats = computed(() => ({
    total: sensors.value.length,
    online: sensors.value.filter((s) => s.status === "online").length,
    offline: sensors.value.filter(
        (s) => s.status === "offline" || s.status === "error",
    ).length,
}));

// Фильтрация
const filteredSensors = computed(() => {
    let result = sensors.value;

    // По статусу
    if (statusFilter.value === "online") {
        result = result.filter((s) => s.status === "online");
    } else if (statusFilter.value === "offline") {
        result = result.filter((s) => s.status === "offline");
    } else if (statusFilter.value === "error") {
        result = result.filter((s) => s.status === "error");
    }

    // По поиску
    const query = searchQuery.value.toLowerCase().trim();
    if (query) {
        result = result.filter(
            (s) =>
                s.displayName.toLowerCase().includes(query) ||
                s.tags.some((t) => t.toLowerCase().includes(query)) ||
                s.id.toLowerCase().includes(query) ||
                s.organizationName.toLowerCase().includes(query),
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
        JSON.stringify(history.slice(-10)),
    );
}






async function loadSensors() {
    const orgs = await getUsersOrganizations();
    const allSensors: SensorDisplay[] = [];

    for (const org of orgs) {
        const devices = await getOrganizationDevices(org.id);

        const pingResults = await Promise.all(
            devices.map(async (device) => {
                const ok = await isOnline(device.id);
                return { device, ok };
            }),
        );

        for (const { device, ok } of pingResults) {
            // Загружаем температуру
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

            // История пингов
            const pingHistory = loadPingHistory(device.id);
            pingHistory.push(ok);
            if (pingHistory.length > 10) pingHistory.shift();
            savePingHistory(device.id, pingHistory);

            // Определяем статус
            const lastPings = pingHistory.slice(-5);
            const allOffline = lastPings.length >= 3 && lastPings.every((p) => !p);
            let status: "online" | "offline" | "error" = ok ? "online" : "offline";
            if (allOffline && lastPings.length >= 3) {
                status = "error";
            }

            allSensors.push({
                id: device.id,
                name: device.name,
                displayName: getDisplayName(device.id, device.name),
                status,
                isConnected: ok,
                temperature,
                lastPingTime: ok ? Date.now() : null,
                pingHistory,
                tags: getTags(device.id),
                organizationName: org.name,
                organizationId: org.id,
            });
        }
    }

    sensors.value = allSensors;
}

async function refreshAll() {
    refreshing.value = true;
    await loadSensors();
    refreshing.value = false;
}

function startAutoRefresh() {
    stopAutoRefresh();
    const saved = localStorage.getItem("app-settings");
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            if (settings.autoRefresh && settings.interval) {
                autoRefreshActive.value = true;
                refreshTimer = setInterval(() => loadSensors(), settings.interval);
            }
        } catch {
            /* */
        }
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
