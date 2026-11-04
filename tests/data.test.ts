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
import { getUserDevices, addDevice } from "@/data";

const mockedRequest = vi.mocked(api.request);
const mockedPost = vi.mocked(api.post);

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
    mockedPost.mockReset();
  });

  it("returns Ok with devices mapped from the v2 envelope", async () => {
    mockedRequest.mockResolvedValue(
      response(200, {
        devices: [
          { id: "d1", name: "Fridge", ownerId: "u1" },
          { id: "d2", name: "Old", owner_id: "u1" },
        ],
      }) as never
    );

    const result = await getUserDevices();
    expect(result.isOk).toBe(true);
    result.map((value) =>
      expect(value).toEqual([
        { id: "d1", name: "Fridge", ownerId: "u1" },
        { id: "d2", name: "Old", ownerId: "u1" },
      ])
    );
  });

  it("collects devices from all pages", async () => {
    const fullPage = Array.from({ length: 50 }, (_, i) => ({
      id: `d${i}`,
      name: `N${i}`,
    }));
    mockedRequest
      .mockResolvedValueOnce(response(200, { devices: fullPage }) as never)
      .mockResolvedValueOnce(
        response(200, { devices: [{ id: "last", name: "Last" }] }) as never
      );

    const result = await getUserDevices();
    expect(result.isOk).toBe(true);
    result.map((value) => expect(value).toHaveLength(51));
    expect(mockedRequest).toHaveBeenCalledTimes(2);
    expect(mockedRequest.mock.calls[1]?.[0]).toMatchObject({
      params: { page: 1, pageSize: 50 },
    });
  });

  it("returns Err with problem details for non-2xx statuses", async () => {
    mockedRequest.mockResolvedValue(
      response(500, { title: "Error", status: 500, detail: "server exploded" }) as never
    );

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toBe("server exploded"));
  });

  it("falls back to the problem title without detail", async () => {
    mockedRequest.mockResolvedValue(
      response(500, { type: "error", title: "server exploded", status: 500 }) as never
    );

    const result = await getUserDevices();
    expect(result.isErr).toBe(true);
    result.inspectErr((err) => expect(err).toBe("server exploded"));
  });

  it("returns Err with fallback for non-2xx without a problem body", async () => {
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

  it("addDevice resolves Ok for 201 and maps 409 to a dedicated error", async () => {
    mockedPost.mockResolvedValue(response(201, null) as never);
    const ok = await addDevice("d1", "key");
    expect(ok.isOk).toBe(true);

    mockedPost.mockResolvedValue(response(409, null) as never);
    const conflict = await addDevice("d1", "key");
    expect(conflict.isErr).toBe(true);
    conflict.inspectErr((err) => expect(err).toBe("Устройство уже подключено"));

    mockedPost.mockResolvedValue(
      response(400, { title: "Error", status: 400, detail: "bad key" }) as never
    );
    const bad = await addDevice("d1", "key");
    expect(bad.isErr).toBe(true);
    bad.inspectErr((err) => expect(err).toBe("bad key"));
  });
});
