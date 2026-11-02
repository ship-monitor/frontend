import {
  createRouter,
  createWebHistory,
  type Router,
  type RouteRecordRaw,
} from "vue-router";

import { ROUTES } from "@/constants/routes";
import { SEO, SEO_PAGES } from "@/constants/seo";
import {
  isBotUserAgent,
  negotiateFirstVisitLocale,
  saveLocaleChoice,
  setLocale,
  storedLocaleChoice,
} from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { metrikaHit } from "@/utils/metrika";
import { applySeoMeta } from "@/utils/seo";

// Синглтон роутера, доступный вне компонентов (например, в axios-перехватчике).
let appRouter: Router | null = null;

export const getAppRouter = (): Router | null => appRouter;

export type RouteLayout = "landing" | "auth" | "app";

export type CustomRouteMeta = {
  requireAuth: boolean;
  onlyAnonymous: boolean;
  layout: RouteLayout;
  segment?: string;
};

const routes: Array<RouteRecordRaw> = [
  {
    path: ROUTES.LANDING,
    name: "Landing",
    component: () => import("../pages/LandingPage.vue"),
    meta: { layout: "landing" } as CustomRouteMeta,
  },
  {
    path: ROUTES.LANDING_EN,
    name: "LandingEn",
    component: () => import("../pages/LandingPage.vue"),
    meta: { layout: "landing" } as CustomRouteMeta,
  },
  {
    path: ROUTES.ZHURNAL_TEMPERATUR,
    name: "ZhurnalTemperatur",
    component: () => import("../pages/ZhurnalTemperaturPage.vue"),
    meta: { layout: "landing" } as CustomRouteMeta,
  },
  {
    path: ROUTES.APTEKI,
    name: "Apteki",
    component: () => import("../pages/SegmentPage.vue"),
    meta: { layout: "landing", segment: "apteki" } as CustomRouteMeta,
  },
  {
    path: ROUTES.RESTORANY,
    name: "Restorany",
    component: () => import("../pages/SegmentPage.vue"),
    meta: { layout: "landing", segment: "restorany" } as CustomRouteMeta,
  },
  {
    path: ROUTES.SKLADY,
    name: "Sklady",
    component: () => import("../pages/SegmentPage.vue"),
    meta: { layout: "landing", segment: "sklady" } as CustomRouteMeta,
  },
  {
    path: ROUTES.REFRIZHERATORY,
    name: "Refrizheratory",
    component: () => import("../pages/SegmentPage.vue"),
    meta: { layout: "landing", segment: "refrizheratory" } as CustomRouteMeta,
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
    scrollBehavior: (to, _from, savedPosition) => {
      if (to.hash) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const element = document.querySelector(to.hash);
            const top = element
              ? element.getBoundingClientRect().top + window.scrollY - 80
              : 0;
            resolve({ top, left: 0 });
          }, 0);
        });
      }
      return savedPosition ?? { top: 0, left: 0 };
    },
  });

  appRouter = router;

  const authStore = useAuthStore();

  router.beforeEach(async (to) => {
    const routeMeta = to.meta as CustomRouteMeta;

    if (
      storedLocaleChoice() === null &&
      !isBotUserAgent() &&
      (to.name === "Landing" || to.name === "LandingEn")
    ) {
      const negotiated = negotiateFirstVisitLocale();
      saveLocaleChoice(negotiated);
      if (negotiated === "en" && to.name === "Landing") {
        return { path: ROUTES.LANDING_EN };
      }
      if (negotiated === "ru" && to.name === "LandingEn") {
        return { path: ROUTES.LANDING };
      }
    }

    const locale = to.name === "LandingEn" ? "en" : "ru";
    setLocale(locale);
    document.documentElement.lang = locale;

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

  router.afterEach((to, from) => {
    if (from.name !== undefined) {
      metrikaHit(to.fullPath);
    }

    const routeMeta = to.meta as CustomRouteMeta;
    const locale = to.name === "LandingEn" ? "en" : "ru";
    let robotsMeta = document.head.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );

    if (routeMeta.layout === "landing") {
      robotsMeta?.remove();
      const pageSeo = to.name ? SEO_PAGES[String(to.name)] : undefined;
      applySeoMeta(pageSeo ?? SEO[locale]);
      return;
    }

    document.title = SEO.ru.title;

    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.name = "robots";
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = "noindex, follow";
  });

  return router;
};
