<template>
  <div class="p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">Мониторинг</h1>
      <!-- Статус WebSocket соединения -->
      <div class="flex items-center gap-2">
        <span :class="[
          'w-2.5 h-2.5 rounded-full',
          wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500',
        ]"></span>
        <span class="text-xs sm:text-sm text-gray-500">
          {{ wsConnected ? 'Подключено' : 'Отключено' }}
        </span>
      </div>
    </div>

    <!-- Группы камер -->
    <div>
      <h2 class="text-base sm:text-lg font-semibold mb-4">Все группы</h2>

      <div v-if="loading" class="text-gray-500">Загрузка...</div>

      <div v-else-if="sensors.length === 0" class="bg-white rounded-lg border p-6 sm:p-8 text-center text-gray-500">
        <p class="text-base sm:text-lg mb-2">Нет подключенных датчиков</p>
        <p class="text-xs sm:text-sm">Добавьте устройства через раздел "Организации"</p>
        <router-link to="/organizations"
          class="mt-4 inline-block text-blue-500 hover:text-blue-700 text-sm sm:text-base">
          Перейти к организациям →
        </router-link>
      </div>

      <!-- Адаптивная сетка: 1 колонка на телефоне, 2 на планшете, 3 на десктопе -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div v-for="sensor in sensors" :key="sensor.id"
          class="bg-white rounded-lg border p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="goToSensor(sensor)">
          <!-- Заголовок карточки -->
          <div class="flex justify-between items-start mb-3 sm:mb-4">
            <h3 class="font-semibold text-gray-800 text-sm sm:text-base truncate mr-2">
              {{ sensor.name }}
            </h3>
            <span :class="[
              'px-2 py-1 text-xs rounded-full whitespace-nowrap flex-shrink-0',
              sensor.status === 'online'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600',
            ]">
              {{ sensor.status === 'online' ? 'online' : 'offline' }}
            </span>
          </div>

          <!-- Показания температуры -->
          <div class="text-center py-3 sm:py-4">
            <div class="text-3xl sm:text-4xl font-bold mb-2 transition-colors"
              :class="getTemperatureClass(sensor.value)">
              {{ sensor.value !== undefined ? sensor.value.toFixed(1) + '°C' : '--' }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500">
              {{ sensor.minThreshold ?? '--' }}°C ... {{ sensor.maxThreshold ?? '--' }}°C
            </div>
          </div>

          <!-- Название организации -->
          <div class="text-center mb-4">
            <span class="text-xs text-gray-400">{{ sensor.organizationName }}</span>
          </div>

          <!-- Кнопки команд (только для online устройств) -->
          <div v-if="sensor.status === 'online'" class="flex gap-2 justify-center" @click.stop>
            <button @click="sendCommand(sensor.id, 'reboot')"
              class="px-3 py-1.5 text-xs sm:text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors active:scale-95">
              Перезагрузить
            </button>
            <button @click="sendCommand(sensor.id, 'restart_service')"
              class="px-3 py-1.5 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors active:scale-95">
              Рестарт сервиса
            </button>
            <button @click="sendCommand(sensor.id, 'update_config')"
              class="px-3 py-1.5 text-xs sm:text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors active:scale-95">
              Обновить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast уведомление -->
    <div v-if="toast.show" :class="[
      'fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm transition-all z-50',
      toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
    ]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { getUsersOrganizations, getOrganizationDevices, sendDeviceCommand, type Device } from "@/data";
import { useWebSocket } from "@/composables/useWebSocket";

const router = useRouter();

// ============ Типы ============
interface SensorDisplay {
  id: string;
  name: string;
  value?: number;
  minThreshold?: number;
  maxThreshold?: number;
  status: "online" | "offline";
  organizationName: string;
  organizationId: string;
}

// ============ Состояние ============
const sensors = ref<SensorDisplay[]>([]);
const loading = ref(true);
const toast = ref<{
  show: boolean;
  message: string;
  type: "success" | "error";
}>({ show: false, message: "", type: "success" });

let toastTimer: ReturnType<typeof setTimeout> | null = null;

