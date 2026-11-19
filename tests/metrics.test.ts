import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/api", () => ({
  getDeviceMetricsByName: vi.fn(),
  getSensorMetricsByName: vi.fn(),
  getSensors: vi.fn(),
}));

import {
  getDeviceMetricsByName,
  getSensorMetricsByName,
  getSensors,
} from "@/api";
import { getDeviceMetricsSummary } from "@/data";

const mockedDeviceMetrics = vi.mocked(getDeviceMetricsByName);
const mockedSensorMetrics = vi.mocked(getSensorMetricsByName);
const mockedGetSensors = vi.mocked(getSensors);

const response = (status: number, data: unknown) => ({
  status,
  data,
  headers: new Headers(),
});

const point = (name: string, value: number, timestamp: string) => ({
  name,
  value,
  timestamp,
});

const sensorList = (ids: string[]) =>
  response(200, {
    sensors: ids.map((id) => ({
      id,
      name: id,
      deviceId: "d1",
      displayName: id,
    })),
  });

const mockHappyPath = () => {
  mockedGetSensors.mockImplementation(async () => sensorList(["s1", "s2"]) as never);
  mockedSensorMetrics.mockImplementation(
    async (_deviceId: string, sensorId: string, metric: string) => {
      if (metric !== "temperature") {
        return response(200, { values: [] }) as never;
      }
      if (sensorId !== "s1") {
        return response(200, { values: [] }) as never;
      }
      return response(200, {
        name: "temperature",
        values: [
          point("temperature", -16.5, "2026-11-17T10:00:00Z"),
          point("temperature", -16.8, "2026-11-17T10:00:30Z"),
        ],
      }) as never;
    }
  );
  mockedDeviceMetrics.mockImplementation(
    async (_deviceId: string, metric: string) => {
      if (metric === "battery-level") {
        return response(200, {
          name: "battery-level",
          values: [point("battery-level", 87.5, "2026-11-17T10:00:40Z")],
        }) as never;
      }
      return response(200, {
        name: "power-connected",
        values: [point("power-connected", 0, "2026-11-17T10:00:40Z")],
      }) as never;
    }
  );
};

describe("device metrics summary", () => {
  beforeEach(() => {
    mockedDeviceMetrics.mockReset();
    mockedSensorMetrics.mockReset();
    mockedGetSensors.mockReset();
  });

  it("builds the summary from device and sensor metrics", async () => {
    mockHappyPath();

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.temperature.history).toHaveLength(2);
      expect(summary.temperature.current).toBe(-16.8);
      expect(summary.temperature.updatedAt).toBe(Date.parse("2026-11-17T10:00:30Z"));
      expect(summary.batteryLevel).toBe(87.5);
      expect(summary.powerConnected).toBe(false);
    });
  });

  it("takes temperature from the first sensor that has data", async () => {
    mockedGetSensors.mockImplementation(async () => sensorList(["s1", "s2"]) as never);
    mockedSensorMetrics.mockImplementation(
      async (_deviceId: string, sensorId: string, metric: string) => {
        if (metric !== "temperature" || sensorId !== "s2") {
          return response(200, { values: [] }) as never;
        }
        return response(200, {
          values: [point("temperature", -15.2, "2026-11-17T11:00:00Z")],
        }) as never;
      }
    );
    mockedDeviceMetrics.mockImplementation(async () => {
      return response(200, { values: [] }) as never;
    });

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.temperature.current).toBe(-15.2);
    });
    expect(mockedSensorMetrics).toHaveBeenCalledTimes(2);
  });

  it("passes metric names and time range to both endpoints", async () => {
    mockHappyPath();

    await getDeviceMetricsSummary("d1");
    const deviceMetrics = mockedDeviceMetrics.mock.calls.map((c) => c[1]);
    expect(deviceMetrics).toEqual(
      expect.arrayContaining(["battery-level", "power-connected"])
    );
    expect(mockedSensorMetrics.mock.calls[0]?.[2]).toBe("temperature");
    for (const call of mockedDeviceMetrics.mock.calls) {
      const range = call[2]!;
      expect(Number.isNaN(Date.parse(range.$from!))).toBe(false);
      expect(Number.isNaN(Date.parse(range.to!))).toBe(false);
    }
    const sensorRange = mockedSensorMetrics.mock.calls[0]![3]!;
    expect(Number.isNaN(Date.parse(sensorRange.$from!))).toBe(false);
    expect(Number.isNaN(Date.parse(sensorRange.to!))).toBe(false);
    expect(sensorRange.limit).toBe(1000);
  });

  it("keeps nulls for battery and power when those requests fail", async () => {
    mockHappyPath();
    mockedDeviceMetrics.mockImplementation(
      async () => response(500, null) as never
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.temperature.current).toBe(-16.8);
      expect(summary.batteryLevel).toBeNull();
      expect(summary.powerConnected).toBeNull();
    });
  });

  it("keeps empty temperature when a sensor metrics request fails", async () => {
    mockedGetSensors.mockImplementation(async () => sensorList(["s1"]) as never);
    mockedSensorMetrics.mockRejectedValue(new Error("network down") as never);
    mockedDeviceMetrics.mockImplementation(async () => {
      return response(200, {
        values: [point("battery-level", 90, "2026-11-17T10:00:40Z")],
      }) as never;
    });

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.temperature.current).toBeNull();
      expect(summary.temperature.history).toHaveLength(0);
      expect(summary.batteryLevel).toBe(90);
    });
  });

  it("returns Err when the sensors list request fails on transport", async () => {
    mockedGetSensors.mockRejectedValue(new Error("network down") as never);

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isErr).toBe(true);
  });

  it("returns Err when the sensors list request fails with a problem", async () => {
    mockedGetSensors.mockImplementation(
      async () => response(503, null) as never
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isErr).toBe(true);
  });
});
