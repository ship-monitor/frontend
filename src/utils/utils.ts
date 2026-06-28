import { getDeviceState } from "@/data";

const SECOND = 1000;
const PING_INTERVAL = 10 * SECOND;

export async function isOnline(deviceId: string): Promise<boolean> {
  try {
    const lastState = await getDeviceState(deviceId, "online");
    if (!lastState) return false;

    if (new Date(lastState.timestamp).getTime() < Date.now() - PING_INTERVAL)
      return false;

    return lastState.value as boolean;
  } catch {
    return false;
  }
}
