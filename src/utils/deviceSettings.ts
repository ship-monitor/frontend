import safeStorage from "@/utils/storage";

const settingsKey = (deviceId: string) => `device_settings_${deviceId}`;

export function readStoredDeviceName(deviceId: string): string {
  const stored = safeStorage.getJson(settingsKey(deviceId));
  const record =
    stored && typeof stored === "object"
      ? (stored as Record<string, unknown>)
      : {};
  const name = record["name"];
  return typeof name === "string" ? name : "";
}

export function saveStoredDeviceName(deviceId: string, name: string) {
  safeStorage.setItem(settingsKey(deviceId), JSON.stringify({ name }));
}

export function clearDeviceSettings(deviceId: string) {
  safeStorage.removeItem(settingsKey(deviceId));
}

export function resolveDisplayName(
  deviceId: string,
  apiName?: string
): string {
  const stored = readStoredDeviceName(deviceId).trim();
  if (stored !== "") return stored;
  if (apiName && apiName !== "Unknown Device" && apiName !== "") return apiName;
  return deviceId.substring(0, 8);
}
