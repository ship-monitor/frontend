import { defineStore } from "pinia";
import {
  getDeviceMetricsSummary,
  getDeviceOnlineStatus,
  getSensorsWithTemperatures,
  getUserDevices,
  type SensorWithTemperature,
} from "@/data";
import { useAuthStore } from "@/stores/authStore";
import safeStorage from "@/utils/storage";

export type DeviceStatus = "online" | "offline" | "error" | "unknown";

export interface DeviceSummary {
  id: string;
  name: string;
  status: DeviceStatus;
  batteryLevel: number | null;
  powerConnected: boolean | null;
}

const MIN_REFRESH_MS = 5000;
const MAX_REFRESH_MS = 300000;
const DEFAULT_REFRESH_MS = 10000;

const PING_HISTORY_LENGTH = 10;

let refreshTimer: ReturnType<typeof setInterval> | null = null;
let refreshInFlight = false;

// История пингов живёт в памяти сессии: переживает навигацию, но не
// переносится между запусками браузера.
const pingHistory = new Map<string, boolean[]>();

function appendPingResult(deviceId: string, ok: boolean): boolean[] {
  const history = [...(pingHistory.get(deviceId) ?? []), ok].slice(
    -PING_HISTORY_LENGTH
  );
  pingHistory.set(deviceId, history);
  return history;
}

function resolveStatus(
  ok: boolean | null,
  history: boolean[],
  previous: DeviceStatus | undefined
): DeviceStatus {
  if (ok === null) {
    return previous ?? "unknown";
  }
  const lastPings = history.slice(-5);
  if (lastPings.length >= 3 && lastPings.every((p) => !p)) {
    return "error";
  }
  return ok ? "online" : "offline";
}

function displayName(id: string, name: string): string {
  if (name && name !== "Unknown Device") return name;
  return id.substring(0, 8);
}

export const useDevicesStore = defineStore("devices-store", {
  state: () => ({
    devices: [] as DeviceSummary[],
    loading: true,
    loadError: null as string | null,
    autoRefreshActive: false,
    sensorsByDevice: {} as Record<string, SensorWithTemperature[]>,
    sensorsLoaded: false,
  }),
  actions: {
    async load() {
      if (refreshInFlight) return;
      refreshInFlight = true;

      const devicesResult = await getUserDevices();
      if (devicesResult.isErr) {
        this.loadError = devicesResult.error;
        refreshInFlight = false;
        this.loading = false;
        return;
      }
      this.loadError = null;

      const snapshot = await Promise.all(
        devicesResult.value.map(async (device) => {
          const [status, metrics] = await Promise.all([
            getDeviceOnlineStatus(device.id),
            getDeviceMetricsSummary(device.id).then((r) =>
              r.isErr
                ? (console.error("Failed to load device metrics: %s", r.error),
                  null)
                : r.value
            ),
          ]);
          return { device, status, metrics };
        })
      );

      const previousStatus = new Map(
        this.devices.map((device) => [device.id, device.status])
      );

      this.devices = snapshot.map(({ device, status, metrics }) => {
        const ok = status.isErr ? null : status.value.online;
        const history =
          ok !== null ? appendPingResult(device.id, ok) : (pingHistory.get(device.id) ?? []);
        return {
          id: device.id,
          name: displayName(device.id, device.name),
          status: resolveStatus(ok, history, previousStatus.get(device.id)),
          batteryLevel: metrics?.batteryLevel ?? null,
          powerConnected: metrics?.powerConnected ?? null,
        };
      });

      refreshInFlight = false;
      this.loading = false;
    },

    // Список датчиков меняется редко: грузим отдельно от авто-обновления
    // статусов, повторно — при смене набора устройств.
    async loadSensors() {
      const results = await Promise.all(
        this.devices.map(async (device) => {
          const result = await getSensorsWithTemperatures(device.id);
          return { id: device.id, result } as const;
        })
      );

      const map: Record<string, SensorWithTemperature[]> = {};
      for (const { id, result } of results) {
        result
          .map((list) => {
            map[id] = list;
          })
          .inspectErr((err) => {
            console.error("Failed to load device sensors: %s", err);
          })
          .unwrapOr(undefined);
      }
      this.sensorsByDevice = map;
      this.sensorsLoaded = true;
    },

    startAutoRefresh() {
      this.stopAutoRefresh();
      if (!useAuthStore().isAuthenticated) return;

      const parsed = safeStorage.getJson("app-settings");
      const settings =
        parsed && typeof parsed === "object"
          ? (parsed as Record<string, unknown>)
          : {};
      const autoRefresh = settings["autoRefresh"] !== false;
      const rawInterval = Number(settings["interval"]);
      const interval =
        Number.isFinite(rawInterval) && rawInterval > 0
          ? Math.min(Math.max(rawInterval, MIN_REFRESH_MS), MAX_REFRESH_MS)
          : DEFAULT_REFRESH_MS;

      if (autoRefresh) {
        this.autoRefreshActive = true;
        refreshTimer = setInterval(() => {
          void this.load();
        }, interval);
      }
    },

    stopAutoRefresh() {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      this.autoRefreshActive = false;
    },
  },
});
