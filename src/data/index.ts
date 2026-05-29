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
  nodeId?: string;
  lastConnection?: string;
  firstConnection?: string;
  connected?: boolean;
  status?: "online" | "offline" | "error";
  createdAt?: string;
};

const checkResponse = <T extends object>(response: AxiosResponse): T => {
  if (!response || !response.data) {
    console.error("Empty response");
    throw new Error("Empty response");
  }
  if (typeof response.data === "object" && "details" in response.data) {
    console.error("Request failed:", response.data.details);
    throw new Error(response.data.details || "Request failed");
  }
  return response.data;
};

export const getUsersOrganizations = async (): Promise<Organization[]> => {
  const result = await api.get("/api/organizations/my");
  return checkResponse<{ organizations: Organization[] }>(result).organizations || [];
};

export const getOrganizationById = async (id: string): Promise<Organization> => {
  const result = await api.get(`/api/organizations/${id}`);
  return checkResponse<Organization>(result);
};

export const createOrganization = async (name: string): Promise<Organization> => {
  const result = await api.post("/api/organizations", { name });
  return checkResponse<Organization>(result);
};

export const updateOrganization = async (id: string, name: string): Promise<Organization> => {
  const result = await api.patch(`/api/organizations/${id}`, { name });
  return checkResponse<Organization>(result);
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await api.delete(`/api/organizations/${id}`);
};

export const getOrganizationMembers = async (id: string): Promise<Member[]> => {
  const result = await api.get(`/api/organizations/${id}/members`);
  const data = checkResponse<{ members: any[] }>(result);
  return (data.members ?? []).map((m: any) => ({
    userId: m.memberId || m.userId,
    email: m.email,
    name: m.name,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
};

export const inviteMembers = async (orgId: string, emails: string | string[]): Promise<void> => {
  const emailsArray = typeof emails === 'string' 
    ? emails.split(',').map(e => e.trim()).filter(Boolean)
    : emails;
    
  if (emailsArray.length === 0) {
    throw new Error('No valid emails provided');
  }
  
  await api.post(`/api/organizations/${orgId}/invitations`, {
    inviteeEmails: emailsArray,
  });
};

export const removeMembers = async (id: string, userIds: string[]): Promise<void> => {
  for (const userId of userIds) {
    await api.delete(`/api/organizations/${id}/members/${userId}`);
  }
};

export const getInvitations = async (): Promise<Invitation[]> => {
  const result = await api.get("/api/invitations");
  const data = checkResponse<{ invitations: any[] }>(result);
  return (data.invitations ?? []).map((inv: any) => ({
    id: inv.id,
    organizationId: inv.organizationId,
    organizationName: inv.organizationName,
    inviteeEmail: inv.inviteeEmail,
    status: inv.status,
    creationDate: inv.createdAt,
  }));
};

export const acceptInvitation = async (invitationId: string): Promise<void> => {
  await api.post(`/api/invitations/${invitationId}/accept`);
};

export const rejectInvitation = async (invitationId: string): Promise<void> => {
  await api.post(`/api/invitations/${invitationId}/decline`);
};

// API для устройств
export const getOrganizationDevices = async (orgId: string): Promise<Device[]> => {
  const result = await api.get(`/api/organizations/${orgId}/devices`);
  const data = checkResponse<{ devices: Device[] }>(result);
  return data.devices || [];
};

// Фикс: правильные поля для подключения устройства
export const connectDevice = async (
  orgId: string,
  deviceId?: string,
  name?: string
): Promise<Device> => {
  // Пробуем разные варианты payload которые может ожидать API
  const payload: any = {};
  
  if (deviceId) {
    payload.nodeId = deviceId;
    payload.id = deviceId;
  }
  if (name) {
    payload.name = name;
  }
  
  console.log('Connecting device with payload:', payload);
  
  const result = await api.post(`/api/organizations/${orgId}/devices`, payload);
  return checkResponse<Device>(result);
};

export const disconnectDevice = async (
  orgId: string,
  deviceId: string
): Promise<void> => {
  await api.delete(`/api/organizations/${orgId}/devices/${deviceId}`);
};

export const getDeviceInfo = async (
  orgId: string,
  deviceId: string
): Promise<Device> => {
  const result = await api.get(`/api/organizations/${orgId}/devices/${deviceId}`);
  return checkResponse<Device>(result);
};
