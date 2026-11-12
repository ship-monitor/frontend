import {
  connectDevice,
  editDevice,
  editSensor as editSensorOp,
  getDevice,
  getDeviceMetrics as getDeviceMetricsOp,
  getDeviceOnlineStatus as getDeviceOnlineStatusOp,
  getDevices,
  getSensors as getSensorsOp,
  removeDevice,
} from "@/api";
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

export type Sensor = {
  id: string;
  name: string;
  deviceId: string;
  displayName: string;
};

export type TemperaturePoint = {
  value: number;
  timestamp: number;
};

export type DeviceTemperature = {
  current: number | null;
  updatedAt: number | null;
  history: TemperaturePoint[];
};

export type APIError = string;

const errorData = (response: { status: number }): unknown =>
  "data" in response ? (response as { data?: unknown }).data : undefined;

const asDevice = (data: unknown): Result<Device, APIError> => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const id = record["id"];
    if (typeof id === "string") {
      return Result.ok({
        id,
        name: typeof record["name"] === "string" ? record["name"] : "",
        ownerId:
          typeof record["ownerId"] === "string" ? record["ownerId"] : undefined,
      });
    }
  }
  return Result.err('unexpected response shape: missing "id"');
};

const DEVICES_PAGE_SIZE = 50;
const MAX_DEVICE_PAGES = 20;

// GET /api/v2/devices отдаёт устройства страницами — собираем все.
export const getUserDevices = async (): Promise<Result<Device[], APIError>> => {
  const devices: Device[] = [];

  for (let page = 0; page < MAX_DEVICE_PAGES; page++) {
    let response;
    try {
      response = await getDevices({ page, pageSize: DEVICES_PAGE_SIZE });
    } catch {
      return Result.err("Не удалось связаться с сервером");
    }

    if (response.status !== 200) {
      return Result.err(
        problemDetails(errorData(response), "Не удалось загрузить устройства")
      );
    }

    const payload: unknown = response.data;
    const list =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)["devices"]
        : null;
    if (!Array.isArray(list)) {
      return Result.err('unexpected response shape: missing "devices"');
    }

    for (const item of list) {
      const device = asDevice(item);
      if (device.isErr) return Result.err(device.error);
      devices.push(device.value);
    }

    if (list.length < DEVICES_PAGE_SIZE) break;
  }

  return Result.ok(devices);
};

export const getDeviceById = async (
  deviceId: string
): Promise<Result<Device, APIError>> => {
  let response;
  try {
    response = await getDevice(deviceId);
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось загрузить устройство")
    );
  }

  return asDevice(response.data);
};

// NOTE(api-contract): 409 «устройство уже подключено» приходит без тела.
export const addDevice = async (
  deviceId: string,
  securityKey: string
): Promise<Result<Unit, APIError>> => {
  let response;
  try {
    response = await connectDevice({ deviceId, securityKey });
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status === 409) {
    return Result.err("Устройство уже подключено");
  }
  if (response.status !== 201) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось подключить устройство")
    );
  }
  return Result.ok(Unit);
};

export const updateDevice = async (
  deviceId: string,
  name: string
): Promise<Result<Unit, APIError>> => {
  let response;
  try {
    response = await editDevice(deviceId, { name });
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось обновить устройство")
    );
  }
  return Result.ok(Unit);
};

export const disconnectDevice = async (
  deviceId: string
): Promise<Result<Unit, APIError>> => {
  let response;
  try {
    response = await removeDevice(deviceId);
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось отключить устройство")
    );
  }
  return Result.ok(Unit);
};

export const getDeviceOnlineStatus = async (
  deviceId: string
): Promise<Result<DeviceOnlineStatus, APIError>> => {
  let response;
  try {
    response = await getDeviceOnlineStatusOp(deviceId);
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось загрузить статус устройства")
    );
  }

  const payload: unknown = response.data;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const online = record["online"];
    const lastSeen = record["lastSeen"];
    if (typeof online === "boolean" && typeof lastSeen === "number") {
      return Result.ok({ online, lastSeen });
    }
  }
  return Result.err('unexpected response shape: missing "online"/"lastSeen"');
};

const asSensor = (data: unknown): Result<Sensor, APIError> => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (
      typeof record["id"] === "string" &&
      typeof record["name"] === "string" &&
      typeof record["deviceId"] === "string" &&
      typeof record["displayName"] === "string"
    ) {
      return Result.ok({
        id: record["id"],
        name: record["name"],
        deviceId: record["deviceId"],
        displayName: record["displayName"],
      });
    }
  }
  return Result.err('unexpected response shape: missing sensor fields');
};

export const getDeviceSensors = async (
  deviceId: string
): Promise<Result<Sensor[], APIError>> => {
  let response;
  try {
    response = await getSensorsOp(deviceId);
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось загрузить датчики")
    );
  }

  const payload: unknown = response.data;
  const list =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)["sensors"]
      : null;
  if (!Array.isArray(list)) {
    return Result.err('unexpected response shape: missing "sensors"');
  }

  const sensors: Sensor[] = [];
  for (const item of list) {
    const sensor = asSensor(item);
    if (sensor.isErr) return Result.err(sensor.error);
    sensors.push(sensor.value);
  }
  return Result.ok(sensors);
};

export const renameSensor = async (
  deviceId: string,
  sensorId: string,
  displayName: string
): Promise<Result<Sensor, APIError>> => {
  let response;
  try {
    response = await editSensorOp(deviceId, sensorId, { displayName });
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось переименовать датчик")
    );
  }

  const payload: unknown = response.data;
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)["sensor"]
      : null;
  return asSensor(record);
};

const asTemperature = (data: unknown): Result<DeviceTemperature, APIError> => {
  const payload =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const rawValues = payload["values"];

  if (!Array.isArray(rawValues)) {
    return Result.err('unexpected response shape: missing "values"');
  }

  const history: TemperaturePoint[] = [];
  for (const item of rawValues) {
    const record =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const value = record["value"];
    const timestamp = record["timestamp"];
    if (typeof value === "number" && typeof timestamp === "string") {
      const parsed = Date.parse(timestamp);
      if (Number.isNaN(parsed)) continue;
      history.push({ value, timestamp: parsed });
    }
  }

  history.sort((a, b) => a.timestamp - b.timestamp);

  const last = history.length > 0 ? history[history.length - 1] : undefined;

  return Result.ok({
    current: last ? last.value : null,
    updatedAt: last ? last.timestamp : null,
    history,
  });
};

export const getDeviceTemperature = async (
  deviceId: string
): Promise<Result<DeviceTemperature, APIError>> => {
  let response;
  try {
    response = await getDeviceMetricsOp(deviceId);
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось загрузить температуру")
    );
  }

  return asTemperature(response.data);
};

export { login, register, logout, refreshSession } from "./auth";
