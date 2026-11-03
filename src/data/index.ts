import api from "@/api";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { Result, Unit } from "true-myth";
import { problemDetails } from "@/utils/problem";

export type Device = {
  id: string;
  name: string;
  ownerId?: string;
};

export type DeviceOnlineStatus = {
  online: boolean;
  lastSeen: number;
};

export type APIError = string;

const isOkStatus = (status: number) => status >= 200 && status < 300;

type Validator<T> = (data: unknown) => Result<T, APIError>;

const okUnit: Validator<Unit> = () => Result.ok(Unit);

const request = async <T>(
  config: AxiosRequestConfig,
  validate: Validator<T>,
  fallbackError: string
): Promise<Result<T, APIError>> => {
  let response: AxiosResponse;
  try {
    response = await api.request(config);
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (!isOkStatus(response.status)) {
    return Result.err(problemDetails(response.data, fallbackError));
  }

  return validate(response.data);
};

// ============= Устройства =============

const asDevice: Validator<Device> = (data) => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const id = record["id"];
    if (typeof id === "string") {
      return Result.ok({
        id,
        name: typeof record["name"] === "string" ? record["name"] : "",
        ownerId:
          typeof record["owner_id"] === "string" ? record["owner_id"] : undefined,
      });
    }
  }
  return Result.err('unexpected response shape: missing "id"');
};

const asDeviceList: Validator<Device[]> = (data) => {
  if (data && typeof data === "object") {
    const list = (data as Record<string, unknown>)["devices"];
    if (Array.isArray(list)) {
      const devices: Device[] = [];
      for (const item of list) {
        const device = asDevice(item);
        if (device.isErr) return Result.err(device.error);
        devices.push(device.value);
      }
      return Result.ok(devices);
    }
  }
  return Result.err('unexpected response shape: missing "devices"');
};

const DEVICES_PAGE_SIZE = 50;
const MAX_DEVICE_PAGES = 20;

// GET /api/v2/devices отдаёт устройства страницами — собираем все.
export const getUserDevices = async (): Promise<Result<Device[], APIError>> => {
  const devices: Device[] = [];

  for (let page = 0; page < MAX_DEVICE_PAGES; page++) {
    const result = await request(
      {
        method: "get",
        url: "/api/v2/devices",
        params: { page, pageSize: DEVICES_PAGE_SIZE },
      },
      asDeviceList,
      "Не удалось загрузить устройства"
    );
    if (result.isErr) return Result.err(result.error);

    devices.push(...result.value);
    if (result.value.length < DEVICES_PAGE_SIZE) break;
  }

  return Result.ok(devices);
};

export const getDeviceById = async (
  deviceId: string
): Promise<Result<Device, APIError>> =>
  request(
    { method: "get", url: `/api/v2/devices/${encodeURIComponent(deviceId)}` },
    asDevice,
    "Не удалось загрузить устройство"
  );

// NOTE(api-contract): 409 «устройство уже подключено» приходит без тела.
export const addDevice = async (
  deviceId: string,
  securityKey: string
): Promise<Result<Unit, APIError>> => {
  let response: AxiosResponse;
  try {
    response = await api.post("/api/v2/devices", { deviceId, securityKey });
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status === 409) {
    return Result.err("Устройство уже подключено");
  }
  if (!isOkStatus(response.status)) {
    return Result.err(
      problemDetails(response.data, "Не удалось подключить устройство")
    );
  }
  return Result.ok(Unit);
};

export const updateDevice = async (
  deviceId: string,
  name: string
): Promise<Result<Unit, APIError>> =>
  request(
    {
      method: "patch",
      url: `/api/v2/devices/${encodeURIComponent(deviceId)}`,
      data: { name },
    },
    okUnit,
    "Не удалось обновить устройство"
  );

export const disconnectDevice = async (
  deviceId: string
): Promise<Result<Unit, APIError>> =>
  request(
    {
      method: "delete",
      url: `/api/v2/devices/${encodeURIComponent(deviceId)}`,
    },
    okUnit,
    "Не удалось отключить устройство"
  );

const asOnlineStatus: Validator<DeviceOnlineStatus> = (data) => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const online = record["online"];
    const lastSeen = record["lastSeen"];
    if (typeof online === "boolean" && typeof lastSeen === "number") {
      return Result.ok({ online, lastSeen });
    }
  }
  return Result.err('unexpected response shape: missing "online"/"lastSeen"');
};

export const getDeviceOnlineStatus = async (
  deviceId: string
): Promise<Result<DeviceOnlineStatus, APIError>> =>
  request(
    {
      method: "get",
      url: `/api/v2/devices/${encodeURIComponent(deviceId)}/online`,
    },
    asOnlineStatus,
    "Не удалось загрузить статус устройства"
  );

export { login, register, logout } from "./auth";
