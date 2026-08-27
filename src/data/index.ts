import api from "@/api";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { Result, Unit } from "true-myth";
import { isValidEmail } from "@/utils/validators";
import type { User } from "@/models/models";

export type Device = {
  id: string;
  name: string;
  owner?: string;
  isConnected: boolean;
  createdAt?: string;
  temperature?: number | null;
  lastConnection?: string;
};

export type APIError = string;

const isOkStatus = (status: number) => status >= 200 && status < 300;

const errorDetails = (data: unknown, fallback: string): string => {
  if (data && typeof data === "object" && "details" in data) {
    const details = (data as { details?: unknown }).details;
    if (typeof details === "string" && details.length > 0) return details;
  }
  return fallback;
};

type Validator<T> = (data: unknown) => Result<T, APIError>;

const withObject = <T>(key: string): Validator<T> => (data) => {
  if (data && typeof data === "object" && key in (data as object)) {
    const value = (data as Record<string, unknown>)[key];
    if (value != null) return Result.ok(value as T);
  }
  return Result.err(`unexpected response shape: missing "${key}"`);
};

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
    return Result.err(errorDetails(response.data, fallbackError));
  }

  return validate(response.data);
};

// ============= Устройства =============
// NOTE: GET /api/devices/my ещё не реализован на бэке
export const getUserDevices = async (): Promise<Result<Device[], APIError>> =>
  request(
    { method: "get", url: "/api/devices/my" },
    withObject<Device[]>("devices"),
    "Не удалось загрузить устройства"
  );

const asDevice: Validator<Device> = (data) => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (record["device"] && typeof record["device"] === "object") {
      return Result.ok(record["device"] as Device);
    }
    if (typeof record["id"] === "string") {
      return Result.ok(data as Device);
    }
  }
  return Result.err('unexpected response shape: missing "device"');
};

// NOTE: GET /api/devices/:id ещё не реализован на бэке
export const getDeviceById = async (
  deviceId: string
): Promise<Result<Device, APIError>> =>
  request(
    { method: "get", url: `/api/devices/${encodeURIComponent(deviceId)}` },
    asDevice,
    "Не удалось загрузить устройство"
  );

// NOTE: DELETE /api/devices/:id ещё не реализован на бэке
export const disconnectDevice = async (
  deviceId: string
): Promise<Result<Unit, APIError>> =>
  request(
    {
      method: "delete",
      url: `/api/devices/${encodeURIComponent(deviceId)}`,
    },
    okUnit,
    "Не удалось отключить устройство"
  );

// NOTE: PATCH /api/devices/:id ещё не реализован на бэке
export const updateDevice = async (
  deviceId: string,
  name: string
): Promise<Result<Unit, APIError>> =>
  request(
    {
      method: "patch",
      url: `/api/devices/${encodeURIComponent(deviceId)}`,
      data: { name },
    },
    okUnit,
    "Не удалось обновить устройство"
  );

// NOTE(api-contract): бэкенд использует 304 как «email уже подтверждён».
const STATUS_ALREADY_CONFIRMED = 304;

// ============= Подтверждение почты =============
export const startEmailConfirmation =
  async (): Promise<Result<Unit, APIError>> => {
    let response: AxiosResponse;
    try {
      response = await api.post("/api/users/start-email-confirmation");
    } catch {
      return Result.err("Не удалось связаться с сервером");
    }
    if (response.status === STATUS_ALREADY_CONFIRMED) return Result.ok(Unit);
    if (!isOkStatus(response.status)) {
      return Result.err(
        errorDetails(response.data, "Failed to send confirmation email")
      );
    }
    return Result.ok(Unit);
  };

export const confirmEmail = async (
  token: string
): Promise<Result<Unit, APIError>> => {
  let response: AxiosResponse;
  try {
    response = await api.post(
      `/api/users/confirm-email/${encodeURIComponent(token)}`
    );
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }
  if (response.status === STATUS_ALREADY_CONFIRMED) return Result.ok(Unit);
  if (!isOkStatus(response.status)) {
    return Result.err(errorDetails(response.data, "Failed to confirm email"));
  }
  return Result.ok(Unit);
};

export const connectDevice = async (
  deviceId: string,
  password: string,
  name: string
): Promise<Result<Unit, APIError>> => {
  let response: AxiosResponse;
  try {
    response = await api.post("/api/v2/devices/connect", {
      deviceId,
      password,
      name,
    });
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  switch (response.status) {
    case 201:
      return Result.ok(Unit);
    case 404:
      return Result.err("Устройство не найдено");
    case 403:
      return Result.err("Неверный пароль устройства");
    case 409:
      return Result.err("Устройство уже подключено");
    default:
      return Result.err(
        errorDetails(response.data, "Не удалось подключить устройство")
      );
  }
};

type State = "online" | "temperature";
export type DeviceStateRecord<TValue> = {
  state: State;
  value: TValue;
  timestamp: string;
  deviceId: string;
};

export const getDeviceStates = async <TValue>(
  deviceId: string,
  state: State,
  history: number
): Promise<Result<DeviceStateRecord<TValue>[], APIError>> => {
  if (history < 0) {
    return Result.err("history can't be less than zero");
  }

  const response = await request<{ result: DeviceStateRecord<TValue>[] }>(
    {
      method: "get",
      url: `/api/v2/devices/${encodeURIComponent(deviceId)}/state/${state}`,
      params: { history },
    },
    withObject("result"),
    "Не удалось загрузить состояние устройства"
  );
  return response.map((r) => r.result);
};

const first = <T>(array: T[]): Result<T, string> => {
  const first = array[0];
  if (first) return Result.ok(first);
  else return Result.err("no elements provided");
};

export const getDeviceState = async <TValue>(
  deviceId: string,
  state: State
): Promise<Result<DeviceStateRecord<TValue>, APIError>> => {
  const response = await getDeviceStates<TValue>(deviceId, state, 1);
  return response
    .andThen((r) => first(r))
    .mapErr((e) => `no states provided in response ${e}`);
};

export const sendDeviceCommand = async (
  deviceId: string,
  command: string,
  args: Record<string, string | number> = {}
): Promise<Result<Unit, APIError>> =>
  request(
    {
      method: "post",
      url: `/api/v2/devices/${encodeURIComponent(deviceId)}/command`,
      data: { command, args },
    },
    okUnit,
    "Не удалось отправить команду"
  );

export const getCurrentUser = async (): Promise<Result<User, APIError>> =>
  request(
    { method: "get", url: "/api/users/me" },
    withObject<User>("user"),
    "Не удалось загрузить пользователя"
  );

// ============= Профиль =============
export const setUserEmail = async (
  userId: string,
  email: string
): Promise<Result<Unit, APIError>> => {
  const trimmed = email.trim();
  if (!isValidEmail(trimmed)) {
    return Result.err("Некорректный email");
  }
  return request(
    {
      method: "post",
      url: `/api/users/${encodeURIComponent(userId)}/set-email`,
      data: { email: trimmed },
    },
    okUnit,
    "Не удалось обновить email"
  );
};

export const setUserPassword = async (
  userId: string,
  password: string
): Promise<Result<Unit, APIError>> => {
  if (!password) return Result.err("Пароль не может быть пустым");
  return request(
    {
      method: "post",
      url: `/api/users/${encodeURIComponent(userId)}/set-password`,
      data: { password },
    },
    okUnit,
    "Не удалось обновить пароль"
  );
};

export { logout } from "./auth";
