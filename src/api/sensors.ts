import api from '@/api';

export interface SensorConfig {
    id: string;
    deviceId: string;
    name: string;
    minThreshold: number;
    maxThreshold: number;
    phoneNumber: string;
    defrostTime: number;
    defrostTemperature: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface SensorData {
    id: string;
    deviceId: string;
    value: number;
    timestamp: string;
    isDefrostMode: boolean;
    isAlert: boolean;
}

export interface SensorHistory {
    data: SensorData[];
    startDate: string;
    endDate: string;
}

export const getSensorConfig = async (deviceId: string): Promise<SensorConfig> => {
    const response = await api.get(`/api/devices/${deviceId}/config`);
    return response.data;
};

export const updateSensorConfig = async (deviceId: string, config: Partial<SensorConfig>): Promise<SensorConfig> => {
    const response = await api.put(`/api/devices/${deviceId}/config`, config);
    return response.data;
};

export const getSensorHistory = async (
    deviceId: string,
    startDate: string,
    endDate: string
): Promise<SensorHistory> => {
    const response = await api.get(`/api/devices/${deviceId}/history`, {
        params: { startDate, endDate }
    });
    return response.data;
};

export const getSensorCurrentData = async (deviceId: string): Promise<SensorData> => {
    const response = await api.get(`/api/devices/${deviceId}/current`);
    return response.data;
};

export const addSensorTag = async (deviceId: string, tag: string): Promise<SensorConfig> => {
    const response = await api.post(`/api/devices/${deviceId}/tags`, { tag });
    return response.data;
};

export const removeSensorTag = async (deviceId: string, tag: string): Promise<SensorConfig> => {
    const response = await api.delete(`/api/devices/${deviceId}/tags/${encodeURIComponent(tag)}`);
    return response.data;
};

export const exportSensorData = async (
    deviceId: string,
    startDate: string,
    endDate: string,
    format: 'csv' | 'docx' = 'docx'
): Promise<Blob> => {
    const response = await api.get(`/api/devices/${deviceId}/export`, {
        params: { startDate, endDate, format },
        responseType: 'blob'
    });
    return response.data;
};