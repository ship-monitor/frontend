import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// Подключаем твои страницы (проверь пути!)
import Auth from '../pages/auth.vue'
import Dashboard from '../pages/dashboard.vue' 

const routes: Array<RouteRecordRaw> = [
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    // Мета-поле, чтобы пометить страницу как "только для залогиненных"
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Навигационный гард (защита роутов)
router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('token');

  // Если страница требует авторизации, а токена нет — возвращаем путь на логин
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/auth';
  }

  // Если юзер уже залогинен и лезет на страницу логина — возвращаем путь на главную
  if (to.path === '/auth' && isAuthenticated) {
    return '/';
  }

  // В остальных случаях просто разрешаем переход (ничего не возвращаем или return true)
  return true;
});


export default router
