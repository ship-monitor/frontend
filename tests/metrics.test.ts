import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/api", () => ({
  getDeviceMetrics: vi.fn(),
}));

import { getDeviceMetrics } from "@/api";
import { getDeviceMetricsSummary } from "@/data";

const mockedGetDeviceMetrics = vi.mocked(getDeviceMetrics);

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

const mockMetricsByname = () =>
  mockedGetDeviceMetrics.mockImplementation(
    async (_deviceId: string, _from: string, _to: string, metric: string) => {
      if (metric === "temperature") {
        return response(200, {
          name: "temperature",
          values: [
            point("temperature", -16.5, "2026-11-17T10:00:00Z"),
            point("temperature", -16.8, "2026-11-17T10:00:30Z"),
          ],
        }) as never;
      }
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

describe("device metrics summary", () => {
  beforeEach(() => {
    mockedGetDeviceMetrics.mockReset();
  });

  it("fetches each metric separately and builds the summary", async () => {
    mockMetricsByname();

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.temperature.history).toHaveLength(2);
      expect(summary.temperature.current).toBe(-16.8);
      expect(summary.batteryLevel).toBe(87.5);
      expect(summary.powerConnected).toBe(false);
    });
    expect(mockedGetDeviceMetrics).toHaveBeenCalledTimes(3);
  });

  it("passes the metric name and time range to the server", async () => {
    mockMetricsByname();

    await getDeviceMetricsSummary("d1");
    const names = mockedGetDeviceMetrics.mock.calls.map((c) => c[3]);
    expect(names).toEqual(
      expect.arrayContaining([
        "temperature",
        "battery-level",
        "power-connected",
      ])
    );
    for (const call of mockedGetDeviceMetrics.mock.calls) {
      expect(Number.isNaN(Date.parse(call[1]))).toBe(false);
      expect(Number.isNaN(Date.parse(call[2]))).toBe(false);
    }
  });

  it("keeps nulls for battery and power when those requests fail", async () => {
    mockedGetDeviceMetrics.mockImplementation(
      async (_deviceId: string, _from: string, _to: string, metric: string) => {
        if (metric !== "temperature") {
          return response(500, null) as never;
        }
        return response(200, {
          name: "temperature",
          values: [point("temperature", -16.1, "2026-11-17T10:00:00Z")],
        }) as never;
      }
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.temperature.current).toBe(-16.1);
      expect(summary.batteryLevel).toBeNull();
      expect(summary.powerConnected).toBeNull();
    });
  });

  it("returns Err when the temperature request fails on transport", async () => {
    mockedGetDeviceMetrics.mockRejectedValue(new Error("network down") as never);

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isErr).toBe(true);
  });

  it("returns Err when the temperature request fails with a problem", async () => {
    mockedGetDeviceMetrics.mockImplementation(
      async (_deviceId: string, _from: string, _to: string, metric: string) => {
        if (metric !== "temperature") {
          return response(200, { values: [] }) as never;
        }
        return response(503, null) as never;
      }
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isErr).toBe(true);
  });
});
