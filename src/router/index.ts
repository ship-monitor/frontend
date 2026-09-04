import {
  createRouter,
  createWebHistory,
  type Router,
  type RouteRecordRaw,
} from "vue-router";

import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/authStore";

// Синглтон роутера, доступный вне компонентов (например, в axios-перехватчике).
let appRouter: Router | null = null;

export const getAppRouter = (): Router | null => appRouter;

export type RouteLayout = "landing" | "auth" | "app";

export type CustomRouteMeta = {
  requireAuth: boolean;
  onlyAnonymous: boolean;
  layout: RouteLayout;
};

const routes: Array<RouteRecordRaw> = [
  {
    path: ROUTES.LANDING,
    name: "Landing",
    component: () => import("../pages/LandingPage.vue"),
    meta: { layout: "landing" } as CustomRouteMeta,
  },
  {
    path: ROUTES.LOGIN,
    name: "Login",
    component: () => import("../pages/auth/LoginPage.vue"),
    meta: { onlyAnonymous: true, layout: "auth" } as CustomRouteMeta,
  },
  // Регистрация отключена: RegisterPage.vue и register API удалены.
  // Для возврата восстановить из git history и добавить маршрут:
  // {
  //   path: "/auth/register",
  //   name: "Register",
  //   component: () => import("../pages/auth/RegisterPage.vue"),
  //   meta: { onlyAnonymous: true, layout: "auth" },
  // },
  {
    path: ROUTES.CONFIRM_EMAIL,
    name: "ConfirmEmail",
    component: () => import("../pages/auth/ConfirmEmailPage.vue"),
    meta: { requireAuth: true, layout: "auth" } as CustomRouteMeta,
  },
  {
    path: ROUTES.DASHBOARD,
    name: "Dashboard",
    component: () => import("../pages/DashboardPage.vue"),
    meta: { requireAuth: true, layout: "app" } as CustomRouteMeta,
  },
  {
    path: ROUTES.SENSOR_DETAILS,
    name: "sensor-details",
    component: () => import("../pages/sensors/SensorDetailsPage.vue"),
    meta: { requireAuth: true, layout: "app" } as CustomRouteMeta,
  },
  {
    path: ROUTES.PROFILE,
    name: "Profile",
    component: () => import("../pages/ProfilePage.vue"),
    meta: { requireAuth: true, layout: "app" } as CustomRouteMeta,
  },
  {
    path: ROUTES.CONNECT_DEVICE,
    name: "ConnectDevice",
    component: () => import("../pages/ConnectDevicePage.vue"),
    meta: { requireAuth: true, layout: "app" } as CustomRouteMeta,
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
