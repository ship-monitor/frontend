import {
  connectDevice,
  editDevice,
  getDevice,
  getDeviceMetricsByName as getDeviceMetricsByNameOp,
  getDeviceOnlineStatus as getDeviceOnlineStatusOp,
  getDevices,
  getHealth,
  getSensorMetricsByName as getSensorMetricsByNameOp,
  getSensors as getSensorsOp,
  removeDevice,
} from "@/api";
import { Result, Unit } from "true-myth";
import { problemDetails } from "@/utils/problem";

export type Firmware = {
  manufacturer: string;
  model: string;
  revision: string;
  software: string;
};

export type Device = {
  id: string;
  name: string;
  ownerId?: string;
  firmware?: Firmware;
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
  firmware?: Firmware;
};

export type APIError = string;

const errorData = (response: { status: number }): unknown =>
  "data" in response ? (response as { data?: unknown }).data : undefined;

const asFirmware = (
  record: Record<string, unknown>
): Firmware | undefined => {
  const manufacturer = record["manufacturer"];
  const model = record["model"];
  const revision = record["revision"];
  const software = record["software"];
  if (
    typeof manufacturer === "string" &&
    typeof model === "string" &&
    typeof revision === "string" &&
    typeof software === "string"
  ) {
    return { manufacturer, model, revision, software };
  }
  return undefined;
};

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
        firmware: asFirmware(record),
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
      problemDetails(
        errorData(response),
        "Не удалось загрузить статус устройства"
      )
    );
  }

  const payload: unknown = response.data;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const online = record["online"];
    const lastSeen = record["lastSeen"];
    if (typeof online === "boolean" && typeof lastSeen === "string") {
      const parsed = Date.parse(lastSeen);
      if (!Number.isNaN(parsed)) {
        return Result.ok({ online, lastSeen: parsed });
      }
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
        firmware: asFirmware(record),
      });
    }
  }
  return Result.err("unexpected response shape: missing sensor fields");
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

const BATTERY_METRIC = "battery-level";
const POWER_METRIC = "power-connected";

export type DeviceMetricsSummary = {
  batteryLevel: number | null;
  batteryUpdatedAt: number | null;
  powerConnected: boolean | null;
  powerUpdatedAt: number | null;
};

const METRICS_WINDOW_MS = 24 * 60 * 60 * 1000;

const parseMetricValues = (
  data: unknown
): Array<{ name: string; value: number; timestamp: number }> => {
  const payload =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const rawValues = payload["values"];

  if (!Array.isArray(rawValues)) return [];

  const result: Array<{ name: string; value: number; timestamp: number }> = [];
  for (const item of rawValues) {
    const record =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const name = record["name"];
    const value = record["value"];
    const timestamp = record["timestamp"];
    if (
      typeof name !== "string" ||
      typeof value !== "number" ||
      typeof timestamp !== "string"
    ) {
      continue;
    }
    const parsed = Date.parse(timestamp);
    if (Number.isNaN(parsed)) continue;
    result.push({ name, value, timestamp: parsed });
  }

  return result;
};

// У хаба нет температуры: summary агрегирует только метрики устройства
// (батарея, питание). Температура — метрика датчика и запрашивается
// отдельно по /sensors/{id}/metrics/{metric}.
export const getDeviceMetricsSummary = async (
  deviceId: string
): Promise<Result<DeviceMetricsSummary, APIError>> => {
  const from = new Date(Date.now() - METRICS_WINDOW_MS).toISOString();
  const to = new Date().toISOString();

  const fetchDeviceMetric = async (
    metric: string,
    limit: number
  ): Promise<Array<{ name: string; value: number; timestamp: number }>> => {
    const response = await getDeviceMetricsByNameOp(deviceId, metric, {
      $from: from,
      to,
      limit,
    });
    if (response.status !== 200) {
      throw new Error(
        problemDetails(errorData(response), "Не удалось загрузить метрики")
      );
    }
    return parseMetricValues(response.data);
  };

  const [batteryValues, powerValues] = await Promise.allSettled([
    fetchDeviceMetric(BATTERY_METRIC, 10),
    fetchDeviceMetric(POWER_METRIC, 10),
  ]);

  const battery =
    batteryValues.status === "fulfilled"
      ? batteryValues.value[batteryValues.value.length - 1]
      : undefined;
  const power =
    powerValues.status === "fulfilled"
      ? powerValues.value[powerValues.value.length - 1]
      : undefined;

  return Result.ok({
    batteryLevel: battery ? battery.value : null,
    batteryUpdatedAt: battery ? battery.timestamp : null,
    powerConnected: power ? power.value === 1 : null,
    powerUpdatedAt: power ? power.timestamp : null,
  });
};

const TEMPERATURE_METRIC = "temperature";

export type TemperaturePoint = {
  value: number;
  timestamp: number;
};

export type SensorTemperature = {
  current: number | null;
  updatedAt: number | null;
  history: TemperaturePoint[];
};

const SENSOR_METRICS_WINDOW_MS = 24 * 60 * 60 * 1000;

// Температура — метрика датчика: окно 24 часа, на графике показываем
// последний час.
export const getSensorTemperature = async (
  deviceId: string,
  sensorId: string
): Promise<Result<SensorTemperature, APIError>> => {
  const from = new Date(Date.now() - SENSOR_METRICS_WINDOW_MS).toISOString();
  const to = new Date().toISOString();

  let response;
  try {
    response = await getSensorMetricsByNameOp(deviceId, sensorId, TEMPERATURE_METRIC, {
      $from: from,
      to,
      limit: 1000,
    });
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось загрузить метрики датчика")
    );
  }

  const history = parseMetricValues(response.data)
    .filter((point) => point.name === TEMPERATURE_METRIC)
    .map((point) => ({ value: point.value, timestamp: point.timestamp }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const last = history[history.length - 1];
  return Result.ok({
    current: last ? last.value : null,
    updatedAt: last ? last.timestamp : null,
    history,
  });
};

const HEALTH_TIMEOUT_MS = 5000;export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await Promise.race([
      getHealth(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("health check timeout")),
          HEALTH_TIMEOUT_MS
        );
      }),
    ]);
    return response.status === 200 && response.data.status !== "fail";
  } catch {
    return false;
  }
};

export { login, register, logout, refreshSession } from "./auth";
