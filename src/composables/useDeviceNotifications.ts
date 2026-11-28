import { computed, ref, watch, type ComputedRef } from "vue";
import { getDeviceNotifications, type DeviceNotification } from "@/data";
import { notificationItem } from "@/utils/notifications";

export type SensorNameSource = { id: string; displayName: string };

export function useDeviceNotifications(
  deviceId: ComputedRef<string>,
  sensors: ComputedRef<SensorNameSource[]>
) {
  const raw = ref<DeviceNotification[]>([]);
  const loading = ref(true);
  const loadError = ref("");

  let generation = 0;

  async function load() {
    const current = ++generation;
    const id = deviceId.value;
    loading.value = true;
    loadError.value = "";
    raw.value = [];

    if (!id) {
      loadError.value = "Некорректный идентификатор устройства";
      loading.value = false;
      return;
    }

    const result = await getDeviceNotifications(id);
    if (current !== generation) return;
    result
      .map((page) => {
        raw.value = page.items;
      })
      .inspectErr((err) => {
        loadError.value = err;
      })
      .unwrapOr(undefined);
    loading.value = false;
  }

  const items = computed(() => {
    const names = new Map(
      sensors.value.map((sensor) => [sensor.id, sensor.displayName])
    );
    return raw.value.map((item) =>
      notificationItem(
        item,
        "",
        item.sensorId !== null ? (names.get(item.sensorId) ?? null) : null
      )
    );
  });

  watch(deviceId, () => {
    void load();
  });

  return { items, loading, loadError, reload: load };
}
