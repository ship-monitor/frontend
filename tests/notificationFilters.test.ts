import { describe, it, expect } from "vitest";
import type { DeviceNotification } from "@/data";
import {
  filterNotifications,
  notificationItem,
  notificationPlace,
  parseSeverityFilter,
  SEVERITY_FILTERS,
  type NotificationItem,
} from "@/utils/notifications";

const AT = Date.parse("2026-11-28T10:00:00Z");

const raw = (
  overrides: Partial<DeviceNotification> = {}
): DeviceNotification => ({
  id: "n1",
  deviceId: "d1",
  sensorId: "s1",
  type: "temperature-high",
  severity: "critical",
  occurredAt: AT,
  isRead: false,
  data: { temperature: -16.04 },
  ...overrides,
});

const item = (overrides: Partial<NotificationItem>): NotificationItem => ({
  id: "n1",
  deviceId: "d1",
  sensorId: "s1",
  deviceName: "Сектор 1",
  sensorName: "coldstat-sensor-1",
  title: "Температура выше нормы",
  severity: "critical",
  occurredAt: AT,
  value: "-16.0°C",
  ...overrides,
});

describe("notificationItem", () => {
  it("maps a sensor notification to a display item", () => {
    expect(notificationItem(raw(), "Сектор 1", "Морозилка")).toEqual(
      item({ sensorName: "Морозилка" })
    );
  });

  it("keeps unknown types as titles and drops values of device events", () => {
    const mapped = notificationItem(
      raw({ sensorId: null, type: "firmware-updated", severity: "info" }),
      "Хаб",
      null
    );

    expect(mapped).toMatchObject({
      sensorId: null,
      deviceName: "Хаб",
      sensorName: null,
      title: "firmware-updated",
      severity: "info",
      value: null,
    });
  });

  it("drops a temperature that is not a finite number", () => {
    const mapped = notificationItem(
      raw({ data: { temperature: Number.NaN } }),
      "Сектор 1",
      null
    );

    expect(mapped.value).toBeNull();
  });
});

describe("parseSeverityFilter", () => {
  it("accepts known severities", () => {
    expect(parseSeverityFilter("critical")).toBe("critical");
    expect(parseSeverityFilter("warning")).toBe("warning");
    expect(parseSeverityFilter("info")).toBe("info");
  });

  it("falls back to all for anything else", () => {
    expect(parseSeverityFilter("fatal")).toBe("all");
    expect(parseSeverityFilter(undefined)).toBe("all");
    expect(parseSeverityFilter(["critical"])).toBe("all");
  });

  it("offers every severity once plus the all option", () => {
    expect(SEVERITY_FILTERS.map((option) => option.value)).toEqual([
      "all",
      "critical",
      "warning",
      "info",
    ]);
    expect(SEVERITY_FILTERS.every((option) => option.label.length > 0)).toBe(
      true
    );
  });
});

describe("filterNotifications", () => {
  const items = [
    item({ id: "1", deviceId: "a", severity: "critical" }),
    item({ id: "2", deviceId: "a", severity: "warning" }),
    item({ id: "3", deviceId: "b", severity: "info" }),
  ];

  it("returns everything without filters", () => {
    expect(
      filterNotifications(items, { severity: "all", deviceId: "" })
    ).toEqual(items);
  });

  it("filters by severity", () => {
    expect(
      filterNotifications(items, { severity: "warning", deviceId: "" }).map(
        (entry) => entry.id
      )
    ).toEqual(["2"]);
  });

  it("filters by device", () => {
    expect(
      filterNotifications(items, { severity: "all", deviceId: "b" }).map(
        (entry) => entry.id
      )
    ).toEqual(["3"]);
  });

  it("combines both filters", () => {
    expect(
      filterNotifications(items, { severity: "critical", deviceId: "a" }).map(
        (entry) => entry.id
      )
    ).toEqual(["1"]);
    expect(
      filterNotifications(items, { severity: "critical", deviceId: "b" })
    ).toEqual([]);
  });
});

describe("notificationPlace", () => {
  it("joins sensor and device names", () => {
    expect(notificationPlace(item({}), true)).toBe(
      "coldstat-sensor-1 · Сектор 1"
    );
  });

  it("can skip the device and copes with a missing sensor", () => {
    expect(notificationPlace(item({}), false)).toBe("coldstat-sensor-1");
    expect(notificationPlace(item({ sensorName: null }), true)).toBe(
      "Сектор 1"
    );
  });
});
