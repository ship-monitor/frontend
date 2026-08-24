import { describe, it, expect } from "vitest";
import { ROUTES, route } from "@/constants/routes";

describe("route builders", () => {
  it("builds static routes from constants", () => {
    expect(route.landing()).toBe(ROUTES.LANDING);
    expect(route.login()).toBe(ROUTES.LOGIN);
    expect(route.profile()).toBe(ROUTES.PROFILE);
    expect(route.dashboard()).toBe(ROUTES.DASHBOARD);
    expect(route.connectDevice()).toBe(ROUTES.CONNECT_DEVICE);
  });

  it("substitutes the sensor id", () => {
    expect(route.sensorDetails("abc-123")).toBe(`/sensors/abc-123`);
  });

  it("encodes the confirmation token as a query parameter", () => {
    expect(route.confirmEmail("tok en+1")).toBe(
      "/auth/confirm-email?token=tok%20en%2B1"
    );
  });
});
