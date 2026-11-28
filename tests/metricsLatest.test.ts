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
import {
  getDeviceMetricsSummary,
  getSensorMetricsSummary,
  getSensorTemperature,
  getSensorsWithTemperatures,
} from "@/data";

const mockedDeviceMetrics = vi.mocked(getDeviceMetricsByName);
const mockedSensorMetrics = vi.mocked(getSensorMetricsByName);
const mockedGetSensors = vi.mocked(getSensors);

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const PAGE_LIMIT = 1000;

const BATTERY = "battery-level";
const POWER = "power-connected";
const TEMPERATURE = "temperature";

type Sample = { name: string; value: number; timestamp: number };
type Query = { $from?: string; to?: string; limit?: number };

const series = (
  from: number,
  to: number,
  step: number,
  name: string
): Sample[] => {
  const points: Sample[] = [];
  for (let t = from; t <= to; t += step) {
    points.push({ name, value: points.length, timestamp: t });
  }
  return points;
};

const newest = (dataset: Sample[], name: string): Sample => {
  const points = dataset.filter((point) => point.name === name);
  return points[points.length - 1]!;
};

const page = (metric: string, points: Sample[]) => ({
  status: 200,
  data: {
    name: metric,
    type: "gauge",
    unit: "",
    values: points.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp).toISOString(),
    })),
  },
  headers: new Headers(),
});

