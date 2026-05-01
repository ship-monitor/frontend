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

type BadResponseBody = { details: string };
type Response<T extends object> = T | BadResponseBody;

const checkResponse = <T extends object>(response: AxiosResponse<Response<T>>): T => {
  if (typeof response.data === "object" && "details" in response.data) {
    console.error("Failed execute request %s: %s", response.request.url, response.data.details);
    throw new Error("Request failed");
  }
  return response.data;
};

export const getUsersOrganizations = async (): Promise<Organization[]> => {
  const result = await api.get<Response<{ organizations: Organization[] }>>("/api/organizations/my");
  return checkResponse(result).organizations;
};

export const getOrganizationById = async (id: string): Promise<Organization> => {
  const result = await api.get<Response<Organization>>(`/api/organizations/${id}`);
  return checkResponse(result);
};

export const createOrganization = async (name: string): Promise<Organization> => {
  const result = await api.post<Response<Organization>>("/api/organizations", { name });
  return checkResponse(result);
};

export const updateOrganization = async (id: string, name: string): Promise<Organization> => {
  const result = await api.patch<Response<Organization>>(`/api/organizations/${id}`, { name });
  return checkResponse(result);
};

export const deleteOrganization = async (id: string): Promise<void> => {
  const result = await api.delete(`/api/organizations/${id}`);
  checkResponse(result.data);
};

export const getOrganizationMembers = async (id: string): Promise<Member[]> => {
  const result = await api.get<Response<{ members: any[] }>>(`/api/organizations/${id}/members`);
  const data = checkResponse(result);
  return (data.members ?? []).map((m: any) => ({
    userId: m.memberId || m.userId,
    email: m.email,
    name: m.name,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
};

export const inviteMembers = async (id: string, emails: string[]): Promise<void> => {
  const result = await api.post(`/api/organizations/${id}/invitations`, {
    inviteeEmails: emails,
  });
  checkResponse(result);
};

export const removeMembers = async (id: string, userIds: string[]): Promise<void> => {
  for (const userId of userIds) {
    const result = await api.delete(`/api/organizations/${id}/members/${userId}`);
    checkResponse(result);
  }
};

export const getInvitations = async (): Promise<Invitation[]> => {
  const result = await api.get<Response<{ invitations: any[] }>>("/api/invitations");
  const data = checkResponse(result);
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
  const result = await api.post(`/api/invitations/${invitationId}/accept`);
  checkResponse(result);
};

export const rejectInvitation = async (invitationId: string): Promise<void> => {
  const result = await api.post(`/api/invitations/${invitationId}/decline`);
  checkResponse(result);
};
