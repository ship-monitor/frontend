import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// Подключаем твои страницы (проверь пути!)
import Auth from "../pages/auth/auth.vue";
import Dashboard from "../pages/dashboard.vue";
import registr from "../pages/auth/registr.vue";

declare module 'vue-router' {
  interface RouteMeta {
    requireAuth?: boolean
    onlyAnonymous?: boolean
  }
}

type CustomRouteMeta = { requireAuth: boolean; onlyAnonymous: boolean };

const routes: Array<RouteRecordRaw> = [
  {
    path: "/auth",
    name: "Auth",
    component: Auth,
    meta: { onlyAnonymous: true } as CustomRouteMeta,
  },
  {
    path: "/",
    name: "Dashboard",
    path: "/",
    component: Dashboard,
    // Мета-поле, чтобы пометить страницу как "только для залогиненных"
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/registr",
    name: "Registr",
    component: registr,
    meta: { onlyAnonymous: true } as CustomRouteMeta,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Навигационный гард (защита роутов)
router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const routeMeta = to.meta as CustomRouteMeta;

  // 1. Если страница только для своих, а мы анонимы — гоним на логин
  if (routeMeta?.requireAuth && !isAuthenticated) {
    return "/auth";
  }

  // 2. Если страница ТОЛЬКО для анонимов (логин/рега), а мы уже вошли — гоним на главную
  if (routeMeta?.onlyAnonymous && isAuthenticated) {
    return "/";
  }

  return true;
});


export default router;
