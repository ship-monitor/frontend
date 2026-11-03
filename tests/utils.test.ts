import { describe, it, expect, vi, beforeEach } from "vitest";
import { Result } from "true-myth";

vi.mock("@/data", () => ({
  getDeviceOnlineStatus: vi.fn(),
}));

import { getDeviceOnlineStatus } from "@/data";
import { fetchOnlineStatus, isOnline } from "@/utils/utils";

const mockedGetDeviceOnlineStatus = vi.mocked(getDeviceOnlineStatus);

describe("fetchOnlineStatus", () => {
  beforeEach(() => {
    mockedGetDeviceOnlineStatus.mockReset();
  });

  it("returns the online flag from the v2 status endpoint", async () => {
    mockedGetDeviceOnlineStatus.mockResolvedValue(
      Result.ok({ online: true, lastSeen: 1_000 })
    );
    expect(await fetchOnlineStatus("device-1")).toBe(true);

    mockedGetDeviceOnlineStatus.mockResolvedValue(
      Result.ok({ online: false, lastSeen: 1_000 })
    );
    expect(await fetchOnlineStatus("device-1")).toBe(false);
  });

  it("returns null for request errors, isOnline falls back to false", async () => {
    mockedGetDeviceOnlineStatus.mockResolvedValue(Result.err("network down"));
    expect(await fetchOnlineStatus("device-1")).toBeNull();
    expect(await isOnline("device-1")).toBe(false);
  });
});
