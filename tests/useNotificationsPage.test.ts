import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, ref } from "vue";
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
import {
  useNotificationsPage,
  type NotificationsPageQuery,
  type NotificationsPageSource,
} from "@/composables/useNotificationsPage";
import type { NotificationsRouteQuery } from "@/constants/routes";

const mockedDevices = vi.mocked(getUserDevices);
const mockedSensors = vi.mocked(getDeviceSensors);
const mockedNotifications = vi.mocked(getDeviceNotifications);

const AT = Date.parse("2026-11-28T10:00:00Z");

const raw = (
  id: string,
  deviceId: string,
  index = 0,
  overrides: Partial<DeviceNotification> = {}
): DeviceNotification => ({
  id,
  deviceId,
  sensorId: `${deviceId}-s1`,
  type: "temperature-high",
  severity: "critical",
  occurredAt: AT - index * 1000,
  isRead: false,
  data: { temperature: -16 },
  ...overrides,
});

const many = (
  count: number,
  deviceId: string,
  prefix = ""
): DeviceNotification[] =>
  Array.from({ length: count }, (_, index) =>
    raw(`${deviceId}${prefix}-${index}`, deviceId, index)
  );

const page = (items: DeviceNotification[], nextCursor: string | null = null) =>
  Result.ok<DeviceNotification[], string>(items).map((list) => ({
    items: list,
    nextCursor,
    hasMore: nextCursor !== null,
  }));

const devices = (...list: Array<{ id: string; name: string }>) =>
  Result.ok<Device[], string>(list);

const start = (initial: NotificationsPageQuery = {}) => {
  const current = ref<NotificationsPageQuery>({ ...initial });
  const replaced: NotificationsRouteQuery[] = [];
  const source: NotificationsPageSource = {
    query: () => current.value,
    replace: (next) => {
      replaced.push(next);
      current.value = { ...next };
    },
  };

  return {
    state: useNotificationsPage(source),
    replaced,
    navigate: (next: NotificationsPageQuery) => {
      current.value = { ...next };
    },
  };
};

