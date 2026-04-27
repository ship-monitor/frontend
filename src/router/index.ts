import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// Подключаем твои страницы (проверь пути!)
import Auth from "@/pages/auth/LoginPage.vue";
import Dashboard from "@/pages/DashboardPage.vue";
import registr from "@/pages/auth/RegisterPage.vue";

export type CustomRouteMeta = {
  requireAuth: boolean;
  onlyAnonymous: boolean;
  hideNav?: boolean;
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/auth",
    name: "Auth",
    redirect: "/auth/login",
  },
  {
    path: "/auth/login",
    name: "Login",
    component: Auth,
    meta: { onlyAnonymous: true, hideNav: true } as CustomRouteMeta,
  },
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/auth/register",
    name: "Register",
    component: registr,
    meta: { onlyAnonymous: true, hideNav: true } as CustomRouteMeta,
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
