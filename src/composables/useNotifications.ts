import { ref } from "vue";
import {
  getDeviceNotifications,
  getDeviceSensors,
  getUserDevices,
  type Device,
  type DeviceNotification,
} from "@/data";
import {
  notificationItem,
  type NotificationItem,
} from "@/utils/notifications";

export type { NotificationItem } from "@/utils/notifications";

export type NotificationDevice = { id: string; name: string };

const DEFAULT_PAGE_SIZE = 20;
const LOAD_ERROR = "Не удалось загрузить уведомления";

const deviceLabel = (device: Device): string =>
  device.name && device.name !== "Unknown Device"
    ? device.name
    : device.id.substring(0, 8);

const sensorKey = (deviceId: string, sensorId: string): string =>
  `${deviceId}/${sensorId}`;

const byNewest = (a: NotificationItem, b: NotificationItem): number =>
  b.occurredAt - a.occurredAt || a.id.localeCompare(b.id);

type Target = [deviceId: string, cursor: string | undefined];

export function useNotifications(options: { pageSize?: number } = {}) {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  const notifications = ref<NotificationItem[]>([]);
  const devices = ref<NotificationDevice[]>([]);
  const loading = ref(true);
  const loadError = ref("");
  const hasDevices = ref(true);
  const hasMore = ref(false);
  const loadingMore = ref(false);
  const loadMoreError = ref("");
  const searching = ref(false);

  let generation = 0;
  let cursors = new Map<string, string>();
  let deviceNames = new Map<string, string>();
  const sensorNames = new Map<string, string>();
  const sensorsRequested = new Set<string>();

  const deviceNameOf = (item: DeviceNotification): string =>
    deviceNames.get(item.deviceId) ?? item.deviceId.substring(0, 8);

  const sensorNameOf = (item: DeviceNotification): string | null =>
    item.sensorId !== null
      ? (sensorNames.get(sensorKey(item.deviceId, item.sensorId)) ?? null)
      : null;

  const toItems = (incoming: DeviceNotification[]): NotificationItem[] =>
    incoming.map((item) =>
      notificationItem(item, deviceNameOf(item), sensorNameOf(item))
    );

  const merge = (incoming: DeviceNotification[]) => {
    const known = new Set(notifications.value.map((item) => item.id));
    const fresh = toItems(incoming).filter((item) => !known.has(item.id));
    notifications.value = [...notifications.value, ...fresh].sort(byNewest);
  };

  async function resolveSensorNames(incoming: DeviceNotification[]) {
    const pending = new Set<string>();
    for (const item of incoming) {
      if (item.sensorId !== null && !sensorsRequested.has(item.deviceId)) {
        pending.add(item.deviceId);
      }
    }

    await Promise.all(
      [...pending].map(async (deviceId) => {
        sensorsRequested.add(deviceId);
        const result = await getDeviceSensors(deviceId);
        result
          .map((sensors) => {
            for (const sensor of sensors) {
              sensorNames.set(
                sensorKey(deviceId, sensor.id),
                sensor.displayName
              );
            }
          })
          .unwrapOr(undefined);
      })
    );
  }

  async function fetchPages(
    targets: Target[],
    next: Map<string, string>
  ): Promise<{ incoming: DeviceNotification[]; failedIds: string[] }> {
    const pages = await Promise.allSettled(
      targets.map(([deviceId, cursor]) =>
        getDeviceNotifications(deviceId, cursor, pageSize)
      )
    );

    const incoming: DeviceNotification[] = [];
    const failedIds: string[] = [];

    pages.forEach((page, index) => {
      const target = targets[index];
      if (!target) return;
      const [deviceId] = target;

      if (page.status === "rejected" || page.value.isErr) {
        failedIds.push(deviceId);
        return;
      }

      const { items, nextCursor, hasMore } = page.value.value;
      incoming.push(...items);
      if (hasMore && nextCursor) next.set(deviceId, nextCursor);
    });

    return { incoming, failedIds };
  }

  async function load() {
    const current = ++generation;
    loadError.value = "";
    loadingMore.value = false;
    loadMoreError.value = "";
    loading.value = notifications.value.length === 0;

    const devicesResult = await getUserDevices();
    if (current !== generation) return;
    if (devicesResult.isErr) {
      loadError.value = devicesResult.error;
      loading.value = false;
      return;
    }

    const list = devicesResult.value;
    hasDevices.value = list.length > 0;
    deviceNames = new Map(
      list.map((device) => [device.id, deviceLabel(device)])
    );
    devices.value = list.map((device) => ({
      id: device.id,
      name: deviceNames.get(device.id) ?? device.id,
    }));

    const nextCursors = new Map<string, string>();
    const targets: Target[] = list.map((device) => [device.id, undefined]);
    const { incoming, failedIds } = await fetchPages(targets, nextCursors);
    if (current !== generation) return;

    await resolveSensorNames(incoming);
    if (current !== generation) return;

    cursors = nextCursors;
    notifications.value = toItems(incoming).sort(byNewest);
    hasMore.value = nextCursors.size > 0;
    loadError.value =
      failedIds.length > 0 && incoming.length === 0 ? LOAD_ERROR : "";
    loading.value = false;
  }

  async function loadMore() {
    if (!hasMore.value || loading.value || loadingMore.value) return;

    const current = generation;
    loadingMore.value = true;
    loadMoreError.value = "";

    const targets: Target[] = [...cursors.entries()];
    const nextCursors = new Map<string, string>();
    const { incoming, failedIds } = await fetchPages(targets, nextCursors);
    if (current !== generation) return;

    await resolveSensorNames(incoming);
    if (current !== generation) return;

    for (const deviceId of failedIds) {
      const previous = cursors.get(deviceId);
      if (previous) nextCursors.set(deviceId, previous);
    }

    merge(incoming);
    cursors = nextCursors;
    hasMore.value = nextCursors.size > 0;
    loadingMore.value = false;
    loadMoreError.value = failedIds.length > 0 ? LOAD_ERROR : "";
  }

  async function searchUntil(found: () => boolean, maxPages: number) {
    searching.value = true;
    const current = generation;
    try {
      for (let page = 0; page < maxPages; page++) {
        if (
          found() ||
          !hasMore.value ||
          loading.value ||
          loadingMore.value ||
          current !== generation
        ) {
          return;
        }
        await loadMore();
        if (loadMoreError.value || current !== generation) return;
      }
    } finally {
      searching.value = false;
    }
  }

  let searchQueue: Promise<void> = Promise.resolve();

  const loadMoreUntil = (
    found: () => boolean,
    maxPages: number
  ): Promise<void> => {
    const run = searchQueue.then(() => searchUntil(found, maxPages));
    searchQueue = run.catch(() => undefined);
    return run;
  };

  return {
    notifications,
    devices,
    loading,
    loadError,
    hasDevices,
    hasMore,
    loadingMore,
    loadMoreError,
    searching,
    load,
    loadMore,
    loadMoreUntil,
  };
}
