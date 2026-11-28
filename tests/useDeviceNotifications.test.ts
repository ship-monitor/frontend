import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { Result } from "true-myth";

vi.mock("@/data", () => ({
  getDeviceNotifications: vi.fn(),
}));

import {
  getDeviceNotifications,
  type DeviceNotification,
  type NotificationPage,
} from "@/data";
import { useDeviceNotifications } from "@/composables/useDeviceNotifications";

const mocked = vi.mocked(getDeviceNotifications);

const AT = Date.parse("2026-11-28T10:00:00Z");

const raw = (id: string, deviceId: string): DeviceNotification => ({
  id,
  deviceId,
  sensorId: `${deviceId}-s1`,
  type: "temperature-high",
  severity: "critical",
  occurredAt: AT,
  isRead: false,
  data: { temperature: -16 },
});

const firstPage = (
  ...items: DeviceNotification[]
): Result<NotificationPage, string> =>
  Result.ok({ items, nextCursor: null, hasMore: false });

const noSensors = computed(
  (): Array<{ id: string; displayName: string }> => []
);

describe("useDeviceNotifications", () => {
  beforeEach(() => {
    mocked.mockReset();
  });

  it("loads the first page and names sensors from their list", async () => {
    mocked.mockResolvedValue(firstPage(raw("n1", "d1"), raw("n2", "d1")));
    const sensors = computed(() => [{ id: "d1-s1", displayName: "Морозилка" }]);

    const feed = useDeviceNotifications(
      computed(() => "d1"),
      sensors
    );
    expect(feed.loading.value).toBe(true);
    await feed.reload();

    expect(mocked).toHaveBeenCalledTimes(1);
    expect(mocked).toHaveBeenCalledWith("d1");
    expect(feed.loading.value).toBe(false);
    expect(feed.loadError.value).toBe("");
    expect(feed.items.value).toMatchObject([
      { id: "n1", sensorName: "Морозилка", title: "Температура выше нормы" },
      { id: "n2", sensorName: "Морозилка" },
    ]);
  });

  it("names sensors once their list arrives", async () => {
    mocked.mockResolvedValue(firstPage(raw("n1", "d1")));
    const sensors = ref<Array<{ id: string; displayName: string }>>([]);

    const feed = useDeviceNotifications(
      computed(() => "d1"),
      computed(() => sensors.value)
    );
    await feed.reload();
    expect(feed.items.value[0]?.sensorName).toBeNull();

    sensors.value = [{ id: "d1-s1", displayName: "Морозилка" }];
    expect(feed.items.value[0]?.sensorName).toBe("Морозилка");
  });

  it("reloads on device change and drops the answer of the previous one", async () => {
    let release: (page: Result<NotificationPage, string>) => void = () => {};
    mocked.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        })
    );
    mocked.mockResolvedValue(firstPage(raw("n2", "d2")));
    const deviceId = ref("d1");

    const feed = useDeviceNotifications(
      computed(() => deviceId.value),
      noSensors
    );
    void feed.reload();

    deviceId.value = "d2";
    await vi.waitFor(() =>
      expect(feed.items.value.map((i) => i.id)).toEqual(["n2"])
    );

    release(firstPage(raw("stale", "d1")));
    await Promise.resolve();
    await Promise.resolve();

    expect(feed.items.value.map((i) => i.id)).toEqual(["n2"]);
    expect(feed.loading.value).toBe(false);
  });

  it("reports load errors", async () => {
    mocked.mockResolvedValue(Result.err("Нет доступа"));

    const feed = useDeviceNotifications(
      computed(() => "d1"),
      noSensors
    );
    await feed.reload();

    expect(feed.loadError.value).toBe("Нет доступа");
    expect(feed.items.value).toEqual([]);
    expect(feed.loading.value).toBe(false);
  });

  it("rejects an empty device id without a request", async () => {
    const feed = useDeviceNotifications(
      computed(() => ""),
      noSensors
    );
    await feed.reload();

    expect(mocked).not.toHaveBeenCalled();
    expect(feed.loadError.value).toBe("Некорректный идентификатор устройства");
    expect(feed.loading.value).toBe(false);
  });
});
