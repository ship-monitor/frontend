import api from "@/api";

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

// ========== ОРГАНИЗАЦИИ ==========

export const getUsersOrganizations = async (): Promise<Organization[]> => {
  const result = await api.get<{ organizations: Organization[] | null }>(
    "/api/organizations/my"
  );
  return result.data.organizations ?? [];
};

export const createOrganization = async (name: string): Promise<Organization> => {
  const result = await api.post("/api/organizations", { name });
  return result.data;
};

export const updateOrganization = async (id: string, name: string): Promise<Organization> => {
  const result = await api.patch(`/api/organizations/${id}`, { name });
  return result.data;
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await api.delete(`/api/organizations/${id}`);
};

// ========== УЧАСТНИКИ ==========

export const getOrganizationMembers = async (id: string): Promise<Member[]> => {
  const result = await api.get<{ members: Member[] | null }>(
    `/api/organizations/${id}/members`
  );
  return result.data.members ?? [];
};

export const inviteMembers = async (id: string, emails: string[]): Promise<void> => {
  await api.post(`/api/organizations/${id}/members`, { mails: emails });
};

export const removeMembers = async (id: string, userIds: string[]): Promise<void> => {
  for (const userId of userIds) {
    await api.delete(`/api/organizations/${id}/members/${userId}`);
  }
};

// ========== ПРИГЛАШЕНИЯ ==========

export const getInvitations = async (): Promise<Invitation[]> => {
  const result = await api.get<{ invitations: Invitation[] | null }>(
    "/api/invitations"
  );
  return result.data?.invitations ?? [];
};

export const acceptInvitation = async (organizationId: string): Promise<void> => {
  await api.post(`/api/invitations/${organizationId}/accept`);
};

export const rejectInvitation = async (organizationId: string): Promise<void> => {
  await api.post(`/api/invitations/${organizationId}/reject`);
};