import { getDeviceNotifications as getDeviceNotificationsOp } from "@/api";
import { Result } from "true-myth";
import { problemDetails } from "@/utils/problem";

export type NotificationSeverity = "info" | "warning" | "critical";

export type DeviceNotification = {
  id: string;
  deviceId: string;
  sensorId: string | null;
  type: string;
  severity: NotificationSeverity;
  occurredAt: number;
  isRead: boolean;
  data: Record<string, unknown>;
};

export type NotificationPage = {
  items: DeviceNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

const SEVERITIES: readonly NotificationSeverity[] = [
  "info",
  "warning",
  "critical",
];

const NOTIFICATIONS_PAGE_SIZE = 20;

const errorData = (response: { status: number }): unknown =>
  "data" in response ? (response as { data?: unknown }).data : undefined;

const asNotification = (data: unknown): Result<DeviceNotification, string> => {
  if (!data || typeof data !== "object") {
    return Result.err(
      "unexpected response shape: notification is not an object"
    );
  }
  const record = data as Record<string, unknown>;
  const id = record["id"];
  const deviceId = record["deviceId"];
  const type = record["type"];
  const severity = record["severity"];
  const occurredAt = record["occurredAt"];

  if (
    typeof id !== "string" ||
    typeof deviceId !== "string" ||
    typeof type !== "string"
  ) {
    return Result.err("unexpected response shape: missing notification fields");
  }
  if (
    typeof severity !== "string" ||
    !SEVERITIES.includes(severity as NotificationSeverity)
  ) {
    return Result.err(
      `unexpected response shape: unknown severity "${severity}"`
    );
  }

  const parsedAt =
    typeof occurredAt === "string" ? Date.parse(occurredAt) : Number.NaN;
  if (Number.isNaN(parsedAt)) {
    return Result.err('unexpected response shape: invalid "occurredAt"');
  }

  const sensorId = record["sensorId"];
  const rawData = record["data"];

  return Result.ok({
    id,
    deviceId,
    sensorId: typeof sensorId === "string" ? sensorId : null,
    type,
    severity: severity as NotificationSeverity,
    occurredAt: parsedAt,
    isRead: record["isRead"] === true,
    data:
      rawData && typeof rawData === "object" && !Array.isArray(rawData)
        ? (rawData as Record<string, unknown>)
        : {},
  });
};

export const getDeviceNotifications = async (
  deviceId: string,
  cursor?: string,
  limit: number = NOTIFICATIONS_PAGE_SIZE
): Promise<Result<NotificationPage, string>> => {
  let response;
  try {
    response = await getDeviceNotificationsOp(deviceId, {
      cursor,
      limit,
    });
  } catch {
    return Result.err("Не удалось связаться с сервером");
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось загрузить уведомления")
    );
  }

  const payload: unknown = response.data;
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const list = record["notifications"];
  if (!Array.isArray(list)) {
    return Result.err('unexpected response shape: missing "notifications"');
  }

  const items: DeviceNotification[] = [];
  for (const item of list) {
    const notification = asNotification(item);
    if (notification.isErr) return Result.err(notification.error);
    items.push(notification.value);
  }

  const pagination = record["pagination"];
  const paginationRecord =
    pagination && typeof pagination === "object"
      ? (pagination as Record<string, unknown>)
      : {};
  const rawCursor = paginationRecord["nextCursor"];
  const nextCursor =
    typeof rawCursor === "string" && rawCursor ? rawCursor : null;

  return Result.ok({
    items,
    nextCursor,
    hasMore: paginationRecord["hasMore"] === true && nextCursor !== null,
  });
};
