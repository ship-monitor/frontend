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

      <!-- Адаптивная сетка -->
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
              'px-2 py-1 text-xs rounded-full whitespace-nowrap flex-shrink-0 font-medium',
              sensor.status === 'Подключено'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600',
            ]">
              {{ sensor.status }}
            </span>
          </div>

          <!-- Показания температуры -->
          <div class="text-center py-3 sm:py-4">
            <div class="text-3xl sm:text-4xl font-bold mb-2 transition-colors"
              :class="getTemperatureClass(sensor.temperature)">
              {{ sensor.temperature !== undefined ? sensor.temperature.toFixed(1) + '°C' : '--' }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500">
              {{ sensor.minThreshold ?? '--' }}°C ... {{ sensor.maxThreshold ?? '--' }}°C
            </div>
          </div>

          <!-- Название организации -->
          <div class="text-center mb-4">
            <span class="text-xs text-gray-400">{{ sensor.organizationName }}</span>
          </div>

          <!-- Кнопки команд (только для подключенных устройств) -->
          <div v-if="sensor.status === 'Подключено'" class="flex gap-2 justify-center flex-wrap" @click.stop>
            <button @click="sendCommand(sensor.id, 'reboot')"
              class="px-3 py-1.5 text-xs sm:text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors active:scale-95 touch-target">
              Перезагрузить
            </button>
            <button @click="sendCommand(sensor.id, 'restart_service')"
              class="px-3 py-1.5 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors active:scale-95 touch-target">
              Рестарт сервиса
            </button>
            <button @click="sendCommand(sensor.id, 'get-temperature')"
              class="px-3 py-1.5 text-xs sm:text-sm bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors active:scale-95 touch-target">
              🌡️ Температура
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast уведомление -->
    <div v-if="toast.show" :class="[
      'fixed bottom-20 sm:bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm transition-all z-50',
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
  temperature?: number;
  minThreshold?: number;
  maxThreshold?: number;
  status: "Подключено" | "Отключено";
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
  subscribe: wsSubscribe,
  requestTemperature: wsRequestTemperature,
} = useWebSocket({
  url: wsUrl,
  token,
  onMessage: (message) => {
    // Данные с датчика
    if ((message.type === "sensor_data" || message.type === "temperature") && message.deviceId && message.data) {
      const sensor = sensors.value.find((s) => s.id === message.deviceId);
      if (sensor) {
        sensor.temperature = message.data.temperature ?? message.data.value;
        sensor.minThreshold = message.data.minThreshold;
        sensor.maxThreshold = message.data.maxThreshold;
      }
    }

    // Статус устройства
    if (message.type === "device_status" && message.deviceId) {
      const sensor = sensors.value.find((s) => s.id === message.deviceId);
      if (sensor) {
        const isDeviceConnected = message.data?.isConnected ?? message.data?.connected ?? false;
        sensor.status = isDeviceConnected ? "Подключено" : "Отключено";
      }
    }
  },
});

// Синхронизация статусов из WebSocket
watch(deviceStatuses, (statuses) => {
  statuses.forEach((status, deviceId) => {
    const sensor = sensors.value.find((s) => s.id === deviceId);
    if (sensor) {
      sensor.status = status;
    }
  });
}, { deep: true });

// Синхронизация данных датчиков
watch(sensorData, (data) => {
  data.forEach((sensorInfo, deviceId) => {
    const sensor = sensors.value.find((s) => s.id === deviceId);
    if (sensor) {
      sensor.temperature = sensorInfo.value;
      sensor.minThreshold = sensorInfo.minThreshold;
      sensor.maxThreshold = sensorInfo.maxThreshold;
    }
  });
}, { deep: true });

// ============ Методы ============
const getTemperatureClass = (value?: number) => {
  if (value === undefined) return "text-gray-400";
  if (value < -20) return "text-blue-600";
  if (value < -10) return "text-blue-500";
  if (value < 0) return "text-cyan-500";
  if (value < 10) return "text-green-500";
  if (value < 25) return "text-lime-500";
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

  // Для get-temperature используем специальный метод
  if (action === "get-temperature") {
    const success = wsRequestTemperature(deviceId);
    if (success) {
      showToast("Запрос температуры отправлен", "success");
    } else {
      showToast("Не удалось отправить запрос — нет соединения", "error");
    }
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
  if (!sensor.organizationId) {
    showToast('Ошибка: не удалось определить организацию для датчика', 'error');
    return;
  }

  localStorage.setItem(`device_org_${sensor.id}`, sensor.organizationId);
  router.push(`/sensors/${sensor.id}?orgId=${sensor.organizationId}`);
};

const loadSensors = async () => {
  try {
    const orgs = await getUsersOrganizations();
    const allSensors: SensorDisplay[] = [];

    for (const org of orgs) {
      try {
        const devices = await getOrganizationDevices(org.id);

        devices.forEach((device: Device) => {
          const wsStatus = deviceStatuses.value.get(device.id);
          const sensor: SensorDisplay = {
            id: device.id,
            name: device.name, // Всегда есть имя
            status: wsStatus ?? (device.isConnected ? "Подключено" : "Отключено"),
            organizationName: org.name,
            organizationId: org.id,
            temperature: sensorData.value.get(device.id)?.value ?? device.temperature,
            minThreshold: sensorData.value.get(device.id)?.minThreshold,
            maxThreshold: sensorData.value.get(device.id)?.maxThreshold,
          };
          allSensors.push(sensor);

          // Подписываемся на WebSocket обновления для этого устройства
          wsSubscribe(device.id);
        });
      } catch (err) {
        console.error(`Failed to load devices for org ${org.id}:`, err);
      }
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