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

const metric = (name: string, value: number, timestamp: string) => ({
  name,
  value,
  timestamp,
});

describe("device metrics summary", () => {
  beforeEach(() => {
    mockedGetDeviceMetrics.mockReset();
  });

  it("splits mixed metric values into temperature, battery and power", async () => {
    mockedGetDeviceMetrics.mockResolvedValue(
      response(200, {
        name: "temperature",
        values: [
          metric("temperature", -16.5, "2026-11-17T10:00:00Z"),
          metric("battery-level", 100, "2026-11-17T10:00:10Z"),
          metric("power-connected", 1, "2026-11-17T10:00:10Z"),
          metric("temperature", -16.8, "2026-11-17T10:00:30Z"),
          metric("power-connected", 0, "2026-11-17T10:00:40Z"),
          metric("battery-level", 87.5, "2026-11-17T10:00:40Z"),
        ],
      }) as never
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.temperature.history).toHaveLength(2);
      expect(summary.temperature.current).toBe(-16.8);
      expect(summary.batteryLevel).toBe(87.5);
      expect(summary.powerConnected).toBe(false);
    });
  });

  it("keeps nulls when only temperature is present", async () => {
    mockedGetDeviceMetrics.mockResolvedValue(
      response(200, {
        name: "temperature",
        values: [metric("temperature", -16.1, "2026-11-17T10:00:00Z")],
      }) as never
    );

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.temperature.current).toBe(-16.1);
      expect(summary.batteryLevel).toBeNull();
      expect(summary.powerConnected).toBeNull();
    });
  });

  it("returns Err for malformed payload", async () => {
    mockedGetDeviceMetrics.mockResolvedValue(response(200, {}) as never);

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isErr).toBe(true);
  });

  it("returns Err on transport failure", async () => {
    mockedGetDeviceMetrics.mockRejectedValue(new Error("network down") as never);

    const result = await getDeviceMetricsSummary("d1");
    expect(result.isErr).toBe(true);
  });
});
