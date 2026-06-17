<template>
  <!-- Страницы входа/регистрации без меню -->
  <div v-if="isAuthPage">
    <router-view />
  </div>

  <!-- Лендинг для неавторизованных -->
  <div v-else-if="isLandingPage">
    <router-view />
  </div>

  <!-- Основной layout с адаптивным меню -->
  <div v-else class="flex flex-col lg:flex-row min-h-screen bg-gray-50">

    <!-- ====== Мобильный хедер ====== -->
    <header class="lg:hidden bg-[#1E293B] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <router-link to="/">
        <h2 class="text-lg font-bold">ШиП-монитор</h2>
      </router-link>

      <button @click="showNotifications = !showNotifications"
        class="relative p-2 hover:bg-gray-700 rounded-lg touch-target" aria-label="Уведомления">
        <span class="text-xl">🔔</span>
        <span v-if="unreadNotifications > 0"
          class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {{ unreadNotifications }}
        </span>
      </button>
    </header>

    <!-- ====== Боковое меню (десктоп) ====== -->
    <aside class="hidden lg:flex bg-[#1E293B] text-white flex-col lg:w-64 lg:min-h-screen lg:sticky lg:top-0">
      <!-- Логотип (только десктоп) -->
      <div class="hidden lg:block p-4 border-b border-gray-700">
        <router-link to="/">
          <h2 class="text-xl font-bold">ШиП-монитор</h2>
        </router-link>
      </div>

      <!-- Навигация -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <router-link :to="ROUTES.DASHBOARD"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-gray-700 transition-colors touch-target"
          active-class="bg-gray-700">
          <!-- Пульс -->
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span class="text-base">Мониторинг</span>
        </router-link>

        <router-link :to="ROUTES.ORGANIZATIONS"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-gray-700 transition-colors touch-target"
          active-class="bg-gray-700">
          <!-- Здание -->
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path
              d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
          </svg>
          <span class="text-base">Организации</span>
        </router-link>

        <router-link :to="ROUTES.PROFILE"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-gray-700 transition-colors touch-target"
          active-class="bg-gray-700">
          <!-- Человек -->
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span class="text-base">Профиль</span>
        </router-link>

        <router-link :to="ROUTES.SETTINGS"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-gray-700 transition-colors touch-target"
          active-class="bg-gray-700">
          <!-- Шестерёнка -->
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span class="text-base">Настройки</span>
        </router-link>
      </nav>

      <!-- Поддержка внизу -->
      <div class="p-4 border-t border-gray-700 text-sm text-gray-400">
        <p>Поддержка</p>
        <p class="text-xs">Шевцов А.</p>
      </div>
    </aside>

    <!-- ====== Правая часть (контент) ====== -->
    <div class="flex-1 flex flex-col min-h-screen">

      <!-- Десктопный хедер -->
      <header class="hidden lg:flex bg-white border-b px-6 py-3 justify-end items-center gap-4 sticky top-0 z-20">
        <div class="relative">
          <button @click="showNotifications = !showNotifications"
            class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="text-xl">🔔</span>
            <span v-if="unreadNotifications > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ unreadNotifications }}
            </span>
          </button>

          <!-- Выпадашка уведомлений -->
          <div v-if="showNotifications"
            class="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-[80vh] overflow-hidden flex flex-col">
            <div class="p-4 border-b">
              <h3 class="font-semibold">Уведомления</h3>
            </div>
            <div class="overflow-y-auto flex-1">
              <div v-if="notifications.length === 0" class="p-4 text-gray-500 text-center">
                Нет новых уведомлений
              </div>
              <div v-for="notif in notifications" :key="notif.id" class="p-4 border-b hover:bg-gray-50">
                <p class="text-sm font-medium">{{ notif.title }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ notif.message }}</p>
                <div class="flex gap-2 mt-2">
                  <button @click="handleAcceptInvitation(notif.id)"
                    class="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 touch-target">
                    Принять
                  </button>
                  <button @click="handleRejectInvitation(notif.id)"
                    class="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 touch-target">
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button @click="logout"
          class="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          Выйти
        </button>
      </header>

      <!-- Мобильный блок с уведомлениями (под хедером) -->
      <div v-if="showNotifications" class="lg:hidden bg-white border-b shadow-lg">
        <div class="p-4 border-b">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">Уведомления</h3>
            <button @click="showNotifications = false" class="text-gray-400 hover:text-gray-600 p-1 touch-target">
              ✕
            </button>
          </div>
        </div>
        <div class="max-h-64 overflow-y-auto">
          <div v-if="notifications.length === 0" class="p-4 text-gray-500 text-center">
            Нет новых уведомлений
          </div>
          <div v-for="notif in notifications" :key="notif.id" class="p-4 border-b hover:bg-gray-50">
            <p class="text-sm font-medium">{{ notif.title }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ notif.message }}</p>
            <div class="flex gap-2 mt-2">
              <button @click="handleAcceptInvitation(notif.id)"
                class="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 touch-target">
                Принять
              </button>
              <button @click="handleRejectInvitation(notif.id)"
                class="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 touch-target">
                Отклонить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Основной контент -->
      <main class="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
        <router-view />
      </main>

      <!-- Мобильная нижняя панель навигации -->
      <nav class="lg:hidden bg-white border-t flex justify-around py-2 sticky bottom-0 z-30 safe-bottom">
        <router-link :to="ROUTES.DASHBOARD"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-blue-600 transition-colors touch-target"
          active-class="!text-blue-600">
          <!-- Иконка: Мониторинг (пульс/график) -->
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span class="text-[10px] font-medium">Мониторинг</span>
        </router-link>

        <router-link :to="ROUTES.ORGANIZATIONS"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-blue-600 transition-colors touch-target"
          active-class="!text-blue-600">
          <!-- Иконка: Организации (здание) -->
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path
              d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
          </svg>
          <span class="text-[10px] font-medium">Организации</span>
        </router-link>

        <router-link :to="ROUTES.PROFILE"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-blue-600 transition-colors touch-target"
          active-class="!text-blue-600">
          <!-- Иконка: Профиль (человек) -->
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span class="text-[10px] font-medium">Профиль</span>
        </router-link>

        <button @click="logout"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-red-500 transition-colors touch-target">
          <!-- Иконка: Выход (дверь со стрелкой) -->
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span class="text-[10px] font-medium">Выйти</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getInvitations, acceptInvitation, rejectInvitation, type Invitation } from '@/data';
import api from '@/api';
import { ROUTES } from '@/constants/routes';

