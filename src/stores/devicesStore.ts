import { defineStore } from "pinia";
import {
  getDeviceMetricsSummary,
  getUserDevices,
  type DeviceMetricsSummary,
} from "@/data";
import { useAuthStore } from "@/stores/authStore";
import { fetchOnlineStatus } from "@/utils/utils";
import { resolveDisplayName } from "@/utils/deviceSettings";
import safeStorage from "@/utils/storage";

export type DeviceStatus = "online" | "offline" | "error" | "unknown";

export interface DeviceSummary {
  id: string;
  name: string;
  displayName: string;
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

async function fetchMetrics(
  deviceId: string
): Promise<DeviceMetricsSummary | null> {
  return (await getDeviceMetricsSummary(deviceId))
    .inspectErr((err) => console.error("Failed to load device metrics: %s", err))
    .unwrapOr(null);
}

function readPingHistory(deviceId: string): boolean[] {
  const stored = safeStorage.getJson(`device_pings_${deviceId}`);
  if (Array.isArray(stored)) {
    const history = stored.filter((p): p is boolean => typeof p === "boolean");
    if (history.length > 0) return history.slice(-PING_HISTORY_LENGTH);
  }
  return [];
}

function appendPingResult(deviceId: string, ok: boolean): boolean[] {
  const history = readPingHistory(deviceId);
  history.push(ok);
  if (history.length > PING_HISTORY_LENGTH) history.shift();
  safeStorage.setItem(
    `device_pings_${deviceId}`,
    JSON.stringify(history.slice(-PING_HISTORY_LENGTH))
  );
  return history;
}

function resolveStatus(
  ok: boolean | null,
  pingHistory: boolean[],
  previous: DeviceStatus | undefined
): DeviceStatus {
  if (ok === null) {
    return previous ?? "unknown";
  }
  const lastPings = pingHistory.slice(-5);
  if (lastPings.length >= 3 && lastPings.every((p) => !p)) {
    return "error";
  }
  return ok ? "online" : "offline";
}

export const useDevicesStore = defineStore("devices-store", {
  state: () => ({
    devices: [] as DeviceSummary[],
    loading: true,
    loadError: null as string | null,
    autoRefreshActive: false,
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
        devicesResult.value.map(async (device) => ({
          device,
          ok: await fetchOnlineStatus(device.id),
          metrics: await fetchMetrics(device.id),
        }))
      );

      const previousStatus = new Map(
        this.devices.map((device) => [device.id, device.status])
      );

      const nextDevices: DeviceSummary[] = [];
      for (const { device, ok, metrics } of snapshot) {
        const pingHistory =
          ok !== null
            ? appendPingResult(device.id, ok)
            : readPingHistory(device.id);
        nextDevices.push({
          id: device.id,
          name: device.name,
          displayName: resolveDisplayName(device.id, device.name),
          status: resolveStatus(ok, pingHistory, previousStatus.get(device.id)),
          batteryLevel: metrics?.batteryLevel ?? null,
          powerConnected: metrics?.powerConnected ?? null,
        });
      }

      this.devices = nextDevices;
      refreshInFlight = false;
      this.loading = false;
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
