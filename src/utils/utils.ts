import { getDeviceOnlineStatus } from "@/data";

export async function fetchOnlineStatus(
  deviceId: string
): Promise<boolean | null> {
  return (await getDeviceOnlineStatus(deviceId))
    .map((status) => status.online)
    .inspectErr((err) => console.error("Faild load online state: %s", err))
    .unwrapOr(null);
}

export async function isOnline(deviceId: string): Promise<boolean> {
  return (await fetchOnlineStatus(deviceId)) ?? false;
}