const route = useRoute();
const router = useRouter();

// ===== Состояние =====
const showNotifications = ref(false);
const notifications = ref<Array<{ id: string; title: string; message: string }>>([]);

// ===== Вычисляемые =====
const isAuthPage = computed(() => route.path.startsWith('/auth'));
const isLandingPage = computed(() => route.path === ROUTES.LANDING);

const unreadNotifications = computed(() => notifications.value.length);

// ===== Обновление токена =====
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken')?.replace(/^"|$/g, '');
  if (!refreshToken) return;

  try {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    const newToken = response.data.token;
    if (newToken) {
      const cleanToken = String(newToken).replace(/["'\s]/g, '');
      localStorage.setItem('token', cleanToken);
      console.log('[Auth] Token refreshed successfully');
    }
  } catch (error) {
    console.error('[Auth] Failed to refresh token:', error);
    // Если не удалось обновить - выходим через 5 секунд
    setTimeout(() => {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push(ROUTES.LOGIN);
      }
    }, 5000);
  }
};

// ===== Методы =====
const loadNotifications = async () => {
  try {
    const invitations = await getInvitations();
    notifications.value = invitations
      .filter((inv: Invitation) => inv.status === 'pending' || inv.status === 'active')
      .map((inv: Invitation) => ({
        id: inv.id,
        title: 'Приглашение в организацию',
        message: `Вас пригласили в "${inv.organizationName || 'Без названия'}"`,
      }));
  } catch {
    // Тишина
  }
};

const handleAcceptInvitation = async (id: string) => {
  try {
    await acceptInvitation(id);
    await loadNotifications();
  } catch (error) {
    console.error('Failed to accept:', error);
  }
};

const handleRejectInvitation = async (id: string) => {
  try {
    await rejectInvitation(id);
    await loadNotifications();
  } catch (error) {
    console.error('Failed to reject:', error);
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  router.push(ROUTES.LANDING);
};

// ===== Закрытие уведомлений по клику вне =====
const handleClickOutside = (e: MouseEvent) => {
  if (showNotifications.value) {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative') && !target.closest('header')) {
      showNotifications.value = false;
    }
  }
};

router.afterEach(() => {
  showNotifications.value = false;
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  // Загружаем уведомления только для авторизованных
  if (localStorage.getItem('token')) {
    loadNotifications();

    // Обновляем уведомления каждые 30 секунд
    const notificationsInterval = setInterval(loadNotifications, 30000);

    // Обновляем токен каждые 4 минуты (240 секунд)
    refreshInterval = setInterval(refreshAuthToken, 4 * 60 * 1000);

    onUnmounted(() => {
      clearInterval(notificationsInterval);
      if (refreshInterval) clearInterval(refreshInterval);
    });
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>