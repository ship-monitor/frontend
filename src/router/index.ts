import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import Auth from "@/pages/auth/LoginPage.vue";
import Dashboard from "@/pages/DashboardPage.vue";
import Register from "@/pages/auth/RegisterPage.vue";
import Invitations from "@/pages/InvitationsPage.vue";
import Profile from "@/pages/ProfilePage.vue";

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
    path: "/auth/register",
    name: "Register",
    component: Register,
    meta: { onlyAnonymous: true, hideNav: true } as CustomRouteMeta,
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
    path: "/organizations/:id",
    name: "Organization details",
    component: () => import("../pages/organizations/DetailsPage.vue"),
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/invitations",
    name: "Invitations",
    component: Invitations,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requireAuth: true } as CustomRouteMeta,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const routeMeta = to.meta as CustomRouteMeta;

  if (routeMeta?.requireAuth && !isAuthenticated) {
    return "/auth";
  }

  if (routeMeta?.onlyAnonymous && isAuthenticated) {
    return "/";
  }

  return true;
});

export default router;
