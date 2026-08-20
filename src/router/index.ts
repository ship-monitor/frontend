import {
  createRouter,
  createWebHistory,
  type Router,
  type RouteRecordRaw,
} from "vue-router";

import { ROUTES } from "@/constants/routes";

import Dashboard from "@/pages/DashboardPage.vue";
import Profile from "@/pages/ProfilePage.vue";
import SensorDetailsPage from "@/pages/sensors/SensorDetailsPage.vue";
import { useAuthStore } from "@/stores/authStore";

// Синглтон роутера, доступный вне компонентов (например, в axios-перехватчике).
let appRouter: Router | null = null;

export const getAppRouter = (): Router | null => appRouter;

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
  // {
  //   path: ROUTES.REGISTER,
  //   name: "Register",
  //   component: () => import("../pages/auth/RegisterPage.vue"),
  //   meta: { onlyAnonymous: true } as CustomRouteMeta,
  // },
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
    path: ROUTES.SENSOR_DETAILS,
    name: "sensor-details",
    component: SensorDetailsPage,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.PROFILE,
    name: "Profile",
    component: Profile,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: ROUTES.CONNECT_DEVICE,
    name: "ConnectDevice",
    component: () => import("../pages/ConnectDevicePage.vue"),
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/:pathMatch(.*)*",

    redirect: ROUTES.LANDING,
  },
];
export const createAppRouter = () => {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  });

  appRouter = router;

  const authStore = useAuthStore();

  router.beforeEach(async (to) => {
    const routeMeta = to.meta as CustomRouteMeta;

    // Дожидаемся проверки cookie-сессии только для маршрутов,
    // где результат влияет на навигацию (публичные страницы не блокируются).
    if (
      (routeMeta?.requireAuth || routeMeta?.onlyAnonymous) &&
      !authStore.initialized
    ) {
      await authStore.initialize();
    }

    if (routeMeta?.requireAuth && !authStore.isAuthenticated) {
      return {
        path: ROUTES.LOGIN,
        query: { redirect: to.fullPath },
      };
    }

    if (routeMeta?.onlyAnonymous && authStore.isAuthenticated) {
      return { path: ROUTES.DASHBOARD };
    }

    return true;
  });
  return router;
};
