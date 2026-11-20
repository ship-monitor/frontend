import {
  onMounted,
  ref,
  watch,
  type ComputedRef,
} from "vue";
import {
  emptyMetricsSummary,
  getDeviceSensors,
  getSensorMetricsSummary,
  getSensorTemperature,
  renameSensor,
  type MetricsSummary,
  type Sensor,
  type SensorTemperature,
} from "@/data";

const EMPTY_TEMPERATURE: SensorTemperature = {
  current: null,
  updatedAt: null,
  history: [],
};

export function useSensorDetails(
  deviceId: ComputedRef<string>,
  sensorId: ComputedRef<string>
) {
  const loading = ref(true);
  const loadError = ref("");
  const sensor = ref<Sensor | null>(null);
  const temperature = ref<SensorTemperature>({ ...EMPTY_TEMPERATURE });
  const temperatureError = ref("");
  const metrics = ref<MetricsSummary>({ ...emptyMetricsSummary });
  const saving = ref(false);
  const saveError = ref("");

  // Счётчик поколений: ответы по прошлому датчику не перезаписывают новый.
  let generation = 0;

  async function loadMetrics(currentGeneration: number) {
    const result = await getSensorMetricsSummary(
      deviceId.value,
      sensorId.value
    );
    if (currentGeneration !== generation) return;
    result
      .map((data) => {
        metrics.value = data;
      })
      .inspectErr((err) => {
        console.error("Failed to load sensor metrics: %s", err);
      })
      .unwrapOr(undefined);
  }

  async function loadTemperature(currentGeneration: number) {
    temperatureError.value = "";
    const result = await getSensorTemperature(deviceId.value, sensorId.value);
    if (currentGeneration !== generation) return;
    result
      .map((data) => {
        temperature.value = data;
      })
      .inspectErr((err) => {
        temperatureError.value = err;
      })
      .unwrapOr(undefined);
  }

  async function load() {
    const currentGeneration = ++generation;
    loading.value = true;
    loadError.value = "";

    if (!deviceId.value || !sensorId.value) {
      loadError.value = "Некорректный идентификатор датчика";
      loading.value = false;
      return;
    }

    const sensorsResult = await getDeviceSensors(deviceId.value);
    if (currentGeneration !== generation) return;
    if (sensorsResult.isErr) {
      loadError.value = sensorsResult.error;
      loading.value = false;
      return;
    }

    const found = sensorsResult.value.find((item) => item.id === sensorId.value);
    if (!found) {
      loadError.value = "Датчик не найден";
      loading.value = false;
      return;
    }
    sensor.value = found;

    void loadMetrics(currentGeneration);
    await loadTemperature(currentGeneration);
    loading.value = false;
  }

  function resetState() {
    generation++;
    sensor.value = null;
    temperature.value = { ...EMPTY_TEMPERATURE };
    temperatureError.value = "";
    metrics.value = { ...emptyMetricsSummary };
    saveError.value = "";
  }

  async function saveSensorName(name: string) {
    if (!sensor.value) return;
    const trimmed = name.trim();
    saveError.value = "";
    if (!trimmed) {
      saveError.value = "Название не может быть пустым";
      return;
    }
    if (trimmed === sensor.value.displayName) return;

    saving.value = true;
    const result = await renameSensor(deviceId.value, sensorId.value, trimmed);
    saving.value = false;

    result
      .map((updated) => {
        sensor.value = updated;
      })
      .inspectErr((err) => {
        saveError.value = err;
      })
      .unwrapOr(undefined);
  }

  // Vue Router переиспользует компонент при смене :deviceId/:sensorId.
  watch([deviceId, sensorId], ([device, sensor]) => {
    if (!device || !sensor) return;
    resetState();
    void load();
  });

  onMounted(() => {
    void load();
  });

  return {
    loading,
    loadError,
    reload: load,
    sensor,
    temperature,
    temperatureError,
    reloadTemperature: () => void loadTemperature(generation),
    metrics,
    saving,
    saveError,
    saveSensorName,
  };
}
