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
};

export type Invitation = {
  organizationId: string;
  creationDate: string;
  organizationName?: string;
};

type BadResponseBody = { details: string };

type Response<T extends object> = T | BadResponseBody;

const checkResponse = <T extends object>(
  response: AxiosResponse<Response<T>>
): T => {
  if (typeof response.data === "object" && "details" in response.data) {
    console.error(
      "Failed execute request %s: %s",
      response.request.url,
      response.data.details
    );
    console.debug("response", response);
    throw new Error("Request failed");
  }
  return response.data;
};

// ========== ОРГАНИЗАЦИИ ==========

export const getUsersOrganizations = async (): Promise<Organization[]> => {
  const result = await api.get<Response<{ organizations: Organization[] }>>(
    "/api/organizations/my"
  );
  return checkResponse(result).organizations;
};

export const getOrganizationById = async (
  id: string
): Promise<Organization> => {
  const result = await api.get<Response<Organization>>(
    `/api/organizations/${id}`
  );
  return checkResponse(result);
};

export const createOrganization = async (
  name: string
): Promise<Organization> => {
  const result = await api.post<Response<Organization>>("/api/organizations", {
    name,
  });
  return checkResponse(result);
};

export const updateOrganization = async (
  id: string,
  name: string
): Promise<Organization> => {
  const result = await api.patch<Response<Organization>>(
    `/api/organizations/${id}`,
    { name }
  );
  return checkResponse(result);
};

export const deleteOrganization = async (id: string): Promise<void> => {
  const result = await api.delete(`/api/organizations/${id}`);
  checkResponse(result.data);
};

// ========== УЧАСТНИКИ ==========

export const getOrganizationMembers = async (id: string): Promise<Member[]> => {
  const result = await api.get<Response<{ members: Member[] }>>(
    `/api/organizations/${id}/members`
  );
  return checkResponse(result).members ?? [];
};

export const inviteMembers = async (
  id: string,
  emails: string[]
): Promise<void> => {
  const result = await api.post(`/api/organizations/${id}/members`, {
    mails: emails,
  });
  checkResponse(result);
};

export const removeMembers = async (
  id: string,
  userIds: string[]
): Promise<void> => {
  for (const userId of userIds) {
    const result = await api.delete(
      `/api/organizations/${id}/members/${userId}`
    );
    checkResponse(result);
  }
};

// ========== ПРИГЛАШЕНИЯ ==========

export const getInvitations = async (): Promise<Invitation[]> => {
  const result =
    await api.get<Response<{ invitations: Invitation[] }>>("/api/invitations");
  return checkResponse(result).invitations ?? [];
};

export const acceptInvitation = async (
  organizationId: string
): Promise<void> => {
  const result = await api.post(`/api/invitations/${organizationId}/accept`);
  checkResponse(result);
};

export const rejectInvitation = async (
  organizationId: string
): Promise<void> => {
  const result = await api.post(`/api/invitations/${organizationId}/reject`);
  checkResponse(result);
};
