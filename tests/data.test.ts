import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/api", () => ({
  getDevices: vi.fn(),
  connectDevice: vi.fn(),
}));

import { getDevices, connectDevice } from "@/api";
import { getUserDevices, addDevice } from "@/data";

const mockedGetDevices = vi.mocked(getDevices);
const mockedConnectDevice = vi.mocked(connectDevice);

const response = (status: number, data: unknown) => ({
  status,
  data,
  headers: new Headers(),
});

describe("data layer on generated client", () => {
  beforeEach(() => {
    mockedGetDevices.mockReset();
    mockedConnectDevice.mockReset();
  });

  it("returns Ok with devices from the v2 envelope", async () => {
    mockedGetDevices.mockResolvedValue(
      response(200, {
        devices: [{ id: "d1", name: "Fridge", ownerId: "u1" }],
      }) as never
    );

    const result = await getUserDevices();
    expect(result.isOk).toBe(true);
    result.map((value) =>
      expect(value).toEqual([{ id: "d1", name: "Fridge", ownerId: "u1" }])
    );
  });

  it("collects devices from all pages", async () => {
    const fullPage = Array.from({ length: 50 }, (_, i) => ({
      id: `d${i}`,
      name: `N${i}`,
      ownerId: "u1",
    }));
    mockedGetDevices
      .mockResolvedValueOnce(response(200, { devices: fullPage }) as never)
      .mockResolvedValueOnce(
        response(200, { devices: [{ id: "last", name: "Last", ownerId: "u1" }] }) as never
      );

    const result = await getUserDevices();
    expect(result.isOk).toBe(true);
    result.map((value) => expect(value).toHaveLength(51));
    expect(mockedGetDevices).toHaveBeenCalledTimes(2);
    expect(mockedGetDevices.mock.calls[1]?.[0]).toEqual({ page: 1, pageSize: 50 });
  });

  it("returns Err with problem details for non-2xx statuses", async () => {
    mockedGetDevices.mockResolvedValue(
      response(500, { type: "error", title: "Error", status: 500, detail: "server exploded" }) as never
    );

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toBe("server exploded"));
  });

  it("falls back to the problem title without detail", async () => {
    mockedGetDevices.mockResolvedValue(
      response(500, { type: "error", title: "server exploded", status: 500 }) as never
    );

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toBe("server exploded"));
  });

  it("returns Err with fallback for non-2xx without a problem body", async () => {
    mockedGetDevices.mockResolvedValue(response(503, null) as never);

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) =>
      expect(err).toBe("Не удалось загрузить устройства")
    );
  });

  it("returns Err for malformed payloads missing the expected key", async () => {
    mockedGetDevices.mockResolvedValue(response(200, { unexpected: 1 }) as never);

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toContain("devices"));
  });

  it("converts transport failures into Err instead of throwing", async () => {
    mockedGetDevices.mockRejectedValue(new Error("network down") as never);

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
  });

  it("addDevice resolves Ok for 201 and maps 409 to a dedicated error", async () => {
    mockedConnectDevice.mockResolvedValue(response(201, undefined) as never);
    const ok = await addDevice("d1", "key");
    expect(ok.isOk).toBe(true);

    mockedConnectDevice.mockResolvedValue(response(409, undefined) as never);
    const conflict = await addDevice("d1", "key");
    expect(conflict.isErr).toBe(true);
    conflict.inspectErr((err) => expect(err).toBe("Устройство уже подключено"));

    mockedConnectDevice.mockResolvedValue(
      response(400, { type: "error", title: "Error", status: 400, detail: "bad key" }) as never
    );
    const bad = await addDevice("d1", "key");
    expect(bad.isErr).toBe(true);
    bad.inspectErr((err) => expect(err).toBe("bad key"));
  });
});
