import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { ROUTES } from "@/constants/routes";

import Dashboard from "@/pages/DashboardPage.vue";
import Profile from "@/pages/ProfilePage.vue";
import SensorDetailsPage from "@/pages/sensors/SensorDetailsPage.vue";
import { isAuthenticated } from "@/auth";

export type CustomRouteMeta = {
  requireAuth: boolean;
  onlyAnonymous: boolean;
};

const routes: Array<RouteRecordRaw> = [
  {
    path: ROUTES.LANDING,
    name: "Landing",
    component: () => import("../pages/LandingPage.vue"),
  },
  {
    path: ROUTES.LOGIN,
    name: "Login",
    component: () => import("../pages/auth/LoginPage.vue"),
    meta: { onlyAnonymous: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.REGISTER,
    name: "Register",
    component: () => import("../pages/auth/RegisterPage.vue"),
    meta: { onlyAnonymous: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.CONFIRM_EMAIL,
    name: "ConfirmEmail",
    component: () => import("../pages/auth/ConfirmEmailPage.vue"),
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.DASHBOARD,
    name: "Dashboard",
    component: Dashboard,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.ORGANIZATIONS,
    name: "Organizations",
    component: () => import("../pages/organizations/ListPage.vue"),
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.SENSOR_DETAILS,
    name: "sensor-details",
    component: SensorDetailsPage,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.ORGANIZATION_DETAILS,
    name: "Organization details",
    component: () => import("../pages/organizations/DetailsPage.vue"),
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.PROFILE,
    name: "Profile",
    component: Profile,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/:pathMatch(.*)*",

    redirect: ROUTES.LANDING,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const routeMeta = to.meta as CustomRouteMeta;

  if (routeMeta?.requireAuth && !isAuthenticated.value) {
    return {
      path: ROUTES.LOGIN,
      query: { redirect: to.fullPath },
    };
  }

  return true;
});

export default router;