describe("useNotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSensors.mockResolvedValue(Result.ok<Sensor[], string>([]));
    mockedDevices.mockResolvedValue(devices({ id: "a", name: "Холодильник" }));
    mockedNotifications.mockResolvedValue(page(many(3, "a")));
  });

  it("takes the initial filters from the query and ignores broken values", () => {
    const { state } = start({ device: "a", severity: "warning" });
    const broken = start({ device: ["a"], severity: "fatal" }).state;

    expect(state.severity.value).toBe("warning");
    expect(state.deviceId.value).toBe("a");
    expect(broken.severity.value).toBe("all");
    expect(broken.deviceId.value).toBe("");
  });

  it("requests wide pages and names the chosen device", async () => {
    const { state } = start({ device: "b" });

    expect(state.subtitle.value).toBe("");

    await state.refresh();

    expect(state.deviceOptions.value).toEqual([
      { value: "", label: "Все устройства" },
      { value: "a", label: "Холодильник" },
    ]);
    expect(mockedNotifications).toHaveBeenCalledWith("a", undefined, 100);
    expect(state.subtitle.value).toBe("Устройство «b»");
    expect(state.visible.value).toEqual([]);
  });

  it("names an unknown device by its id prefix", async () => {
    const { state } = start({ device: "12345678-aaaa" });

    await state.refresh();

    expect(state.subtitle.value).toBe("Устройство «12345678»");
    expect(state.visible.value).toEqual([]);
  });

  it("names the only hub instead of all devices", async () => {
    const { state } = start();
    expect(state.subtitle.value).toBe("");

    await state.refresh();

    expect(state.subtitle.value).toBe("Устройство «Холодильник»");
    expect(state.showDeviceName.value).toBe(false);
    expect(state.deviceOptions.value).toHaveLength(2);
  });

  it("keeps the hub name in rows when there are several hubs", async () => {
    mockedDevices.mockResolvedValue(
      devices({ id: "a", name: "Холодильник" }, { id: "b", name: "Морозилка" })
    );
    mockedNotifications.mockImplementation(async (deviceId: string) =>
      page(many(2, deviceId))
    );

    const { state } = start();
    await state.refresh();

    expect(state.subtitle.value).toBe("По всем устройствам");
    expect(state.showDeviceName.value).toBe(true);
    expect(state.deviceOptions.value).toHaveLength(3);

    state.deviceId.value = "b";
    await nextTick();

    expect(state.subtitle.value).toBe("Устройство «Морозилка»");
    expect(state.showDeviceName.value).toBe(false);
  });

  it("follows the address when it changes while the page is open", async () => {
    const { state, replaced, navigate } = start({ device: "a" });
    await state.refresh();
    expect(state.visible.value).toHaveLength(3);
    expect(state.deviceId.value).toBe("a");

    navigate({});

    await nextTick();

    expect(state.deviceId.value).toBe("");
    expect(state.severity.value).toBe("all");
    expect(state.filtersActive.value).toBe(false);
    expect(state.visible.value).toHaveLength(3);
    expect(replaced).toEqual([]);
  });

  it("writes filter changes back to the address", async () => {
    const { state, replaced } = start();
    await state.refresh();

    state.deviceId.value = "a";
    state.severity.value = "warning";
    await nextTick();

    expect(replaced).toEqual([{ device: "a", severity: "warning" }]);
  });

  it("drops address parameters for default filters", async () => {
    const { state, replaced } = start({ device: "a", severity: "info" });
    await state.refresh();

    state.resetFilters();
    await nextTick();

    expect(replaced).toEqual([{}]);
    expect(state.filtersActive.value).toBe(false);
  });

  it("does not rewrite the address it has just read", async () => {
    const { state, replaced, navigate } = start({ device: "a" });
    await state.refresh();

    navigate({ device: "a", severity: "warning" });
    await nextTick();

    expect(replaced).toEqual([]);
    expect(state.severity.value).toBe("warning");
  });

  it("shows a window of rows and reveals loaded ones before fetching", async () => {
    mockedNotifications
      .mockResolvedValueOnce(page(many(120, "a"), "cursor"))
      .mockResolvedValueOnce(page(many(100, "a", "-next")));

    const { state } = start();
    await state.refresh();

    expect(state.visible.value).toHaveLength(50);
    expect(state.canShowMore.value).toBe(true);

    await state.showMore();
    await state.showMore();

    expect(state.visible.value).toHaveLength(120);
    expect(mockedNotifications).toHaveBeenCalledTimes(1);

    await state.showMore();

    expect(mockedNotifications).toHaveBeenCalledTimes(2);
    expect(mockedNotifications).toHaveBeenLastCalledWith("a", "cursor", 100);
    expect(state.visible.value).toHaveLength(200);
    expect(state.feed.notifications.value).toHaveLength(220);
  });

  it("narrows the window back when a filter changes", async () => {
    mockedNotifications.mockResolvedValue(page(many(120, "a"), "cursor"));

    const { state } = start();
    await state.refresh();
    await state.showMore();
    expect(state.visible.value).toHaveLength(100);

    state.severity.value = "critical";
    await vi.waitFor(() => expect(state.visible.value).toHaveLength(50));
  });

  it("keeps only the chosen device in view", async () => {
    mockedDevices.mockResolvedValue(
      devices({ id: "a", name: "Холодильник" }, { id: "b", name: "Морозилка" })
    );
    mockedNotifications.mockImplementation(async (deviceId: string) =>
      page(many(3, deviceId), deviceId === "a" ? "cursor-a" : null)
    );

    const { state } = start({ device: "b" });
    await state.refresh();

    expect(state.visible.value.map((item) => item.deviceId)).toEqual([
      "b",
      "b",
      "b",
    ]);
    expect(state.canShowMore.value).toBe(true);
  });

  it("searches deeper when the filter matches nothing on the first page", async () => {
    mockedNotifications
      .mockResolvedValueOnce(page(many(3, "a"), "cursor-1"))
      .mockResolvedValueOnce(
        page([
          ...many(2, "a"),
          raw("a-info", "a", 0, { severity: "info", sensorId: null }),
        ])
      );

    const { state } = start({ severity: "info" });
    await state.refresh();

    expect(mockedNotifications).toHaveBeenCalledTimes(2);
    expect(state.visible.value.map((item) => item.id)).toEqual(["a-info"]);
    expect(state.feed.searching.value).toBe(false);
  });

  it("gives up when the pages run out", async () => {
    const { state } = start({ severity: "info" });
    await state.refresh();

    expect(mockedNotifications).toHaveBeenCalledTimes(1);
    expect(state.visible.value).toEqual([]);
    expect(state.canShowMore.value).toBe(false);
  });

  it("resets both filters", async () => {
    const { state } = start({ device: "a", severity: "info" });
    await state.refresh();

    state.resetFilters();
    await vi.waitFor(() => expect(state.visible.value).toHaveLength(3));

    expect(state.severity.value).toBe("all");
    expect(state.deviceId.value).toBe("");
    expect(state.filtersActive.value).toBe(false);
  });

  it("surfaces load errors for the page to retry", async () => {
    mockedDevices.mockResolvedValue(Result.err("Нет доступа"));

    const { state } = start();
    await state.refresh();

    expect(state.feed.loadError.value).toBe("Нет доступа");
    expect(state.feed.loading.value).toBe(false);
    expect(state.refreshing.value).toBe(false);
  });

  it("reloads from the newest page on refresh and resets the window", async () => {
    mockedNotifications
      .mockResolvedValueOnce(page(many(120, "a"), "cursor"))
      .mockResolvedValueOnce(page(many(60, "a", "-fresh")));

    const { state } = start();
    await state.refresh();
    await state.showMore();
    expect(state.visible.value).toHaveLength(100);

    await state.refresh();

    expect(mockedNotifications).toHaveBeenCalledTimes(2);
    expect(mockedNotifications).toHaveBeenLastCalledWith("a", undefined, 100);
    expect(state.visible.value).toHaveLength(50);
    expect(state.visible.value[0]?.id).toBe("a-fresh-0");
    expect(state.feed.hasMore.value).toBe(false);
    expect(state.refreshing.value).toBe(false);
  });

  it("keeps the rows and reports the error when a refresh fails", async () => {
    const { state } = start();
    await state.refresh();
    expect(state.visible.value).toHaveLength(3);

    mockedDevices.mockResolvedValue(Result.err("Нет доступа"));
    await state.refresh();

    expect(state.feed.loadError.value).toBe("Нет доступа");
    expect(state.visible.value).toHaveLength(3);
    expect(state.refreshing.value).toBe(false);
  });

  it("does not search deeper after a failed refresh", async () => {
    mockedNotifications
      .mockResolvedValueOnce(page(many(3, "a"), "cursor"))
      .mockResolvedValue(Result.err("boom"));

    const { state } = start({ severity: "info" });
    await state.refresh();

    mockedDevices.mockResolvedValue(Result.err("Нет доступа"));
    await state.refresh();

    expect(mockedNotifications).toHaveBeenCalledTimes(2);
    expect(state.feed.loadMoreError.value).toBe("");
  });

  it("searches again for an empty filter after a refresh", async () => {
    mockedNotifications.mockResolvedValueOnce(page(many(3, "a")));

    const { state } = start({ severity: "info" });
    await state.refresh();
    expect(mockedNotifications).toHaveBeenCalledTimes(1);

    mockedNotifications
      .mockResolvedValueOnce(page(many(2, "a", "-fresh"), "cursor-fresh"))
      .mockResolvedValueOnce(
        page([raw("a-info", "a", 0, { severity: "info", sensorId: null })])
      );

    await state.refresh();

    expect(mockedNotifications).toHaveBeenCalledTimes(3);
    expect(mockedNotifications).toHaveBeenLastCalledWith(
      "a",
      "cursor-fresh",
      100
    );
    expect(state.visible.value.map((item) => item.id)).toEqual(["a-info"]);
    expect(state.feed.searching.value).toBe(false);
  });
});
