import { describe, it, expect, vi, beforeEach } from "vitest";
import { Result } from "true-myth";

vi.mock("@/data", () => ({
  getUserDevices: vi.fn(),
  getDeviceSensors: vi.fn(),
  getDeviceNotifications: vi.fn(),
}));

import {
  getDeviceNotifications,
  getDeviceSensors,
  getUserDevices,
  type Device,
  type DeviceNotification,
  type Sensor,
} from "@/data";
import { useNotifications } from "@/composables/useNotifications";

const mockedDevices = vi.mocked(getUserDevices);
const mockedSensors = vi.mocked(getDeviceSensors);
const mockedNotifications = vi.mocked(getDeviceNotifications);

const raw = (
  id: string,
  deviceId: string,
  occurredAt: string,
  overrides: Partial<DeviceNotification> = {}
): DeviceNotification => ({
  id,
  deviceId,
  sensorId: `${deviceId}-s1`,
  type: "temperature-high",
  severity: "critical",
  occurredAt: Date.parse(occurredAt),
  isRead: false,
  data: { temperature: -15.9 },
  ...overrides,
});

const page = (items: DeviceNotification[], nextCursor: string | null = null) =>
  Result.ok<DeviceNotification[], string>(items).map((list) => ({
    items: list,
    nextCursor,
    hasMore: nextCursor !== null,
  }));