// ============ WebSocket ============
const token = localStorage.getItem("token")?.replace(/^"|$/g, "") || "";
const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

const {
  isConnected: wsConnected,
  deviceStatuses,
  sensorData,
  connect: wsConnect,
  disconnect: wsDisconnect,
  sendCommand: wsSendCommand,
} = useWebSocket({
  url: wsUrl,
  token,
  onMessage: (message) => {
    if (message.type === "sensor_data" && message.deviceId && message.data) {
      const sensor = sensors.value.find((s) => s.id === message.deviceId);
      if (sensor) {
        sensor.value = message.data.value;
        sensor.minThreshold = message.data.minThreshold;
        sensor.maxThreshold = message.data.maxThreshold;
      }
    }

    if (message.type === "device_status" && message.deviceId) {
      const sensor = sensors.value.find((s) => s.id === message.deviceId);
      if (sensor) {
        sensor.status = message.data?.connected ? "online" : "offline";
      }
    }
  },
});

// Синхронизация статусов из WebSocket с локальным состоянием
watch(
  deviceStatuses,
  (statuses) => {
    statuses.forEach((status, deviceId) => {
      const sensor = sensors.value.find((s) => s.id === deviceId);
      if (sensor) {
        sensor.status = status;
      }
    });
  },
  { deep: true }
);

// Синхронизация данных датчиков
watch(
  sensorData,
  (data) => {
    data.forEach((sensorInfo, deviceId) => {
      const sensor = sensors.value.find((s) => s.id === deviceId);
      if (sensor) {
        sensor.value = sensorInfo.value;
        sensor.minThreshold = sensorInfo.minThreshold;
        sensor.maxThreshold = sensorInfo.maxThreshold;
      }
    });
  },
  { deep: true }
);

// ============ Методы ============
const getTemperatureClass = (value?: number) => {
  if (value === undefined) return "text-gray-400";
  if (value < -20) return "text-blue-600";
  if (value < -10) return "text-blue-500";
  if (value < 0) return "text-cyan-500";
  if (value < 10) return "text-green-500";
  return "text-orange-500";
};

const showToast = (message: string, type: "success" | "error" = "success") => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const sendCommand = async (deviceId: string, action: string) => {
  const sensor = sensors.value.find(s => s.id === deviceId);
  if (!sensor) {
    showToast("Устройство не найдено", "error");
    return;
  }

  const success = wsSendCommand({
    deviceId,
    action,
    payload: {},
  });

  try {
    await sendDeviceCommand(sensor.organizationId, deviceId, action, {});
  } catch (error) {
    console.error('HTTP command error:', error);
  }

  if (success) {
    showToast(`Команда "${action}" отправлена на устройство`, "success");
  } else {
    showToast("Не удалось отправить команду — нет соединения", "error");
  }
};

const goToSensor = (sensor: SensorDisplay) => {
  console.log('🖱️ Going to sensor:', sensor.id);
  console.log('🏢 Organization ID from sensor:', sensor.organizationId);

  if (!sensor.organizationId) {
    console.error('❌ No organizationId for sensor:', sensor);
    showToast('Ошибка: не удалось определить организацию для датчика', 'error');
    return;
  }

  localStorage.setItem(`device_org_${sensor.id}`, sensor.organizationId);
  const url = `/sensors/${sensor.id}?orgId=${sensor.organizationId}`;
  console.log('🔗 Navigating to:', url);
  router.push(url);
};

const loadSensors = async () => {
  try {
    const orgs = await getUsersOrganizations();
    console.log('📋 Organizations loaded:', orgs.length);
    const allSensors: SensorDisplay[] = [];

    for (const org of orgs) {
      console.log(`📡 Loading devices for org: ${org.id} - ${org.name}`);
      try {
        const devices = await getOrganizationDevices(org.id);
        console.log(`✅ Found ${devices.length} devices in org ${org.id}`);

        devices.forEach((device: Device) => {
          allSensors.push({
            id: device.id,
            name: device.name || "Без названия",
            status: deviceStatuses.value.get(device.id) ??
              (device.connected ? "online" : "offline"),
            organizationName: org.name,
            organizationId: org.id,
            value: sensorData.value.get(device.id)?.value,
            minThreshold: sensorData.value.get(device.id)?.minThreshold,
            maxThreshold: sensorData.value.get(device.id)?.maxThreshold,
          });
        });
      } catch (err) {
        console.error(`Failed to load devices for org ${org.id}:`, err);
      }
    }

    console.log(`🎯 Total sensors loaded: ${allSensors.length}`);
    if (allSensors[0]) {
      console.log('📊 First sensor example:', { id: allSensors[0].id, name: allSensors[0].name, orgId: allSensors[0].organizationId });
    }
    sensors.value = allSensors;
  } catch (error) {
    console.error("Failed to load sensors:", error);
  } finally {
    loading.value = false;
  }
};

// ============ Жизненный цикл ============
onMounted(async () => {
  await loadSensors();
  wsConnect();
});

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
});
</script>