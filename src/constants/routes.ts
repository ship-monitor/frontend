export const ROUTES = {
  LANDING: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  CONFIRM_EMAIL: "/auth/confirm-email",
  DASHBOARD: "/dashboard",
  ORGANIZATIONS: "/organizations",
  ORGANIZATION_DETAILS: "/organizations/:id",
  SENSORS: "/sensors",
  SENSOR_DETAILS: "/sensors/:id",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  INVITATIONS: "/invitations",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const route = {
  landing: () => ROUTES.LANDING,
  login: () => ROUTES.LOGIN,
  register: () => ROUTES.REGISTER,
  confirmEmail: (token: string) =>
    ROUTES.CONFIRM_EMAIL.replace(":token", token),
  dashboard: () => ROUTES.DASHBOARD,
  organizations: () => ROUTES.ORGANIZATIONS,
  organizationDetails: (id: string) =>
    ROUTES.ORGANIZATION_DETAILS.replace(":id", id),
  sensors: () => ROUTES.SENSORS,
  sensorDetails: (id: string) => ROUTES.SENSOR_DETAILS.replace(":id", id),
  profile: () => ROUTES.PROFILE,
  settings: () => ROUTES.SETTINGS,
  invitations: () => ROUTES.INVITATIONS,
} as const;
