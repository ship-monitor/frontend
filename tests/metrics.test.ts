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

const mockMetrics = () =>
  mockedGetDeviceMetrics.mockImplementation(
    async (_deviceId: string, _from: string, _to: string, metric: string) => {
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

  it("fetches battery and power metrics and builds the summary", async () => {
    mockMetrics();

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.batteryLevel).toBe(87.5);
      expect(summary.powerConnected).toBe(false);
    });
    expect(mockedGetDeviceMetrics).toHaveBeenCalledTimes(2);
  });

  it("passes the metric names and time range to the server", async () => {
    mockMetrics();

    await getDeviceMetricsSummary("d1");
    const names = mockedGetDeviceMetrics.mock.calls.map((c) => c[3]);
    expect(names).toEqual(
      expect.arrayContaining(["battery-level", "power-connected"])
    );
    for (const call of mockedGetDeviceMetrics.mock.calls) {
      expect(Number.isNaN(Date.parse(call[1]))).toBe(false);
      expect(Number.isNaN(Date.parse(call[2]))).toBe(false);
    }
  });

  it("keeps nulls for battery and power when those requests fail", async () => {
    mockedGetDeviceMetrics.mockImplementation(
      async () => response(500, null) as never
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.batteryLevel).toBeNull();
      expect(summary.powerConnected).toBeNull();
    });
  });
});
