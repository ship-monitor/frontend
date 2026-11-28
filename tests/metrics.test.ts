import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/api", () => ({
  getDeviceMetricsByName: vi.fn(),
  getSensorMetricsByName: vi.fn(),
}));

import {
  getDeviceMetricsByName,
  getSensorMetricsByName,
} from "@/api";
import { getDeviceMetricsSummary, getSensorTemperature } from "@/data";

const mockedDeviceMetrics = vi.mocked(getDeviceMetricsByName);
const mockedSensorMetrics = vi.mocked(getSensorMetricsByName);

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

describe("device metrics summary", () => {
  beforeEach(() => {
    mockedDeviceMetrics.mockReset();
  });

  it("builds the summary from battery and power metrics", async () => {
    mockedDeviceMetrics.mockImplementation(
      async (_deviceId: string, metric: string) => {
        if (metric === "battery-level") {
          return response(200, {
            name: "battery-level",
            values: [
              point("battery-level", 87.5, "2026-11-17T10:00:30Z"),
              point("battery-level", 86.0, "2026-11-17T10:00:40Z"),
            ],
          }) as never;
        }
        return response(200, {
          name: "power-connected",
          values: [point("power-connected", 1, "2026-11-17T10:00:40Z")],
        }) as never;
      }
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.batteryLevel).toBe(86.0);
      expect(summary.batteryUpdatedAt).toBe(
        Date.parse("2026-11-17T10:00:40Z")
      );
      expect(summary.powerConnected).toBe(true);
      expect(summary.powerUpdatedAt).toBe(Date.parse("2026-11-17T10:00:40Z"));
    });
  });

  it("passes metric names, time range and limit", async () => {
    mockedDeviceMetrics.mockImplementation(
      async () => response(200, { values: [] }) as never
    );

    await getDeviceMetricsSummary("d1");
    const metrics = mockedDeviceMetrics.mock.calls.map((call) => call[1]);
    expect(metrics).toEqual(
      expect.arrayContaining(["battery-level", "power-connected"])
    );
    for (const call of mockedDeviceMetrics.mock.calls) {
      const range = call[2]!;
      expect(Number.isNaN(Date.parse(range.$from!))).toBe(false);
      expect(Number.isNaN(Date.parse(range.to!))).toBe(false);
      expect(range.limit).toBe(1000);
    }
  });

  it("keeps nulls when a metric request fails", async () => {
    mockedDeviceMetrics.mockImplementation(
      async (_deviceId: string, metric: string) => {
        if (metric === "battery-level") {
          return response(200, {
            values: [point("battery-level", 90, "2026-11-17T10:00:40Z")],
          }) as never;
        }
        return response(500, null) as never;
      }
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.batteryLevel).toBe(90);
      expect(summary.powerConnected).toBeNull();
    });
  });

  it("returns an empty summary when transport fails on both metrics", async () => {
    mockedDeviceMetrics.mockRejectedValue(new Error("network down") as never);

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.batteryLevel).toBeNull();
      expect(summary.powerConnected).toBeNull();
    });
  });
});

describe("sensor temperature", () => {
  beforeEach(() => {
    mockedSensorMetrics.mockReset();
  });

  it("returns sorted history with the last point as current", async () => {
    mockedSensorMetrics.mockImplementation(
      async () =>
        response(200, {
          name: "temperature",
          values: [
            point("temperature", -16.5, "2026-11-17T10:01:00Z"),
            point("temperature", -16.8, "2026-11-17T10:00:00Z"),
            point("temperature", -16.2, "2026-11-17T10:02:00Z"),
          ],
        }) as never
    );

    const result = await getSensorTemperature("d1", "s1");
    expect(result.isOk).toBe(true);
    result.map((temperature) => {
      expect(temperature.history).toHaveLength(3);
      expect(temperature.history[0]!.value).toBe(-16.8);
      expect(temperature.current).toBe(-16.2);
      expect(temperature.updatedAt).toBe(Date.parse("2026-11-17T10:02:00Z"));
    });
  });

  it("filters out other metrics from the response", async () => {
    mockedSensorMetrics.mockImplementation(
      async () =>
        response(200, {
          values: [
            point("battery-level", 100, "2026-11-17T10:00:00Z"),
            point("temperature", -16.0, "2026-11-17T10:00:30Z"),
          ],
        }) as never
    );

    const result = await getSensorTemperature("d1", "s1");
    expect(result.isOk).toBe(true);
    result.map((temperature) => {
      expect(temperature.history).toHaveLength(1);
      expect(temperature.current).toBe(-16.0);
    });
  });

  it("returns empty temperature when there are no points", async () => {
    mockedSensorMetrics.mockImplementation(
      async () => response(200, { values: [] }) as never
    );

    const result = await getSensorTemperature("d1", "s1");
    expect(result.isOk).toBe(true);
    result.map((temperature) => {
      expect(temperature.current).toBeNull();
      expect(temperature.history).toHaveLength(0);
    });
  });

  it("returns Err when the request fails on transport", async () => {
    mockedSensorMetrics.mockRejectedValue(new Error("network down") as never);

    const result = await getSensorTemperature("d1", "s1");
    expect(result.isErr).toBe(true);
  });

  it("returns Err on a problem response", async () => {
    mockedSensorMetrics.mockImplementation(
      async () => response(503, null) as never
    );

    const result = await getSensorTemperature("d1", "s1");
    expect(result.isErr).toBe(true);
  });
});
