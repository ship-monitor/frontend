import { describe, it, expect } from "vitest";
import { ROUTES, route } from "@/constants/routes";

describe("route builders", () => {
  it("builds static routes from constants", () => {
    expect(route.login()).toBe(ROUTES.LOGIN);
    expect(route.profile()).toBe(ROUTES.PROFILE);
    expect(route.dashboard()).toBe(ROUTES.DASHBOARD);
    expect(route.connectDevice()).toBe(ROUTES.CONNECT_DEVICE);
  });

  it("substitutes the device id", () => {
    expect(route.deviceDetails("abc-123")).toBe(`/devices/abc-123`);
  });

  it("builds the notifications route with an optional filter", () => {
    expect(route.notifications()).toEqual({
      path: ROUTES.NOTIFICATIONS,
      query: {},
    });
    expect(route.notifications({ device: "abc-123" })).toEqual({
      path: ROUTES.NOTIFICATIONS,
      query: { device: "abc-123" },
    });
  });
});
