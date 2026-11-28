import type { NotificationSeverity } from "@/data";

export const ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  DEVICE_DETAILS: "/devices/:id",
  SENSOR_DETAILS: "/devices/:deviceId/sensors/:sensorId",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
  CONNECT_DEVICE: "/connect-device",
  SERVER_ERROR: "/server-error",
} as const;

export type RouteKey = keyof typeof ROUTES;

export type NotificationsRouteQuery = {
  device?: string;
  severity?: NotificationSeverity;
};

export const route = {
  login: () => ROUTES.LOGIN,
  register: () => ROUTES.REGISTER,
  dashboard: () => ROUTES.DASHBOARD,
  deviceDetails: (id: string) => ROUTES.DEVICE_DETAILS.replace(":id", id),
  sensorDetails: (deviceId: string, sensorId: string) =>
    ROUTES.SENSOR_DETAILS.replace(":deviceId", deviceId).replace(
      ":sensorId",
      sensorId
    ),
  notifications: (query: NotificationsRouteQuery = {}) => ({
    path: ROUTES.NOTIFICATIONS,
    query,
  }),
  profile: () => ROUTES.PROFILE,
  connectDevice: () => ROUTES.CONNECT_DEVICE,
  serverError: () => ROUTES.SERVER_ERROR,
} as const;
