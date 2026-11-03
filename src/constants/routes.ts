export const ROUTES = {
  LOGIN: "/auth/login",
  DASHBOARD: "/dashboard",
  SENSOR_DETAILS: "/sensors/:id",
  PROFILE: "/profile",
  CONNECT_DEVICE: "/connect-device",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const route = {
  login: () => ROUTES.LOGIN,
  dashboard: () => ROUTES.DASHBOARD,
  sensorDetails: (id: string) => ROUTES.SENSOR_DETAILS.replace(":id", id),
  profile: () => ROUTES.PROFILE,
  connectDevice: () => ROUTES.CONNECT_DEVICE,
} as const;
