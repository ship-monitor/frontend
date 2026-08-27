export const ROUTES = {
  LANDING: "/",
  LOGIN: "/auth/login",
  CONFIRM_EMAIL: "/auth/confirm-email",
  DASHBOARD: "/dashboard",
  SENSOR_DETAILS: "/sensors/:id",
  PROFILE: "/profile",
  CONNECT_DEVICE: "/connect-device",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const route = {
  landing: () => ROUTES.LANDING,
  login: () => ROUTES.LOGIN,
  confirmEmail: (token: string) =>
    `${ROUTES.CONFIRM_EMAIL}?token=${encodeURIComponent(token)}`,
  dashboard: () => ROUTES.DASHBOARD,
  sensorDetails: (id: string) => ROUTES.SENSOR_DETAILS.replace(":id", id),
  profile: () => ROUTES.PROFILE,
  connectDevice: () => ROUTES.CONNECT_DEVICE,
} as const;