const devices = (...list: Array<{ id: string; name: string }>) =>
  Result.ok<Device[], string>(list);

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSensors.mockResolvedValue(Result.ok<Sensor[], string>([]));
  });

  it("merges devices by time and resolves device and sensor names", async () => {
    mockedDevices.mockResolvedValue(
      devices(
        { id: "a", name: "Холодильник" },
        { id: "b", name: "Unknown Device" }
      )
    );
    mockedNotifications.mockImplementation(async (deviceId: string) =>
      deviceId === "a"
        ? page(
            [
              raw("a1", "a", "2026-11-27T10:00:00Z"),
              raw("a2", "a", "2026-11-27T09:00:00Z"),
            ],
            "cursor-a"
          )
        : page([
            raw("b1", "b", "2026-11-27T09:30:00Z", {
              sensorId: null,
              type: "firmware-updated",
              severity: "info",
              data: {},
            }),
          ])
    );
    mockedSensors.mockResolvedValue(
      Result.ok<Sensor[], string>([
        { id: "a-s1", name: "t", deviceId: "a", displayName: "Морозилка" },
      ])
    );

    const feed = useNotifications();
    await feed.load();

    expect(feed.notifications.value.map((item) => item.id)).toEqual([
      "a1",
      "b1",
      "a2",
    ]);
    expect(feed.notifications.value[0]).toMatchObject({
      deviceId: "a",
      deviceName: "Холодильник",
      sensorName: "Морозилка",
      title: "Температура выше нормы",
      value: "-15.9°C",
      occurredAt: Date.parse("2026-11-27T10:00:00Z"),
    });
    expect(feed.notifications.value[1]).toMatchObject({
      deviceName: "b",
      sensorName: null,
      title: "firmware-updated",
      severity: "info",
      value: null,
    });
    expect(feed.hasMore.value).toBe(true);
    expect(feed.hasDevices.value).toBe(true);
    expect(feed.loading.value).toBe(false);
    expect(feed.loadError.value).toBe("");
  });

  it("loads the next pages with cursors and skips duplicates", async () => {
    mockedDevices.mockResolvedValue(
      devices({ id: "a", name: "A" }, { id: "b", name: "B" })
    );
    mockedNotifications.mockImplementation(async (deviceId: string) =>
      deviceId === "a"
        ? page([raw("a1", "a", "2026-11-27T10:00:00Z")], "cursor-a")
        : page([raw("b1", "b", "2026-11-27T09:30:00Z")])
    );

    const feed = useNotifications();
    await feed.load();

    mockedNotifications.mockImplementation(async (deviceId: string) =>
      deviceId === "a"
        ? page([
            raw("a1", "a", "2026-11-27T10:00:00Z"),
            raw("a0", "a", "2026-11-27T08:00:00Z"),
          ])
        : page([])
    );
    await feed.loadMore();

    expect(mockedNotifications).toHaveBeenCalledWith("a", "cursor-a", 20);
    expect(mockedNotifications).toHaveBeenCalledWith("b", undefined, 20);
    expect(feed.notifications.value.map((item) => item.id)).toEqual([
      "a1",
      "b1",
      "a0",
    ]);
    expect(feed.hasMore.value).toBe(false);
    expect(feed.loadingMore.value).toBe(false);
    expect(feed.loadMoreError.value).toBe("");
  });

  it("keeps the cursor of a device whose next page failed", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    mockedNotifications.mockResolvedValue(
      page([raw("a1", "a", "2026-11-27T10:00:00Z")], "cursor-a")
    );

    const feed = useNotifications();
    await feed.load();

    mockedNotifications.mockResolvedValue(Result.err("boom"));
    await feed.loadMore();

    expect(feed.notifications.value.map((item) => item.id)).toEqual(["a1"]);
    expect(feed.loadMoreError.value).toBe("Не удалось загрузить уведомления");
    expect(feed.hasMore.value).toBe(true);
  });

  it("reports an error when devices cannot be loaded", async () => {
    mockedDevices.mockResolvedValue(Result.err("Нет доступа"));

    const feed = useNotifications();
    await feed.load();

    expect(feed.loadError.value).toBe("Нет доступа");
    expect(feed.loading.value).toBe(false);
    expect(feed.notifications.value).toEqual([]);
  });

  it("reports an error when every device page fails", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    mockedNotifications.mockResolvedValue(Result.err("boom"));

    const feed = useNotifications();
    await feed.load();

    expect(feed.loadError.value).toBe("Не удалось загрузить уведомления");
    expect(feed.loading.value).toBe(false);
    expect(feed.hasMore.value).toBe(false);
  });

  it("shows an empty feed when there are no devices", async () => {
    mockedDevices.mockResolvedValue(devices());

    const feed = useNotifications();
    await feed.load();

    expect(feed.hasDevices.value).toBe(false);
    expect(feed.notifications.value).toEqual([]);
    expect(feed.loadError.value).toBe("");
    expect(feed.loading.value).toBe(false);
  });

  it("starts out loading until the first page arrives", () => {
    const feed = useNotifications();

    expect(feed.loading.value).toBe(true);
  });

  it("exposes the device list for filtering", async () => {
    mockedDevices.mockResolvedValue(
      devices(
        { id: "abcdefgh-1111", name: "Холодильник" },
        { id: "b2c3d4e5-rest", name: "Unknown Device" }
      )
    );
    mockedNotifications.mockResolvedValue(page([]));

    const feed = useNotifications();
    await feed.load();

    expect(feed.devices.value).toEqual([
      { id: "abcdefgh-1111", name: "Холодильник" },
      { id: "b2c3d4e5-rest", name: "b2c3d4e5" },
    ]);
  });

  it("requests pages of the configured size", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    mockedNotifications.mockResolvedValue(page([]));

    const feed = useNotifications({ pageSize: 100 });
    await feed.load();

    expect(mockedNotifications).toHaveBeenCalledWith("a", undefined, 100);
  });

  it("pages deeper until something matches the filter", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    const pages = [
      page([raw("a1", "a", "2026-11-27T10:00:00Z")], "cursor-1"),
      page([raw("a2", "a", "2026-11-27T09:00:00Z")], "cursor-2"),
      page([
        raw("a3", "a", "2026-11-27T08:00:00Z", { severity: "info" }),
      ]),
    ];
    mockedNotifications.mockImplementation(async () => pages.shift() ?? page([]));

    const feed = useNotifications();
    await feed.load();
    const hasInfo = () =>
      feed.notifications.value.some((item) => item.severity === "info");

    expect(hasInfo()).toBe(false);
    await feed.loadMoreUntil(hasInfo, 5);

    expect(mockedNotifications).toHaveBeenCalledTimes(3);
    expect(feed.hasMore.value).toBe(false);
    expect(feed.notifications.value.map((item) => item.id)).toEqual([
      "a1",
      "a2",
      "a3",
    ]);
    expect(feed.searching.value).toBe(false);
  });

  it("stops searching when a page fails", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    mockedNotifications.mockResolvedValueOnce(
      page([raw("a1", "a", "2026-11-27T10:00:00Z")], "cursor-1")
    );
    mockedNotifications.mockResolvedValue(Result.err("boom"));

    const feed = useNotifications();
    await feed.load();

    await feed.loadMoreUntil(() => false, 5);

    expect(mockedNotifications).toHaveBeenCalledTimes(2);
    expect(feed.loadMoreError.value).toBe(
      "Не удалось загрузить уведомления"
    );
    expect(feed.hasMore.value).toBe(true);
    expect(feed.searching.value).toBe(false);
  });

  it("does not search when nothing more can be loaded", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    mockedNotifications.mockResolvedValue(
      page([raw("a1", "a", "2026-11-27T10:00:00Z")])
    );

    const feed = useNotifications();
    await feed.load();

    await feed.loadMoreUntil(() => false, 5);

    expect(mockedNotifications).toHaveBeenCalledTimes(1);
    expect(feed.searching.value).toBe(false);
  });

  it("limits how deep a search goes", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    let counter = 0;
    mockedNotifications.mockImplementation(async () => {
      counter++;
      return page(
        [raw(`a${counter}`, "a", "2026-11-27T10:00:00Z")],
        "cursor"
      );
    });

    const feed = useNotifications();
    await feed.load();

    await feed.loadMoreUntil(() => false, 3);

    expect(mockedNotifications).toHaveBeenCalledTimes(4);
    expect(feed.hasMore.value).toBe(true);
    expect(feed.searching.value).toBe(false);
  });

  it("runs concurrent searches one after another", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    let release: (value: ReturnType<typeof page>) => void = () => {};
    mockedNotifications.mockResolvedValueOnce(
      page([raw("a1", "a", "2026-11-27T10:00:00Z")], "cursor-1")
    );
    mockedNotifications.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        })
    );

    const feed = useNotifications();
    await feed.load();

    const first = feed.loadMoreUntil(() => false, 5);
    const second = feed.loadMoreUntil(() => false, 5);
    await Promise.resolve();

    expect(feed.searching.value).toBe(true);
    expect(mockedNotifications).toHaveBeenCalledTimes(2);

    release(page([raw("a2", "a", "2026-11-27T09:00:00Z")]));
    await Promise.all([first, second]);

    expect(mockedNotifications).toHaveBeenCalledTimes(2);
    expect(feed.searching.value).toBe(false);
    expect(feed.notifications.value.map((item) => item.id)).toEqual([
      "a1",
      "a2",
    ]);
  });

  it("stops searching when the feed is reloaded mid-search", async () => {
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "A" }));
    let release: (value: ReturnType<typeof page>) => void = () => {};
    mockedNotifications
      .mockResolvedValueOnce(
        page([raw("a1", "a", "2026-11-27T10:00:00Z")], "cursor-1")
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            release = resolve;
          })
      )
      .mockResolvedValue(
        page([raw("a9", "a", "2026-11-27T09:00:00Z")], "cursor-9")
      );

    const feed = useNotifications();
    await feed.load();

    const search = feed.loadMoreUntil(() => false, 5);
    await Promise.resolve();
    expect(mockedNotifications).toHaveBeenCalledTimes(2);

    const reload = feed.load();
    release(page([raw("a2", "a", "2026-11-27T09:30:00Z")], "cursor-2"));
    await Promise.all([search, reload]);

    expect(mockedNotifications).toHaveBeenCalledTimes(3);
    expect(feed.searching.value).toBe(false);
    expect(feed.notifications.value.map((item) => item.id)).toEqual(["a9"]);
  });
});
