import api from '@/api';

export interface CommandResult {
    data?: any;
    commandError?: string;
    requestError?: string;
}

export const sendDeviceCommand = async (
    organizationId: string,
    deviceId: string,
    command: string,
    args?: Record<string, any>
): Promise<CommandResult> => {
    try {
        const response = await api.post(`/api/${organizationId}/devices/${deviceId}/command`, {
            command,
            args: args || {}
        });
        return response.data;
    } catch (error: any) {
        console.error('Command error:', error);
        return {
            requestError: error.response?.data?.message || error.message || 'Ошибка отправки команды'
        };
    }
};