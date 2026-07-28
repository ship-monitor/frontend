export const ROUTES = {
  LANDING: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  CONFIRM_EMAIL: "/auth/confirm-email",
  DASHBOARD: "/dashboard",
  SENSORS: "/sensors",
  SENSOR_DETAILS: "/sensors/:id",
  PROFILE: "/profile",
  CONNECT_DEVICE: "/connect-device",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const route = {
  landing: () => ROUTES.LANDING,
  login: () => ROUTES.LOGIN,
  register: () => ROUTES.REGISTER,
  confirmEmail: (token: string) =>
    ROUTES.CONFIRM_EMAIL.replace(":token", token),
  dashboard: () => ROUTES.DASHBOARD,
  sensors: () => ROUTES.SENSORS,
  sensorDetails: (id: string) => ROUTES.SENSOR_DETAILS.replace(":id", id),
  profile: () => ROUTES.PROFILE,
  connectDevice: () => ROUTES.CONNECT_DEVICE,
} as const;
