import api from "@/api";
import type { AxiosError, AxiosResponse } from "axios";

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

export type CommandResult<T> = {
  data?: T;
  commandError?: string;
  requestError?: string;
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

export const disconnectDevice = async (deviceId: string): Promise<void> => {
  await api.delete(`/api/devices/${deviceId}`);
};

export const getDeviceInfo = async (deviceId: string): Promise<Device> => {
  const result = await api.get(`/api/devices/${deviceId}`);
  return checkResponse<Device>(result);
};

export const sendDeviceCommand = async <T, K>(
  deviceId: string,
  command: string,
  args: K | null = null
): Promise<CommandResult<T>> => {
  try {
    const result = await api.post(`/api/devices/${deviceId}/command`, {
      command,
      args: args ?? {},
    });

    // Логируем всё
    console.log(`[CMD:${command}] Status:`, result.status);
    console.log(`[CMD:${command}] Full body:`, JSON.stringify(result.data));
    console.log(
      `[CMD:${command}] data field:`,
      JSON.stringify(result.data?.data)
    );
    console.log(`[CMD:${command}] commandError:`, result.data?.commandError);

    return {
      commandError: result.data?.commandError || undefined,
      data: result.data?.data !== undefined ? result.data.data : null,
    };
  } catch (error) {
    if (error as AxiosError) {
      const aerror = error as AxiosError;
      console.error(
        `[CMD:${command}] HTTP error:`,
        aerror.response?.status,
        aerror.response?.data
      );

      const resp = aerror.response?.data as CommandResult<T>;
      if (resp.requestError) {
        return { requestError: resp.requestError };
      }
      return { requestError: aerror.message || "Ошибка сети" };
    }
    return { requestError: "something went wrong: " + error };
  }
};
