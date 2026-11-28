import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const storage = new Map<string, string>();

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("401 refresh interceptor", () => {
  beforeEach(() => {
    storage.clear();
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "http://api.test");
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("refreshes the session when the access token is rejected", async () => {
    storage.set("auth_token", "expired");
    storage.set("auth_refresh_token", "r1");

    const authorizations: Array<string | null> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const authorization = new Headers(init?.headers).get("Authorization");
        authorizations.push(authorization);

        if (url.includes("/api/v2/auth/refresh")) {
          return json(200, { token: "fresh", refreshToken: "r2" });
        }
        if (authorization === "Bearer fresh") {
          return json(200, { devices: [] });
        }
        return json(401, {});
      })
    );

    const { configureApi } = await import("@/api/client");
    configureApi();

    const { getDevices } = await import("@/api");
    const result = await getDevices();

    expect(result.status).toBe(200);
    expect(authorizations).toEqual([
      "Bearer expired",
      null,
      "Bearer fresh",
    ]);
    expect(storage.get("auth_token")).toBe("fresh");
    expect(storage.get("auth_refresh_token")).toBe("r2");
  });
});
