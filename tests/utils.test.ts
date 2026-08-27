import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Result } from "true-myth";

const now = Date.now();

vi.mock("@/data", () => ({
  getDeviceState: vi.fn(),
}));

import { getDeviceState } from "@/data";
import { formatTimeAgo, fetchOnlineStatus, isOnline } from "@/utils/utils";

const mockedGetDeviceState = vi.mocked(getDeviceState);

const record = (value: boolean, timestamp: number) => ({
  state: "online" as const,
  value,
  timestamp: new Date(timestamp).toISOString(),
  deviceId: "device-1",
});

describe("formatTimeAgo", () => {
  it("formats just now for fresh timestamps", () => {
    expect(formatTimeAgo(new Date(now - 2_000).toISOString())).toBe(
      "только что"
    );
  });

  it("formats seconds and minutes", () => {
    expect(formatTimeAgo(new Date(now - 30_000).toISOString())).toBe("30с назад");
    expect(formatTimeAgo(new Date(now - 5 * 60_000).toISOString())).toBe(
      "5м назад"
    );
  });

  it("formats hours and days", () => {
    expect(formatTimeAgo(new Date(now - 3 * 3_600_000).toISOString())).toBe(
      "3ч назад"
    );
    expect(formatTimeAgo(new Date(now - 2 * 86_400_000).toISOString())).toBe(
      "2д назад"
    );
  });

  it("handles future and invalid timestamps", () => {
    expect(formatTimeAgo(new Date(now + 60_000).toISOString())).toBe(
      "только что"
    );
    expect(formatTimeAgo("not-a-date")).toBe("—");
  });
});

describe("fetchOnlineStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    mockedGetDeviceState.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true only for a fresh true record", async () => {
    mockedGetDeviceState.mockResolvedValue(
      Result.ok(record(true, now - 5_000))
    );
    expect(await fetchOnlineStatus("device-1")).toBe(true);
  });

  it("returns false for a fresh false record", async () => {
    mockedGetDeviceState.mockResolvedValue(
      Result.ok(record(false, now - 5_000))
    );
    expect(await fetchOnlineStatus("device-1")).toBe(false);
  });

  it("returns false for a stale true record", async () => {
    mockedGetDeviceState.mockResolvedValue(Result.ok(record(true, now - 60_000)));
    expect(await fetchOnlineStatus("device-1")).toBe(false);
  });

  it("returns null for request errors, isOnline falls back to false", async () => {
    mockedGetDeviceState.mockResolvedValue(Result.err("network down"));
    expect(await fetchOnlineStatus("device-1")).toBeNull();
    expect(await isOnline("device-1")).toBe(false);
  });
});
