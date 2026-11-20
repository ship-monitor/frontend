import {
  onMounted,
  ref,
  watch,
  type ComputedRef,
} from "vue";
import {
  disconnectDevice,
  emptyMetricsSummary,
  getDeviceById,
  getDeviceMetricsSummary,
  getDeviceOnlineStatus,
  getDeviceSensors,
  updateDevice,
  type Firmware,
  type MetricsSummary,
  type Sensor,
} from "@/data";

export interface DeviceSettings {
  id: string;
  name: string;
}

export function useDeviceDetails(deviceId: ComputedRef<string>) {
  const loading = ref(true);
  const loadError = ref("");
  const deviceName = ref("");
  const deviceFirmware = ref<Firmware | null>(null);
  const deviceIsConnected = ref(false);
  const statusUnknown = ref(true);
  const metrics = ref<MetricsSummary>({ ...emptyMetricsSummary });
  const sensors = ref<Sensor[]>([]);
  const sensorsLoading = ref(true);
  const sensorsError = ref("");
  const settings = ref<DeviceSettings>({ id: "", name: "" });
  const saving = ref(false);
  const saveError = ref("");
  const disconnecting = ref(false);
  const disconnectError = ref("");

  // Счётчик поколений: ответы от предыдущего устройства не перезаписывают новое.
  let generation = 0;

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

  async function loadMetrics() {
    const result = await getDeviceMetricsSummary(deviceId.value);
    result
      .map((data) => {
        metrics.value = data;
      })
      .inspectErr((err) => {
        console.error("Failed to load device metrics: %s", err);
      })
      .unwrapOr(undefined);
  }

  async function pingStatus(currentGeneration: number) {
    const result = await getDeviceOnlineStatus(deviceId.value);
    if (currentGeneration !== generation) return;
    result
      .map((status) => {
        statusUnknown.value = false;
        deviceIsConnected.value = status.online;
      })
      .inspectErr(() => {
        statusUnknown.value = true;
      })
      .unwrapOr(undefined);
  }

  async function load() {
    const currentGeneration = ++generation;
    loading.value = true;
    loadError.value = "";

    const deviceResult = await getDeviceById(deviceId.value);
    if (currentGeneration !== generation) return;
    if (deviceResult.isErr) {
      loadError.value = deviceResult.error;
      loading.value = false;
      return;
    }

    const name =
      deviceResult.value.name && deviceResult.value.name !== "Unknown Device"
        ? deviceResult.value.name
        : deviceId.value.substring(0, 8);
    deviceName.value = name;
    deviceFirmware.value = deviceResult.value.firmware ?? null;
    settings.value = { id: deviceId.value, name };

    void loadSensors();
    void loadMetrics();
    await pingStatus(currentGeneration);
    loading.value = false;
  }

  async function saveSettings(updated: DeviceSettings) {
    saveError.value = "";
    const name = updated.name.trim();
    if (name === settings.value.name.trim()) return;
    if (!name) {
      saveError.value = "Название не может быть пустым";
      return;
    }

    saving.value = true;
    const result = await updateDevice(deviceId.value, name);
    saving.value = false;

    result
      .map(() => {
        settings.value = { ...updated, name };
        deviceName.value = name;
      })
      .inspectErr((err) => {
        saveError.value = err;
      })
      .unwrapOr(undefined);
  }

  async function disconnect(): Promise<boolean> {
    disconnecting.value = true;
    const result = await disconnectDevice(deviceId.value);
    disconnecting.value = false;

    let ok = false;
    result
      .map(() => {
        ok = true;
      })
      .inspectErr((err) => {
        disconnectError.value = err;
      })
      .unwrapOr(undefined);
    return ok;
  }

  function resetState() {
    generation++;
    saveError.value = "";
    statusUnknown.value = true;
    deviceIsConnected.value = false;
    deviceName.value = "";
    deviceFirmware.value = null;
    sensors.value = [];
    sensorsLoading.value = true;
    sensorsError.value = "";
    metrics.value = { ...emptyMetricsSummary };
  }

  // Vue Router переиспользует компонент при смене :id — перезагружаем состояние.
  watch(deviceId, (id) => {
    if (!id) return;
    resetState();
    void load();
  });

  onMounted(() => {
    if (deviceId.value) {
      void load();
    } else {
      loadError.value = "Некорректный идентификатор устройства";
      loading.value = false;
    }
  });

  return {
    loading,
    loadError,
    reload: load,
    deviceName,
    deviceFirmware,
    deviceIsConnected,
    statusUnknown,
    metrics,
    sensors,
    sensorsLoading,
    sensorsError,
    settings,
    saving,
    saveError,
    saveSettings,
    disconnecting,
    disconnectError,
    disconnect,
  };
}
