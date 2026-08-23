import api from "@/api";
import type { AxiosResponse } from "axios";
import { Result, Unit } from "true-myth";

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

// TODO(data): Require a 2xx status and validate the expected payload before returning Ok; body shape alone cannot establish HTTP success.
// TODO(data): Route requests through a shared wrapper that converts transport failures into Result errors so callers never need both Result and try/catch handling.
const responseToResult = <TResponse>(
  response: AxiosResponse
): Result<TResponse, APIError> => {
  if (!response?.data) return Result.err("empty response");

  if (typeof response.data === "object" && "details" in response.data) {
    return Result.err(response.data.details || "request failed");
  }
  return Result.ok(response.data);
};

// ============= Устройства =============
// NOTE: GET /api/devices/my ещё не реализован на бэке
export const getUserDevices = async (): Promise<Result<Device[], APIError>> => {
  const result = await api.get(`/api/devices/my`);
  return responseToResult<{ devices: Device[] }>(result).map((r) => r.devices);
};

// NOTE: GET /api/devices/:id ещё не реализован на бэке
export const getDeviceById = async (
  deviceId: string
): Promise<Result<Device, APIError>> => {
  const result = await api.get(`/api/devices/${deviceId}`);
  return responseToResult<Device>(result);
};

// NOTE: DELETE /api/devices/:id ещё не реализован на бэке
export const disconnectDevice = async (deviceId: string): Promise<void> => {
  // TODO(data): Check the HTTP status and return a Result so failed device mutations are not reported as success.
  await api.delete(`/api/devices/${deviceId}`);
};

// NOTE: PATCH /api/devices/:id ещё не реализован на бэке
export const updateDevice = async (
  deviceId: string,
  name: string
): Promise<Result<Device, APIError>> => {
  const result = await api.patch(`/api/devices/${deviceId}`, { name });
  return responseToResult<Device>(result);
};

const STATUS_OK = 200;
// TODO(api-contract): Verify this idempotency response with the backend; HTTP Conflict is 409, while 304 has cache semantics.
const STATUS_CONFLICT = 304;

// ============= Подтверждение почты =============
export const startEmailConfirmation = async (): Promise<
  Result<Unit, APIError>
> => {
  const response = await api.post("/api/users/start-email-confirmation", null, {
    validateStatus: () => true,
  });
  if (response.status === STATUS_CONFLICT) return Result.ok();
  if (response.status !== STATUS_OK) {
    return Result.err(
      response.data?.details || "Failed to send confirmation email"
    );
  }

  return Result.ok();
};

export const confirmEmail = async (
  token: string
): Promise<Result<Unit, APIError>> => {
  // TODO(security): Encode the token as a URL path segment after the page validates that exactly one non-empty query token was supplied.
  const response = await api.post(`/api/users/confirm-email/${token}`, null, {
    validateStatus: () => true,
  });
  if (response.status === STATUS_CONFLICT) return Result.ok();
  if (response.status !== STATUS_OK) {
    return Result.err(response.data?.details || "Failed to confirm email");
  }

  return Result.ok();
};

export const connectDevice = async (
  deviceId: string,
  password: string,
  name: string
): Promise<Result<Unit, APIError>> => {
  const response = await api.post(
    `/api/v2/devices/connect`,
    { deviceId, password, name },
    { validateStatus: () => true }
  );

  switch (response.status) {
    case 201:
      return Result.ok();
    case 404:
      return Result.err("Устройство не найдено");
    case 403:
      return Result.err("Неверный пароль устройства");
    case 409:
      return Result.err("Устройство уже подключено");
    default:
      return Result.err(
        response.data?.details || "Не удалось подключить устройство"
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

  const response = await api.get(
    `/api/v2/devices/${deviceId}/state/${state}?history=${history}`,
    {
      validateStatus: () => true,
    }
  );

  return responseToResult<{ result: DeviceStateRecord<TValue>[] }>(
    response
  ).map((r) => r.result);
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

// TODO(dead-code): Remove this unused API or request a real history length; history=1 duplicates the latest-state operation despite the function name.
export const getDeviceStateWithHistory = async <TValue>(
  deviceId: string,
  state: State
): Promise<Result<DeviceStateRecord<TValue>[], APIError>> => {
  const response = await api.get(
    `/api/v2/devices/${deviceId}/state/${state}?history=1`
  );
  return responseToResult<{ result: DeviceStateRecord<TValue>[] }>(
    response
  ).map((r) => r.result);
};

// TODO(models): Replace this duplicate private User shape with the canonical authenticated-user model shared by the data layer and Pinia.
type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  blocked: boolean;
};

// TODO(data): Return a Result after checking the response status so callers do not close the command dialog on HTTP 4xx/5xx responses.
export const sendDeviceCommand = async (
  deviceId: string,
  command: string,
  args: Record<string, string | number> = {}
): Promise<void> => {
  await api.post(`/api/v2/devices/${deviceId}/command`, { command, args });
};

export const getCurrentUser = async (): Promise<Result<User, APIError>> => {
  try {
    const result = await api.get("/api/users/me");
    return responseToResult<{ user: User }>(result).map((r) => r.user);
  } catch (e) {
    // Сетевые/CORS-ошибки axios отклоняет несмотря на validateStatus.
    return Result.err("failed to reach auth service: " + e);
  }
};

export { logout } from "./auth";
