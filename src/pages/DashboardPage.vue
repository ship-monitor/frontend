<template>
  <div class="p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">Мониторинг</h1>
      <button @click="refreshAll" :disabled="refreshing"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm touch-target">
        {{ refreshing ? 'Обновление...' : 'Обновить' }}
      </button>
    </div>

    <div>
      <h2 class="text-base sm:text-lg font-semibold mb-4">Все устройства</h2>

      <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>

      <div v-else-if="sensors.length === 0" class="bg-white rounded-lg border p-6 sm:p-8 text-center text-gray-500">
        <p class="text-base sm:text-lg mb-2">Нет подключенных устройств</p>
        <p class="text-xs sm:text-sm">Добавьте устройства через раздел "Организации"</p>
        <router-link to="/organizations"
          class="mt-4 inline-block text-blue-500 hover:text-blue-700 text-sm sm:text-base">
          Перейти к организациям
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div v-for="sensor in sensors" :key="sensor.id"
          class="bg-white rounded-lg border p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
          @click="goToSensor(sensor)">

          <div class="flex justify-between items-start mb-3 sm:mb-4">
            <div class="min-w-0 flex-1 mr-2">
              <h3 class="font-semibold text-gray-800 text-sm sm:text-base truncate">
                {{ sensor.displayName }}
              </h3>
              <p class="text-xs text-gray-400 font-mono truncate">{{ sensor.id }}</p>
            </div>
            <span :class="[
              'px-2.5 py-1 text-xs rounded-full whitespace-nowrap flex-shrink-0 font-medium',
              sensor.isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600',
            ]">
              {{ sensor.isConnected ? 'Подключено' : 'Отключено' }}
            </span>
          </div>

          <div class="text-center py-4">
            <div class="text-3xl sm:text-4xl font-bold mb-2"
              :class="sensor.temperature !== null ? 'text-gray-800' : 'text-gray-400'">
              {{ sensor.temperature !== null ? sensor.temperature.toFixed(1) + '°C' : '--' }}
            </div>
            <div class="text-xs text-gray-400">{{ sensor.organizationName }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { getUsersOrganizations, getOrganizationDevices, getDeviceInfo } from "@/data";

const router = useRouter();

interface SensorDisplay {
  id: string;
  name: string;
  displayName: string;
  isConnected: boolean;
  temperature: number | null;
  organizationName: string;
  organizationId: string;
}

const sensors = ref<SensorDisplay[]>([]);
const loading = ref(true);
const refreshing = ref(false);

function getDisplayName(deviceId: string, apiName: string): string {
  const savedSettings = localStorage.getItem(`device_settings_${deviceId}`);
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      if (settings.name && settings.name.trim() !== '') return settings.name;
    } catch { /* */ }
  }
  if (apiName && apiName !== 'Unknown Device' && apiName !== '') return apiName;
  return deviceId.substring(0, 8);
}

function goToSensor(sensor: SensorDisplay) {
  if (!sensor.organizationId) return;
  localStorage.setItem(`device_org_${sensor.id}`, sensor.organizationId);
  router.push(`/sensors/${sensor.id}?orgId=${sensor.organizationId}`);
}

async function loadSensors() {
  const orgs = await getUsersOrganizations();
  const allSensors: SensorDisplay[] = [];

  for (const org of orgs) {
    const devices = await getOrganizationDevices(org.id);
    // Для каждого устройства запрашиваем актуальный статус
    const devicesWithStatus = await Promise.all(
      devices.map(async (device) => {
        try {
          const info = await getDeviceInfo(org.id, device.id);
          return { ...device, isConnected: info.isConnected ?? false };
        } catch {
          return device;
        }
      })
    );

    for (const device of devicesWithStatus) {
      let temperature: number | null = null;
      const stored = localStorage.getItem(`device_data_${device.id}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          temperature = data.currentTemp ?? null;
        } catch { /* */ }
      }

      allSensors.push({
        id: device.id,
        name: device.name,
        displayName: getDisplayName(device.id, device.name),
        isConnected: device.isConnected,
        temperature,
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

onMounted(async () => {
  await loadSensors();
  loading.value = false;
});

onActivated(async () => {
  await loadSensors();
});
</script>