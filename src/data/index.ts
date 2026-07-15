import api from "@/api";
import type { AxiosResponse } from "axios";
import { Result, Unit } from "true-myth";

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Member = {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  joinedAt?: string;
};

export type Invitation = {
  id: string;
  organizationId: string;
  organizationName?: string;
  inviteeEmail?: string;
  status?: string;
  creationDate: string;
};

export type Device = {
  id: string;
  name: string;
  organizationId?: string;
  isConnected: boolean;
  createdAt?: string;
  temperature?: number | null;
  lastConnection?: string;
};

export type APIError = string;

const responseToResult = <TResponse>(
  response: AxiosResponse
): Result<TResponse, APIError> => {
  if (!response?.data) return Result.err("empty response");

  if (typeof response.data === "object" && "details" in response.data) {
    return Result.err(response.data.details || "request failed");
  }
  return Result.ok(response.data);
};

// ============= Организации =============
export const getUsersOrganizations = async (): Promise<
  Result<Organization[], APIError>
> => {
  const response = await api.get("/api/organizations/my");
  return responseToResult<{ organizations: Organization[] }>(response).map(
    (r) => r.organizations
  );
};

export const getOrganizationById = async (
  id: string
): Promise<Result<Organization, APIError>> => {
  const response = await api.get(`/api/organizations/${id}`);
  return responseToResult<Organization>(response);
};

export const createOrganization = async (
  name: string
): Promise<Result<Organization, APIError>> => {
  const result = await api.post("/api/organizations/", { name });
  return responseToResult<Organization>(result);
};

export const updateOrganization = async (
  id: string,
  name: string
): Promise<Result<Organization, APIError>> => {
  const result = await api.patch(`/api/organizations/${id}`, { name });
  return responseToResult<Organization>(result);
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await api.delete(`/api/organizations/${id}`);
};

// ============= Участники =============
export const getOrganizationMembers = async (
  id: string
): Promise<Result<Member[], APIError>> => {
  const response = await api.get(`/api/organizations/${id}/members`);
  return responseToResult<{ members: Member[] }>(response).map(
    (r) => r.members
  );
};

export const inviteMembers = async (
  orgId: string,
  emails: string | string[]
): Promise<void> => {
  const emailsArray =
    typeof emails === "string"
      ? emails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
      : emails;
  if (emailsArray.length === 0) throw new Error("No valid emails provided");
  await api.post(`/api/organizations/${orgId}/invitations`, {
    inviteeEmails: emailsArray,
  });
};

export const removeMembers = async (
  id: string,
  userIds: string[]
): Promise<void> => {
  for (const userId of userIds) {
    await api.delete(`/api/organizations/${id}/members/${userId}`);
  }
};

// ============= Приглашения =============
export const getInvitations = async (): Promise<
  Result<Invitation[], APIError>
> => {
  const response = await api.get("/api/invitations");
  return responseToResult<{ invitations: Invitation[] }>(response).map(
    (r) => r.invitations
  );
};

export const acceptInvitation = async (invitationId: string): Promise<void> => {
  await api.post(`/api/invitations/${invitationId}/accept`);
};

export const rejectInvitation = async (invitationId: string): Promise<void> => {
  await api.post(`/api/invitations/${invitationId}/decline`);
};

// ============= Устройства =============
export const getDeviceById = async (
  deviceId: string
): Promise<Result<Device, APIError>> => {
  const result = await api.get(`/api/devices/${deviceId}`);
  return responseToResult<Device>(result);
};

const STATUS_OK = 200;
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
  const response = await api.post(`/api/users/confirm-email/${token}`, null, {
    validateStatus: () => true,
  });
  if (response.status === STATUS_CONFLICT) return Result.ok();
  if (response.status !== STATUS_OK) {
    return Result.err(response.data?.details || "Failed to confirm email");
  }

  return Result.ok();
};

export const getOrganizationDevices = async (
  orgId: string
): Promise<Result<Device[], APIError>> => {
  const result = await api.get(`/api/organizations/${orgId}/devices`);
  return responseToResult<{ devices: Device[] }>(result).map((r) => r.devices);
};

export const connectDevice = async (
  orgId: string,
  deviceId?: string,
  name?: string
): Promise<Result<Device, APIError>> => {
  const result = await api.post(`/api/organizations/${orgId}/devices`, {
    deviceId,
    name,
  });
  return responseToResult<Device>(result);
};

export const updateDevice = async (
  deviceId: string,
  name: string
): Promise<Result<Device, APIError>> => {
  const result = await api.patch(`/api/devices/${deviceId}`, { name });
  return responseToResult<Device>(result);
};

export const disconnectDevice = async (deviceId: string): Promise<void> => {
  await api.delete(`/api/devices/${deviceId}`);
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
    .map((r) => first(r))
    .flatten()
    .mapErr((e) => `no states provided in response ${e}`);
};

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

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  blocked: boolean;
};

export const sendDeviceCommand = async (
  deviceId: string,
  command: string,
  args: Record<string, string | number> = {}
): Promise<void> => {
  await api.post(`/api/v2/devices/${deviceId}/command`, { command, args });
};

export const getCurrentUser = async (): Promise<Result<User, APIError>> => {
  const result = await api.get("/api/users/me");
  return responseToResult<{ user: User }>(result).map((r) => r.user);
};
