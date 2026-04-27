import api from "@/api";

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export const getUsersOrganizations = async (): Promise<Organization[]> => {
  const result = await api.get<{ organizations: Organization[] }>(
    "/api/organizations/my"
  );
  console.log("result", result);
  return result.data.organizations;
};
