import axios from "axios";
import { type DeviceStateRecord, getDeviceState } from "@/data";

const SECOND = 1000;
const PING_INTERVAL = 10 * SECOND;

const AUTH_ERROR_MARKS = [
  "unauthorized",
  "bad credentials",
  "token is expired",
  "invalid claims",
  "token has invalid claims",
  "jwt",
];

export function isAuthError(error: unknown): boolean {
  if (axios.isAxiosError(error) && error.response?.status === 401) return true;
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return AUTH_ERROR_MARKS.some((mark) => normalized.includes(mark));
}

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

export const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getMilliseconds();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "только что";
  if (sec < 60) return `${sec}с назад`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}м назад`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}ч назад`;
  return `${Math.floor(hours / 24)}д назад`;
};
