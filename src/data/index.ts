import {
  connectDevice,
  editDevice,
  editSensor as editSensorOp,
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
  if (response.status !== 202) {
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

const BATTERY_METRIC = "battery-level";
const POWER_METRIC = "power-connected";

export type MetricsSummary = {
  batteryLevel: number | null;
  batteryUpdatedAt: number | null;
  powerConnected: boolean | null;
  powerUpdatedAt: number | null;
};

export const emptyMetricsSummary: MetricsSummary = {
  batteryLevel: null,
  batteryUpdatedAt: null,
  powerConnected: null,
  powerUpdatedAt: null,
};

const METRICS_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const METRICS_RECENT_WINDOW_MS = 5 * 60 * 1000;
const METRICS_WIDE_WINDOW_MS = 8 * 60 * 60 * 1000;
const METRICS_PAGE_LIMIT = 1000;
const METRICS_ERROR = "Не удалось загрузить метрики";

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

type MetricValues = Array<{ name: string; value: number; timestamp: number }>;

type MetricPoint = MetricValues[number];

type MetricQuery = { $from: string; to: string; limit: number };

type MetricRun = (query: MetricQuery) => Promise<{ status: number; data?: unknown }>;

type MetricRead =
  | { ok: true; points: MetricValues }
  | { ok: false; message: string };

type LatestRead =
  | { ok: true; latest: MetricPoint | undefined }
  | { ok: false; message: string };

const lastPoint = (points: MetricValues): MetricPoint | undefined =>
  points[points.length - 1];

const metricQuery = (from: number, to: number): MetricQuery => ({
  $from: new Date(from).toISOString(),
  to: new Date(to).toISOString(),
  limit: METRICS_PAGE_LIMIT,
});

const readMetricPage = async (
  run: MetricRun,
  query: MetricQuery,
  fallback: string
): Promise<MetricRead> => {
  let response;
  try {
    response = await run(query);
  } catch {
    return { ok: false, message: "Не удалось связаться с сервером" };
  }

  if (response.status !== 200) {
    return {
      ok: false,
      message: problemDetails(errorData(response), fallback),
    };
  }

  return { ok: true, points: parseMetricValues(response.data) };
};

const readNewest = async (
  run: MetricRun,
  from: number,
  to: number,
  fallback: string
): Promise<MetricRead> => {
  let start = from;
  let newest: MetricValues = [];

  for (;;) {
    const read = await readMetricPage(run, metricQuery(start, to), fallback);
    if (!read.ok) return read;

    const last = lastPoint(read.points);
    if (read.points.length > 0) newest = read.points;

    if (
      read.points.length < METRICS_PAGE_LIMIT ||
      !last ||
      last.timestamp < start ||
      last.timestamp >= to
    ) {
      return { ok: true, points: newest };
    }

    start = last.timestamp + 1;
  }
};

const readLatest = async (
  run: MetricRun,
  fallback: string
): Promise<LatestRead> => {
  const to = Date.now();

  for (const span of [
    METRICS_RECENT_WINDOW_MS,
    METRICS_WIDE_WINDOW_MS,
    METRICS_LOOKBACK_MS,
  ]) {
    const read = await readNewest(run, to - span, to, fallback);
    if (!read.ok) return read;

    const latest = lastPoint(read.points);
    if (latest) return { ok: true, latest };
  }

  return { ok: true, latest: undefined };
};

const summarizeMetrics = (
  battery: LatestRead,
  power: LatestRead
): Result<MetricsSummary, APIError> => {
  const batteryLast = battery.ok ? battery.latest : undefined;
  const powerLast = power.ok ? power.latest : undefined;

  return Result.ok({
    batteryLevel: batteryLast ? batteryLast.value : null,
    batteryUpdatedAt: batteryLast ? batteryLast.timestamp : null,
    powerConnected: powerLast ? powerLast.value === 1 : null,
    powerUpdatedAt: powerLast ? powerLast.timestamp : null,
  });
};

// У хаба нет температуры: summary агрегирует только метрики устройства
// (батарея, питание). Температура — метрика датчика и запрашивается
// отдельно по /sensors/{id}/metrics/{metric}.
export const getDeviceMetricsSummary = async (
  deviceId: string
): Promise<Result<MetricsSummary, APIError>> => {
  const [battery, power] = await Promise.all([
    readLatest(
      (query) => getDeviceMetricsByNameOp(deviceId, BATTERY_METRIC, query),
      METRICS_ERROR
    ),
    readLatest(
      (query) => getDeviceMetricsByNameOp(deviceId, POWER_METRIC, query),
      METRICS_ERROR
    ),
  ]);

  return summarizeMetrics(battery, power);
};

// Батарея и питание публикуются и датчиками — тот же профиль метрик,
// но по /sensors/{id}/metrics/{metric}.
export const getSensorMetricsSummary = async (
  deviceId: string,
  sensorId: string
): Promise<Result<MetricsSummary, APIError>> => {
  const [battery, power] = await Promise.all([
    readLatest(
      (query) =>
        getSensorMetricsByNameOp(deviceId, sensorId, BATTERY_METRIC, query),
      METRICS_ERROR
    ),
    readLatest(
      (query) =>
        getSensorMetricsByNameOp(deviceId, sensorId, POWER_METRIC, query),
      METRICS_ERROR
    ),
  ]);

  return summarizeMetrics(battery, power);
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

const SENSOR_METRICS_ERROR = "Не удалось загрузить метрики датчика";
const TEMPERATURE_HISTORY_MS = 60 * 60 * 1000;

export type SensorWithTemperature = Sensor & { temperature: number | null };

// Последняя температура одного датчика (для списков, без истории).
const getSensorLatestTemperature = async (
  deviceId: string,
  sensorId: string
): Promise<number | null> => {
  const read = await readLatest(
    (query) =>
      getSensorMetricsByNameOp(deviceId, sensorId, TEMPERATURE_METRIC, query),
    SENSOR_METRICS_ERROR
  );
  const latest = read.ok ? read.latest : undefined;
  return latest && latest.name === TEMPERATURE_METRIC ? latest.value : null;
};

// Датчики устройства с текущей температурой для карточек-списков.
export const getSensorsWithTemperatures = async (
  deviceId: string
): Promise<Result<SensorWithTemperature[], APIError>> => {
  const result = await getDeviceSensors(deviceId);
  if (result.isErr) return Result.err(result.error);

  const sensors = await Promise.all(
    result.value.map(async (sensor) => ({
      ...sensor,
      temperature: await getSensorLatestTemperature(deviceId, sensor.id),
    }))
  );
  return Result.ok(sensors);
};

// Температура — метрика датчика: последнее значение ищем за 24 часа,
// на графике показываем час до него.
export const getSensorTemperature = async (
  deviceId: string,
  sensorId: string
): Promise<Result<SensorTemperature, APIError>> => {
  const run: MetricRun = (query) =>
    getSensorMetricsByNameOp(deviceId, sensorId, TEMPERATURE_METRIC, query);

  const latestRead = await readLatest(run, SENSOR_METRICS_ERROR);
  if (!latestRead.ok) return Result.err(latestRead.message);

  const latest = latestRead.latest;
  if (!latest || latest.name !== TEMPERATURE_METRIC) {
    return Result.ok({ current: null, updatedAt: null, history: [] });
  }

  const historyRead = await readNewest(
    run,
    latest.timestamp - TEMPERATURE_HISTORY_MS,
    latest.timestamp,
    SENSOR_METRICS_ERROR
  );
  if (!historyRead.ok) return Result.err(historyRead.message);

  const history = historyRead.points
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
export {
  getDeviceNotifications,
  type DeviceNotification,
  type NotificationPage,
  type NotificationSeverity,
} from "./notifications";
