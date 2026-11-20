import {
  onMounted,
  ref,
  watch,
  type ComputedRef,
} from "vue";
import {
  getDeviceSensors,
  getSensorTemperature,
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

  // Счётчик поколений: ответы по прошлому датчику не перезаписывают новый.
  let generation = 0;

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

    await loadTemperature(currentGeneration);
    loading.value = false;
  }

  function resetState() {
    generation++;
    sensor.value = null;
    temperature.value = { ...EMPTY_TEMPERATURE };
    temperatureError.value = "";
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
  };
}