const windowOf = (dataset: Sample[], metric: string, query: Query = {}) =>
  dataset
    .filter((point) => {
      const from = Date.parse(query.$from ?? "");
      const to = Date.parse(query.to ?? "");
      return (
        point.name === metric &&
        point.timestamp >= from &&
        point.timestamp <= to
      );
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, query.limit ?? 100);

const serveDevice =
  (dataset: Sample[]) =>
  (_deviceId: string, metric: string, query: Query = {}) =>
    Promise.resolve(page(metric, windowOf(dataset, metric, query)));

const serveSensor =
  (dataset: Sample[]) =>
  (_deviceId: string, _sensorId: string, metric: string, query: Query = {}) =>
    Promise.resolve(page(metric, windowOf(dataset, metric, query)));

const serverError = () =>
  Promise.resolve({
    status: 500,
    data: { type: "error", title: "Error", status: 500, detail: "boom" },
    headers: new Headers(),
  });

const spansOf = (calls: Array<unknown[]>, metric: string, metricAt = 1) =>
  calls
    .filter((call) => call[metricAt] === metric)
    .map((call) => {
      const query = call[metricAt + 1] as {
        $from: string;
        to: string;
        limit: number;
      };
      return Date.parse(query.to) - Date.parse(query.$from);
    });

describe("latest metric value", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("takes the newest point of a live device, not the oldest ones of the day", async () => {
    const base = Date.now() - SECOND;
    const dataset = [
      ...series(base - 20 * HOUR, base, 30 * SECOND, BATTERY),
      ...series(base - 20 * HOUR, base, 30 * SECOND, POWER),
    ];
    mockedDeviceMetrics.mockImplementation(serveDevice(dataset) as never);

    const result = await getDeviceMetricsSummary("d1");

    expect(result.isOk).toBe(true);
    result.map((summary) => {
      expect(summary.batteryLevel).toBe(newest(dataset, BATTERY).value);
      expect(summary.batteryUpdatedAt).toBe(newest(dataset, BATTERY).timestamp);
      expect(summary.powerUpdatedAt).toBe(newest(dataset, POWER).timestamp);
    });
    expect(spansOf(mockedDeviceMetrics.mock.calls, BATTERY)).toEqual([
      5 * MINUTE,
    ]);
    expect(mockedDeviceMetrics.mock.calls[0]?.[2]).toMatchObject({
      limit: PAGE_LIMIT,
    });
  });

  it("keeps the last known value of a device that went offline hours ago", async () => {
    const base = Date.now() - SECOND;
    const dataset = [
      ...series(base - 20 * HOUR, base - 3 * HOUR, 30 * SECOND, BATTERY),
      ...series(base - 20 * HOUR, base - 3 * HOUR, 30 * SECOND, POWER),
    ];
    mockedDeviceMetrics.mockImplementation(serveDevice(dataset) as never);

    const result = await getDeviceMetricsSummary("d1");

    result.map((summary) => {
      expect(summary.batteryLevel).toBe(newest(dataset, BATTERY).value);
      expect(summary.batteryUpdatedAt).toBe(newest(dataset, BATTERY).timestamp);
    });
    expect(spansOf(mockedDeviceMetrics.mock.calls, BATTERY)).toEqual([
      5 * MINUTE,
      8 * HOUR,
    ]);
  });

  it("looks through the whole day for a device offline since yesterday", async () => {
    const base = Date.now() - SECOND;
    const dataset = series(
      base - 23 * HOUR,
      base - 20 * HOUR,
      30 * SECOND,
      BATTERY
    );
    mockedDeviceMetrics.mockImplementation(serveDevice(dataset) as never);

    const result = await getDeviceMetricsSummary("d1");

    result.map((summary) => {
      expect(summary.batteryLevel).toBe(newest(dataset, BATTERY).value);
      expect(summary.powerConnected).toBeNull();
    });
    expect(spansOf(mockedDeviceMetrics.mock.calls, BATTERY)).toEqual([
      5 * MINUTE,
      8 * HOUR,
      DAY,
    ]);
  });

  it("pages forward when a window holds more points than the limit", async () => {
    const base = Date.now() - SECOND;
    const dataset = series(base - 120 * SECOND, base, 100, BATTERY);
    expect(dataset).toHaveLength(1201);
    mockedDeviceMetrics.mockImplementation(serveDevice(dataset) as never);

    const result = await getDeviceMetricsSummary("d1");

    result.map((summary) => {
      expect(summary.batteryLevel).toBe(newest(dataset, BATTERY).value);
    });
    expect(spansOf(mockedDeviceMetrics.mock.calls, BATTERY)).toHaveLength(2);
  });

  it("keeps a full page when no points follow it", async () => {
    const base = Date.now() - SECOND;
    const dataset = series(base - 99.9 * SECOND, base, 100, BATTERY);
    expect(dataset).toHaveLength(PAGE_LIMIT);
    mockedDeviceMetrics.mockImplementation(serveDevice(dataset) as never);

    const result = await getDeviceMetricsSummary("d1");

    result.map((summary) => {
      expect(summary.batteryLevel).toBe(newest(dataset, BATTERY).value);
      expect(summary.batteryUpdatedAt).toBe(newest(dataset, BATTERY).timestamp);
    });
  });

  it("reports no data when nothing was sent within a day", async () => {
    mockedDeviceMetrics.mockImplementation(serveDevice([]) as never);

    const result = await getDeviceMetricsSummary("d1");

    result.map((summary) => {
      expect(summary).toEqual({
        batteryLevel: null,
        batteryUpdatedAt: null,
        powerConnected: null,
        powerUpdatedAt: null,
      });
    });
  });

  it("keeps the other metric when one request fails", async () => {
    const base = Date.now() - SECOND;
    const dataset = series(base - HOUR, base, 30 * SECOND, POWER);
    mockedDeviceMetrics.mockImplementation(
      ((_id: string, metric: string, query: Query) =>
        metric === BATTERY
          ? serverError()
          : serveDevice(dataset)(_id, metric, query)) as never
    );

    const result = await getDeviceMetricsSummary("d1");

    result.map((summary) => {
      expect(summary.batteryLevel).toBeNull();
      expect(summary.powerConnected).toBe(false);
      expect(summary.powerUpdatedAt).toBe(newest(dataset, POWER).timestamp);
    });
  });

  it("reads the sensor summary from the sensor endpoint", async () => {
    const base = Date.now() - SECOND;
    const dataset = series(base - HOUR, base, 30 * SECOND, BATTERY);
    mockedSensorMetrics.mockImplementation(serveSensor(dataset) as never);

    const result = await getSensorMetricsSummary("d1", "s1");

    result.map((summary) => {
      expect(summary.batteryLevel).toBe(newest(dataset, BATTERY).value);
    });
    expect(mockedDeviceMetrics).not.toHaveBeenCalled();
    expect(mockedSensorMetrics.mock.calls[0]?.slice(0, 3)).toEqual([
      "d1",
      "s1",
      BATTERY,
    ]);
  });
});

