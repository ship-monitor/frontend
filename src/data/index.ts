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
  isConnected: boolean;
  temperature?: number;
  lastConnection?: string;
  firstConnection?: string;
  createdAt?: string;
};

export type CommandResult = {
  data?: any;
  commandError?: string;
  requestError?: string;
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

// ============= Организации =============
export const getUsersOrganizations = async (): Promise<Organization[]> => {
  try {
    const result = await api.get("/api/organizations/my");
    return (
      checkResponse<{ organizations: Organization[] }>(result).organizations || []
    );
  } catch (error) {
    console.error("Failed to get organizations:", error);
    return [];
  }
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
  try {
    const result = await api.get(`/api/organizations/${id}/members`);
    const data = checkResponse<{ members: Member[] }>(result);
    return (data.members ?? []).map((m) => ({
      userId: m.userId,
      email: m.email,
      name: m.name,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  } catch (error) {
    console.error("Failed to get members:", error);
    return [];
  }
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

  if (emailsArray.length === 0) {
    throw new Error("No valid emails provided");
  }

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
  try {
    const result = await api.get("/api/invitations");
    const data = checkResponse<{ invitations: Invitation[] }>(result);
    return data.invitations ?? [];
  } catch (error) {
    console.error("Failed to get invitations:", error);
    return [];
  }
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
  try {
    const result = await api.get(`/api/organizations/${orgId}/devices`);
    const data = checkResponse<{ devices: Device[] }>(result);
    return data.devices || [];
  } catch (error) {
    console.error("Failed to get devices:", error);
    return [];
  }
};

export const connectDevice = async (
  orgId: string,
  deviceId?: string,
  name?: string
): Promise<Device> => {
  console.log("Connecting device with id:", deviceId, "and name:", name);

  const result = await api.post(`/api/organizations/${orgId}/devices`, {
    deviceId,
    name,
  });
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
  const result = await api.get(
    `/api/organizations/${orgId}/devices/${deviceId}`
  );
  return checkResponse<Device>(result);
};

// ============= Вспомогательная функция для поиска organizationId по deviceId =============
export const findOrganizationIdByDeviceId = async (deviceId: string): Promise<string | null> => {
  try {
    const orgs = await getUsersOrganizations();
    console.log('Available organizations:', orgs.map(o => ({ id: o.id, name: o.name })));

    for (const org of orgs) {
      try {
        const devices = await getOrganizationDevices(org.id);
        console.log(`Devices in org ${org.id}:`, devices.map(d => ({ id: d.id, name: d.name })));

        const found = devices.some(d => d.id === deviceId || d.nodeId === deviceId);
        if (found) {
          console.log(`✅ Found device ${deviceId} in organization ${org.id}`);
          return org.id;
        }
      } catch (err) {
        console.error(`Error checking org ${org.id}:`, err);
      }
    }

    console.error(`❌ Device ${deviceId} not found in any organization`);
    return null;
  } catch (error) {
    console.error('Failed to get device organization:', error);
    return null;
  }
};
// ============= Команды устройства =============
export const sendDeviceCommand = async (
  organizationId: string,
  deviceId: string,
  command: string,
  args?: Record<string, any>
): Promise<CommandResult> => {
  try {
    console.log(`Sending command to: /api/organizations/${organizationId}/devices/${deviceId}/command`);
    console.log("Command:", command, "Args:", args);

    const result = await api.post(
      `/api/organizations/${organizationId}/devices/${deviceId}/command`,
      {
        command: command,
        args: args || {}
      }
    );

    return { data: result.data };
  } catch (error: any) {
    console.error("Command error:", error);

    if (error.response?.status === 404) {
      return {
        requestError: `Эндпоинт не найден (404). Проверьте URL: /api/organizations/${organizationId}/devices/${deviceId}/command`
      };
    }

    if (error.response?.data?.details) {
      return { commandError: error.response.data.details };
    }

    if (error.response?.data?.message) {
      return { commandError: error.response.data.message };
    }

    return {
      requestError: error.message || "Ошибка отправки команды"
    };
  }
};

// ============= Конфигурация датчика =============
export const getSensorConfig = async (deviceId: string): Promise<any> => {
  try {
    const result = await api.get(`/api/devices/${deviceId}/config`);
    return result.data;
  } catch (error) {
    console.error("Failed to get sensor config:", error);
    // Возвращаем значения по умолчанию
    return {
      id: deviceId,
      deviceId: deviceId,
      name: "Датчик",
      minThreshold: -17,
      maxThreshold: -15,
      phoneNumber: "",
      defrostTime: 30,
      defrostTemperature: -9,
      tags: []
    };
  }
};

export const updateSensorConfig = async (deviceId: string, config: any): Promise<any> => {
  try {
    const result = await api.put(`/api/devices/${deviceId}/config`, config);
    return result.data;
  } catch (error) {
    console.error("Failed to update sensor config:", error);
    return config;
  }
};

export const getSensorCurrentData = async (deviceId: string): Promise<any> => {
  try {
    const result = await api.get(`/api/devices/${deviceId}/current`);
    return result.data;
  } catch (error) {
    console.error("Failed to get current sensor data:", error);
    return {
      id: Date.now().toString(),
      deviceId: deviceId,
      value: -15.5,
      timestamp: new Date().toISOString(),
      isDefrostMode: false,
      isAlert: false
    };
  }
};

export const getSensorHistory = async (
  deviceId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    const result = await api.get(`/api/devices/${deviceId}/history`, {
      params: { startDate, endDate }
    });
    return result.data;
  } catch (error) {
    console.error("Failed to get sensor history:", error);
    return { data: [] };
  }
};

export const addSensorTag = async (deviceId: string, tag: string): Promise<any> => {
  try {
    const result = await api.post(`/api/devices/${deviceId}/tags`, { tag });
    return result.data;
  } catch (error) {
    console.error("Failed to add tag:", error);
    return { tags: [tag] };
  }
};

export const removeSensorTag = async (deviceId: string, tag: string): Promise<any> => {
  try {
    const result = await api.delete(`/api/devices/${deviceId}/tags/${encodeURIComponent(tag)}`);
    return result.data;
  } catch (error) {
    console.error("Failed to remove tag:", error);
    return { tags: [] };
  }
};

export const exportSensorData = async (
  deviceId: string,
  startDate: string,
  endDate: string,
  format: string = "docx"
): Promise<Blob> => {
  try {
    const result = await api.get(`/api/devices/${deviceId}/export`, {
      params: { startDate, endDate, format },
      responseType: "blob"
    });
    return result.data;
  } catch (error) {
    console.error("Failed to export data:", error);
    // Создаем демо-документ
    const content = `Temperature report for device ${deviceId}\nPeriod: ${startDate} to ${endDate}`;
    return new Blob([content], { type: "text/plain" });
  }
};