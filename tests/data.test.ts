import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/api", () => ({
  default: {
    request: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import api from "@/api";
import { getUserDevices, sendDeviceCommand } from "@/data";

const mockedRequest = vi.mocked(api.request);

const response = (status: number, data: unknown) => ({
  status,
  data,
  headers: {},
  config: {},
  statusText: "",
});

describe("data layer request adapter", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it("returns Ok with unwrapped devices for a 2xx envelope response", async () => {
    const devices = [{ id: "d1", name: "Fridge", isConnected: true }];
    mockedRequest.mockResolvedValue(
      response(200, { devices }) as never
    );

    const result = await getUserDevices();
    expect(result.isOk).toBe(true);
    result.map((value) => expect(value).toEqual(devices));
  });

  it("returns Err for non-2xx statuses", async () => {
    mockedRequest.mockResolvedValue(
      response(500, { details: "server exploded" }) as never
    );

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toBe("server exploded"));
  });

  it("returns Err with details fallback for non-2xx without details", async () => {
    mockedRequest.mockResolvedValue(response(503, null) as never);

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) =>
      expect(err).toBe("Не удалось загрузить устройства")
    );
  });

  it("returns Err for malformed payloads missing the expected key", async () => {
    mockedRequest.mockResolvedValue(response(200, { unexpected: 1 }) as never);

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toContain("devices"));
  });

  it("converts transport failures into Err instead of throwing", async () => {
    mockedRequest.mockRejectedValue(new Error("network down") as never);

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
  });

  it("sendDeviceCommand resolves Ok for 2xx and Err for 4xx", async () => {
    mockedRequest.mockResolvedValue(response(204, null) as never);
    const ok = await sendDeviceCommand("d1", "ping");
    expect(ok.isOk).toBe(true);

    mockedRequest.mockResolvedValue(response(404, { details: "no device" }) as never);
    const err = await sendDeviceCommand("d1", "ping");
    expect(err.isErr).toBe(true);
  });
});