describe("sensor temperature", () => {
  const lastOf = <T>(items: T[]): T | undefined => items[items.length - 1];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the newest reading with the hour of history before it", async () => {
    const base = Date.now() - SECOND;
    const dataset = series(base - 3 * HOUR, base, 30 * SECOND, TEMPERATURE);
    mockedSensorMetrics.mockImplementation(serveSensor(dataset) as never);

    const result = await getSensorTemperature("d1", "s1");

    const latest = newest(dataset, TEMPERATURE);
    expect(result.isOk).toBe(true);
    result.map((temperature) => {
      expect(temperature.current).toBe(latest.value);
      expect(temperature.updatedAt).toBe(latest.timestamp);
      expect(temperature.history).toHaveLength(121);
      expect(lastOf(temperature.history)?.timestamp).toBe(latest.timestamp);
      expect(temperature.history[0]?.timestamp).toBe(
        latest.timestamp - 120 * 30 * SECOND
      );
    });

    expect(mockedSensorMetrics.mock.calls[1]?.[3]).toMatchObject({
      $from: new Date(latest.timestamp - HOUR).toISOString(),
      to: new Date(latest.timestamp).toISOString(),
    });
  });

  it("ends the history at the last reading of an offline sensor", async () => {
    const base = Date.now() - SECOND;
    const dataset = series(
      base - 10 * HOUR,
      base - 3 * HOUR,
      30 * SECOND,
      TEMPERATURE
    );
    mockedSensorMetrics.mockImplementation(serveSensor(dataset) as never);

    const result = await getSensorTemperature("d1", "s1");

    const latest = newest(dataset, TEMPERATURE);
    result.map((temperature) => {
      expect(temperature.current).toBe(latest.value);
      expect(temperature.updatedAt).toBe(latest.timestamp);
      expect(lastOf(temperature.history)?.timestamp).toBe(latest.timestamp);
      expect(temperature.history).toHaveLength(121);
    });
    expect(
      spansOf(mockedSensorMetrics.mock.calls, TEMPERATURE, 2)
    ).toEqual([5 * MINUTE, 8 * HOUR, HOUR]);
  });

  it("returns an empty state for a sensor without readings", async () => {
    mockedSensorMetrics.mockImplementation(serveSensor([]) as never);

    const result = await getSensorTemperature("d1", "s1");

    result.map((temperature) => {
      expect(temperature).toEqual({ current: null, updatedAt: null, history: [] });
    });
  });

  it("returns the problem detail of a failed request", async () => {
    mockedSensorMetrics.mockImplementation((() => serverError()) as never);

    const result = await getSensorTemperature("d1", "s1");

    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toBe("boom"));
  });

  it("puts the newest reading on each sensor card", async () => {
    const base = Date.now() - SECOND;
    const dataset = series(base - 20 * HOUR, base, 30 * SECOND, TEMPERATURE);
    mockedSensorMetrics.mockImplementation(serveSensor(dataset) as never);
    mockedGetSensors.mockResolvedValue({
      status: 200,
      data: {
        sensors: [
          { id: "s1", name: "a", deviceId: "d1", displayName: "Морозилка" },
          { id: "s2", name: "b", deviceId: "d1", displayName: "Камера" },
        ],
      },
      headers: new Headers(),
    } as never);

    const result = await getSensorsWithTemperatures("d1");

    const expected = newest(dataset, TEMPERATURE).value;
    result.map((sensors) => {
      expect(sensors.map((sensor) => sensor.temperature)).toEqual([
        expected,
        expected,
      ]);
    });
  });
});
