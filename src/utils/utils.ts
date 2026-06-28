import { getDeviceState, type DeviceStateRecord } from "@/data";

const SECOND = 1000;
const PING_INTERVAL = 10 * SECOND;

export async function isOnline(deviceId: string): Promise<boolean> {
  try {
    const lastState = await getDeviceState<boolean>(deviceId, "online");
    if (!lastState) return false;

    if (new Date(lastState.timestamp).getTime() < Date.now() - PING_INTERVAL)
      return false;

    return lastState.value as boolean;
  } catch {
    return false;
  }
}

export const getLastTemperature = async (
  deviceId: string
): Promise<DeviceStateRecord<number> | null> => {
  try {
    const state = await getDeviceState<number>(deviceId, "temperature");
    return state;
  } catch (error) {
    console.error(error);
    return null;
  }
};
