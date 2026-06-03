import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { checkAuthStatus } from "@/api";

import Dashboard from "@/pages/DashboardPage.vue";
import Profile from "@/pages/ProfilePage.vue";
import Settings from "@/pages/SettingsPage.vue";
import SensorDetailsPage from '@/pages/sensors/SensorDetailsPage.vue';
export type CustomRouteMeta = {
  requireAuth: boolean;
  onlyAnonymous: boolean;
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/auth/login",
    name: "Login",
    component: () => import("../pages/auth/LoginPage.vue"),
    meta: { onlyAnonymous: true } as CustomRouteMeta,
  },
  {
    path: "/auth/register",
    name: "Register",
    component: () => import("../pages/auth/RegisterPage.vue"),
    meta: { onlyAnonymous: true } as CustomRouteMeta,
  },
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/organizations",
    name: "Organizations",
    component: () => import("../pages/organizations/ListPage.vue"),
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: '/sensors/:id',
    name: 'sensor-details',
    component: SensorDetailsPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/organizations/:id",
    name: "Organization details",
    component: () => import("../pages/organizations/DetailsPage.vue"),
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const isAuthenticated = checkAuthStatus();
  const routeMeta = to.meta as CustomRouteMeta;

  if (routeMeta?.requireAuth && !isAuthenticated) {
    return {
      path: "/auth/login",
      query: { redirect: to.fullPath },
    };
  }

  if (routeMeta?.onlyAnonymous && isAuthenticated) {
    return "/";
  }

  return true;
});

export default router;
