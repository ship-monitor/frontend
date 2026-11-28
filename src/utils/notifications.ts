import type { DeviceNotification, NotificationSeverity } from "@/data";

export type NotificationSeverityFilter = NotificationSeverity | "all";

export type NotificationItem = {
  id: string;
  deviceId: string;
  sensorId: string | null;
  deviceName: string;
  sensorName: string | null;
  title: string;
  severity: NotificationSeverity;
  occurredAt: number;
  value: string | null;
};

export type NotificationFilters = {
  severity: NotificationSeverityFilter;
  deviceId: string;
};

const TITLES: Record<string, string> = {
  "temperature-high": "Температура выше нормы",
  "temperature-low": "Температура ниже нормы",
};

const SEVERITIES: readonly NotificationSeverity[] = [
  "critical",
  "warning",
  "info",
];

const SEVERITY_FILTER_LABEL: Record<NotificationSeverity, string> = {
  critical: "Критичные",
  warning: "Предупреждения",
  info: "Информационные",
};

const SEVERITY_NAME: Record<NotificationSeverity, string> = {
  critical: "Критично",
  warning: "Предупреждение",
  info: "Информация",
};

export const SEVERITY_DOT_CLASS: Record<NotificationSeverity, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-brand-500",
};

export const SEVERITY_VALUE_CLASS: Record<NotificationSeverity, string> = {
  critical: "text-red-600",
  warning: "text-ink-900",
  info: "text-ink-900",
};

export const SEVERITY_FILTERS: Array<{
  value: NotificationSeverityFilter;
  label: string;
}> = [
  { value: "all", label: "Все" },
  ...SEVERITIES.map((severity) => ({
    value: severity,
    label: SEVERITY_FILTER_LABEL[severity],
  })),
];

export const severityName = (severity: NotificationSeverity): string =>
  SEVERITY_NAME[severity];

export const parseSeverityFilter = (
  value: unknown
): NotificationSeverityFilter =>
  typeof value === "string" && (SEVERITIES as readonly string[]).includes(value)
    ? (value as NotificationSeverity)
    : "all";

export const notificationItem = (
  item: DeviceNotification,
  deviceName: string,
  sensorName: string | null
): NotificationItem => {
  const temperature = item.data["temperature"];

  return {
    id: item.id,
    deviceId: item.deviceId,
    sensorId: item.sensorId,
    deviceName,
    sensorName,
    title: TITLES[item.type] ?? item.type,
    severity: item.severity,
    occurredAt: item.occurredAt,
    value:
      item.sensorId !== null &&
      typeof temperature === "number" &&
      Number.isFinite(temperature)
        ? `${temperature.toFixed(1)}°C`
        : null,
  };
};

export const filterNotifications = (
  items: NotificationItem[],
  filters: NotificationFilters
): NotificationItem[] => {
  const byDevice =
    filters.deviceId === ""
      ? items
      : items.filter((item) => item.deviceId === filters.deviceId);

  if (filters.severity === "all") return byDevice;

  return byDevice.filter((item) => item.severity === filters.severity);
};

export const notificationPlace = (
  item: NotificationItem,
  showDevice: boolean
): string =>
  [item.sensorName, showDevice ? item.deviceName : ""]
    .filter(Boolean)
    .join(" · ");

export const formatNotificationTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const time: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  if (date.toDateString() === new Date().toDateString()) {
    return date.toLocaleTimeString("ru", time);
  }
  return date.toLocaleString("ru", {
    day: "numeric",
    month: "short",
    ...time,
  });
};
