import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/api", () => ({
  loginUser: vi.fn(),
  refreshToken: vi.fn(),
  registerUser: vi.fn(),
}));

import { loginUser, refreshToken } from "@/api";
import { login, refreshSession } from "@/data/auth";

const storage = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
});

const mockedLogin = vi.mocked(loginUser);
const mockedRefresh = vi.mocked(refreshToken);

const response = (status: number, data: unknown) => ({
  status,
  data,
  headers: new Headers(),
});

describe("auth data layer", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    mockedRefresh.mockReset();
    storage.clear();
  });

  it("login saves tokens from a response without the legacy success field", async () => {
    mockedLogin.mockResolvedValue(
      response(200, { token: "t1", refreshToken: "r1" }) as never
    );

    const result = await login("user@test.local", "secret");

    expect(result.isOk).toBe(true);
    expect(storage.get("auth_token")).toBe("t1");
    expect(storage.get("auth_refresh_token")).toBe("r1");
  });

  it("login maps 401 to a credentials error", async () => {
    mockedLogin.mockResolvedValue(
      response(401, {
        type: "invalid-credentials",
        title: "Invalid credentials",
        status: 401,
        detail: "Неверный логин или пароль",
      }) as never
    );

    const result = await login("user@test.local", "wrong");

    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toBe("Неверный логин или пароль"));
    expect(storage.size).toBe(0);
  });

  it("login rejects a 200 response without a token", async () => {
    mockedLogin.mockResolvedValue(
      response(200, { refreshToken: "r1" }) as never
    );

    const result = await login("user@test.local", "secret");

    expect(result.isErr).toBe(true);
    result.inspectErr((err) =>
      expect(err).toBe("Неверный ответ сервера авторизации")
    );
  });

  it("refreshSession saves tokens from a response without the legacy success field", async () => {
    storage.set("auth_refresh_token", "r1");
    mockedRefresh.mockResolvedValue(
      response(200, { token: "t2", refreshToken: "r2" }) as never
    );

    const result = await refreshSession();

    expect(result.isOk).toBe(true);
    expect(mockedRefresh).toHaveBeenCalledWith({ refreshToken: "r1" });
    expect(storage.get("auth_token")).toBe("t2");
    expect(storage.get("auth_refresh_token")).toBe("r2");
  });
});
