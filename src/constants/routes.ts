export const ROUTES = {
  LANDING: "/",
  LANDING_EN: "/en",
  ZHURNAL_TEMPERATUR: "/zhurnal-temperatur",
  APTEKI: "/apteki",
  RESTORANY: "/restorany",
  SKLADY: "/sklady",
  REFRIZHERATORY: "/refrizheratory",
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
  zhurnalTemperatur: () => ROUTES.ZHURNAL_TEMPERATUR,
  apteki: () => ROUTES.APTEKI,
  restorany: () => ROUTES.RESTORANY,
  sklady: () => ROUTES.SKLADY,
  refrizheratory: () => ROUTES.REFRIZHERATORY,
  login: () => ROUTES.LOGIN,
  confirmEmail: (token: string) =>
    `${ROUTES.CONFIRM_EMAIL}?token=${encodeURIComponent(token)}`,
  dashboard: () => ROUTES.DASHBOARD,
  sensorDetails: (id: string) => ROUTES.SENSOR_DETAILS.replace(":id", id),
  profile: () => ROUTES.PROFILE,
  connectDevice: () => ROUTES.CONNECT_DEVICE,
} as const;
