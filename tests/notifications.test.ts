import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/api", () => ({
  getDeviceNotifications: vi.fn(),
}));

import { getDeviceNotifications } from "@/api";
import { getDeviceNotifications as getNotifications } from "@/data";

const mockedOp = vi.mocked(getDeviceNotifications);

const response = (status: number, data: unknown) => ({
  status,
  data,
  headers: new Headers(),
});

const notification = (overrides: Record<string, unknown> = {}) => ({
  id: "n1",
  deviceId: "d1",
  sensorId: "s1",
  type: "temperature-high",
  severity: "critical",
  occurredAt: "2026-11-27T21:49:33Z",
  isRead: false,
  data: { temperature: -15.9 },
  ...overrides,
});

describe("device notifications", () => {
  beforeEach(() => {
    mockedOp.mockReset();
  });

  it("returns the first page with its cursor", async () => {
    mockedOp.mockResolvedValue(
      response(200, {
        notifications: [notification()],
        pagination: { nextCursor: "abc", hasMore: true },
      }) as never
    );

    const result = await getNotifications("d1");

    expect(mockedOp).toHaveBeenCalledWith("d1", {
      cursor: undefined,
      limit: 20,
    });
    expect(result.isOk).toBe(true);
    result.map((page) => {
      expect(page.items).toEqual([
        {
          id: "n1",
          deviceId: "d1",
          sensorId: "s1",
          type: "temperature-high",
          severity: "critical",
          occurredAt: Date.parse("2026-11-27T21:49:33Z"),
          isRead: false,
          data: { temperature: -15.9 },
        },
      ]);
      expect(page.nextCursor).toBe("abc");
      expect(page.hasMore).toBe(true);
    });
  });

  it("passes the cursor of the next page", async () => {
    mockedOp.mockResolvedValue(
      response(200, { notifications: [], pagination: {} }) as never
    );

    await getNotifications("d1", "abc");

    expect(mockedOp).toHaveBeenCalledWith("d1", {
      cursor: "abc",
      limit: 20,
    });
  });

  it("treats a missing cursor as the last page", async () => {
    mockedOp.mockResolvedValue(
      response(200, {
        notifications: [],
        pagination: { hasMore: true },
      }) as never
    );

    const result = await getNotifications("d1");

    result.map((page) => {
      expect(page.nextCursor).toBeNull();
      expect(page.hasMore).toBe(false);
    });
  });

  it("allows notifications without a sensor and payload", async () => {
    mockedOp.mockResolvedValue(
      response(200, {
        notifications: [
          notification({ sensorId: undefined, data: null, isRead: true }),
        ],
        pagination: {},
      }) as never
    );

    const result = await getNotifications("d1");

    result.map((page) => {
      const [item] = page.items;
      expect(item).toMatchObject({
        sensorId: null,
        data: {},
        isRead: true,
      });
    });
  });

  it("maps a non-200 response to its problem detail", async () => {
    mockedOp.mockResolvedValue(
      response(404, {
        type: "device-not-found",
        title: "Device not found",
        status: 404,
        detail: "no device",
      }) as never
    );

    const result = await getNotifications("d1");

    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toBe("no device"));
  });

  it("converts transport failures into Err", async () => {
    mockedOp.mockRejectedValue(new Error("network down") as never);

    const result = await getNotifications("d1");

    expect(result.isErr).toBe(true);
    result.inspectErr((err) =>
      expect(err).toBe("Не удалось связаться с сервером")
    );
  });

  it("rejects malformed payloads", async () => {
    mockedOp.mockResolvedValue(response(200, { sensors: [] }) as never);
    const missing = await getNotifications("d1");
    expect(missing.isErr).toBe(true);

    mockedOp.mockResolvedValue(
      response(200, { notifications: [{ id: "n1" }], pagination: {} }) as never
    );
    const partial = await getNotifications("d1");
    expect(partial.isErr).toBe(true);

    mockedOp.mockResolvedValue(
      response(200, {
        notifications: [notification({ severity: "fatal" })],
        pagination: {},
      }) as never
    );
    const severity = await getNotifications("d1");
    expect(severity.isErr).toBe(true);
  });
});
