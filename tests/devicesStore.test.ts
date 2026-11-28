import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { Result } from "true-myth";

vi.mock("@/data", () => ({
  getUserDevices: vi.fn(),
  getDeviceOnlineStatus: vi.fn(),
  getDeviceMetricsSummary: vi.fn(),
  getSensorsWithTemperatures: vi.fn(),
}));

import {
  getDeviceMetricsSummary,
  getDeviceOnlineStatus,
  getUserDevices,
  type DeviceOnlineStatus,
  type MetricsSummary,
} from "@/data";
import { useDevicesStore } from "@/stores/devicesStore";

const mockedDevices = vi.mocked(getUserDevices);
const mockedStatus = vi.mocked(getDeviceOnlineStatus);
const mockedMetrics = vi.mocked(getDeviceMetricsSummary);

const online = (value: boolean): Result<DeviceOnlineStatus, string> =>
  Result.ok({ online: value, lastSeen: Date.now() });

const summary = (batteryLevel: number): Result<MetricsSummary, string> =>
  Result.ok({
    batteryLevel,
    batteryUpdatedAt: Date.now(),
    powerConnected: false,
    powerUpdatedAt: Date.now(),
  });

describe("devicesStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("does not refetch metrics of a device while it stays offline", async () => {
    mockedDevices.mockResolvedValue(Result.ok([{ id: "d1", name: "Fridge" }]));
    mockedStatus.mockResolvedValue(online(true));
    mockedMetrics.mockResolvedValue(summary(80));

    const store = useDevicesStore();
    await store.load();
    expect(store.devices[0]).toMatchObject({
      status: "online",
      batteryLevel: 80,
    });
    expect(mockedMetrics).toHaveBeenCalledTimes(1);

    mockedStatus.mockResolvedValue(online(false));
    await store.load();
    expect(mockedMetrics).toHaveBeenCalledTimes(2);
    expect(store.devices[0]).toMatchObject({
      status: "offline",
      batteryLevel: 80,
    });

    await store.load();
    await store.load();
    expect(mockedMetrics).toHaveBeenCalledTimes(2);
    expect(store.devices[0]).toMatchObject({ batteryLevel: 80 });

    mockedStatus.mockResolvedValue(online(true));
    mockedMetrics.mockResolvedValue(summary(70));
    await store.load();
    expect(mockedMetrics).toHaveBeenCalledTimes(3);
    expect(store.devices[0]).toMatchObject({
      status: "online",
      batteryLevel: 70,
    });
  });

  it("fetches metrics for a device that is already offline", async () => {
    mockedDevices.mockResolvedValue(Result.ok([{ id: "d2", name: "Freezer" }]));
    mockedStatus.mockResolvedValue(online(false));
    mockedMetrics.mockResolvedValue(summary(55));

    const store = useDevicesStore();
    await store.load();

    expect(mockedMetrics).toHaveBeenCalledTimes(1);
    expect(store.devices[0]).toMatchObject({
      status: "offline",
      batteryLevel: 55,
    });
  });

  it("fetches metrics again when the status becomes unknown", async () => {
    mockedDevices.mockResolvedValue(Result.ok([{ id: "d3", name: "Truck" }]));
    mockedStatus.mockResolvedValue(online(false));
    mockedMetrics.mockResolvedValue(summary(40));

    const store = useDevicesStore();
    await store.load();
    await store.load();
    expect(mockedMetrics).toHaveBeenCalledTimes(1);

    mockedStatus.mockResolvedValue(Result.err("no heartbeat"));
    mockedMetrics.mockResolvedValue(summary(35));
    await store.load();

    expect(mockedMetrics).toHaveBeenCalledTimes(2);
    expect(store.devices[0]).toMatchObject({ batteryLevel: 35 });
  });
});
