import api from "@/api";
import type { AxiosResponse } from "axios";

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

const checkResponse = <T>(response: AxiosResponse): T => {
  if (!response?.data) throw new Error("Empty response");
  if (typeof response.data === "object" && "details" in response.data) {
    throw new Error(response.data.details || "Request failed");
  }
  return response.data;
};

// ============= Организации =============
export const getUsersOrganizations = async (): Promise<Organization[]> => {
  const result = await api.get("/api/organizations/my");
  return (
    checkResponse<{ organizations: Organization[] }>(result).organizations || []
  );
};

export const getOrganizationById = async (
  id: string
): Promise<Organization> => {
  const result = await api.get(`/api/organizations/${id}`);
  return checkResponse<Organization>(result);
};

export const createOrganization = async (
  name: string
): Promise<Organization> => {
  const result = await api.post("/api/organizations/", { name });
  return checkResponse<Organization>(result);
};

export const updateOrganization = async (
  id: string,
  name: string
): Promise<Organization> => {
  const result = await api.patch(`/api/organizations/${id}`, { name });
  return checkResponse<Organization>(result);
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await api.delete(`/api/organizations/${id}`);
};

// ============= Участники =============
export const getOrganizationMembers = async (id: string): Promise<Member[]> => {
  const result = await api.get(`/api/organizations/${id}/members`);
  const data = checkResponse<{ members: Member[] }>(result);
  return (data.members ?? []).map((m) => ({
    userId: m.userId,
    email: m.email,
    name: m.name,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
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
export const getInvitations = async (): Promise<Invitation[]> => {
  const result = await api.get("/api/invitations");
  const data = checkResponse<{ invitations: Invitation[] }>(result);
  return data.invitations ?? [];
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
): Promise<Device> => {
  const result = await api.get(`/api/devices/${deviceId}`);
  return checkResponse<Device>(result);
};

// ============= Подтверждение почты =============
export const startEmailConfirmation = async (): Promise<void> => {
  const result = await api.post("/api/users/start-email-confirmation", null, {
    validateStatus: () => true,
  });
  if (result.status === 304) return;
  if (result.status !== 200) {
    throw new Error(result.data?.details || "Failed to send confirmation email");
  }
};

export const confirmEmail = async (token: string): Promise<void> => {
  const result = await api.post(`/api/users/confirm-email/${token}`, null, {
    validateStatus: () => true,
  });
  if (result.status === 304) return;
  if (result.status !== 200) {
    throw new Error(result.data?.details || "Failed to confirm email");
  }
};

export const getOrganizationDevices = async (
  orgId: string
): Promise<Device[]> => {
  const result = await api.get(`/api/organizations/${orgId}/devices`);
  const data = checkResponse<{ devices: Device[] }>(result);
  return data.devices || [];
};

export const connectDevice = async (
  orgId: string,
  deviceId?: string,
  name?: string
): Promise<Device> => {
  const result = await api.post(`/api/organizations/${orgId}/devices`, {
    deviceId,
    name,
  });
  return checkResponse<Device>(result);
};

export const updateDevice = async (
  deviceId: string,
  name: string
): Promise<Device> => {
  const result = await api.patch(`/api/devices/${deviceId}`, { name });
  return checkResponse<Device>(result);
};

export const disconnectDevice = async (deviceId: string): Promise<void> => {
  await api.delete(`/api/devices/${deviceId}`);
};

export type DeviceStateItem = {
  state: string;
  value: boolean | number;
  timestamp: string;
  deviceId: string;
};

export const getDeviceState = async (
  deviceId: string,
  state: "network" | "temperature"
): Promise<boolean | number | null> => {
  const result = await api.get(`/api/v2/devices/${deviceId}/state/${state}`, {
    validateStatus: () => true,
  });
  if (result.status === 404 || result.status === 403 || result.status === 401 || result.status === 204) {
    return null;
  }
  if (result.status !== 200) {
    return null;
  }
  const data = checkResponse<{ result: DeviceStateItem[] }>(result);
  const item = data.result?.[0];
  if (item) {
    return item.value;
  }
  return null;
};

export const getDeviceStateWithHistory = async (
  deviceId: string,
  state: "network" | "temperature"
): Promise<DeviceStateItem[]> => {
  const result = await api.get(`/api/v2/devices/${deviceId}/state/${state}?history=1`);
  return checkResponse<{ result: DeviceStateItem[] }>(result).result || [];
};

export const sendDeviceCommand = async (
  deviceId: string,
  command: string,
  args: Record<string, string | number> = {}
): Promise<void> => {
  await api.post(`/api/v2/devices/${deviceId}/command`, { command, args });
};
