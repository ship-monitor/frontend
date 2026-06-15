export const ROUTES = {
  LANDING: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  ORGANIZATIONS: '/organizations',
  ORGANIZATION_DETAILS: '/organizations/:id',
  SENSOR_DETAILS: '/sensors/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  INVITATIONS: '/invitations',
} as const;

export type RouteKey = keyof typeof ROUTES;