export const ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  SENSOR_DETAILS: "/sensors/:id",
  PROFILE: "/profile",
  CONNECT_DEVICE: "/connect-device",
  SERVER_ERROR: "/server-error",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const route = {
  login: () => ROUTES.LOGIN,
  register: () => ROUTES.REGISTER,
  dashboard: () => ROUTES.DASHBOARD,
  sensorDetails: (id: string) => ROUTES.SENSOR_DETAILS.replace(":id", id),
  profile: () => ROUTES.PROFILE,
  connectDevice: () => ROUTES.CONNECT_DEVICE,
  serverError: () => ROUTES.SERVER_ERROR,
} as const;
