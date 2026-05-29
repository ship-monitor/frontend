<template>
  <!-- Страницы входа/регистрации без меню -->
  <div v-if="isAuthPage">
    <router-view />
  </div>

  <!-- Основной layout с меню -->
  <div v-else class="flex flex-row min-h-screen bg-gray-50">
    <!-- Левое меню -->
    <aside class="w-64 bg-[#1E293B] text-white flex flex-col min-h-screen">
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-xl font-bold">ШиП-монитор</h2>
      </div>
      
      <nav class="flex-1 p-4 space-y-1">
        <router-link to="/" class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-700 transition-colors"
          active-class="bg-gray-700">
          <span>📊</span> Мониторинг
        </router-link>
        <router-link to="/organizations" class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-700 transition-colors"
          active-class="bg-gray-700">
          <span>🏢</span> Организации
        </router-link>
        <router-link to="/profile" class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-700 transition-colors"
          active-class="bg-gray-700">
          <span>👤</span> Профиль
        </router-link>
        <router-link to="/settings" class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-700 transition-colors"
          active-class="bg-gray-700">
          <span>⚙️</span> Настройки
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-700 text-sm text-gray-400">
        <p>Поддержка</p>
        <p class="text-xs">Шевцов А.</p>
      </div>
    </aside>

    <!-- Правая часть -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Верхний хедер -->
      <header class="bg-white border-b px-6 py-3 flex justify-end items-center gap-4">
        <div class="relative">
          <button 
            @click="showNotifications = !showNotifications"
            class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span class="text-xl">🔔</span>
            <span 
              v-if="unreadNotifications > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ unreadNotifications }}
            </span>
          </button>
          
          <div 
            v-if="showNotifications"
            class="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50"
          >
            <div class="p-4 border-b">
              <h3 class="font-semibold">Уведомления</h3>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <div v-if="notifications.length === 0" class="p-4 text-gray-500 text-center">
                Нет новых уведомлений
              </div>
              <div 
                v-for="notif in notifications" 
                :key="notif.id"
                class="p-4 border-b hover:bg-gray-50 cursor-pointer"
              >
                <p class="text-sm font-medium">{{ notif.title }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ notif.message }}</p>
                <div class="flex gap-2 mt-2">
                  <button
                    @click="handleAcceptInvitation(notif.id)"
                    class="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Принять
                  </button>
                  <button
                    @click="handleRejectInvitation(notif.id)"
                    class="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          @click="logout"
          class="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Выйти
        </button>
      </header>

      <!-- Основной контент -->
      <main class="flex-1 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getInvitations, acceptInvitation, rejectInvitation, type Invitation } from '@/data';

const route = useRoute();
const router = useRouter();
const showNotifications = ref(false);
const notifications = ref<any[]>([]);

// Определяем страницы без меню
const isAuthPage = computed(() => {
  return route.path.startsWith('/auth');
});

const loadNotifications = async () => {
  try {
    const invitations = await getInvitations();
    notifications.value = invitations
      .filter(inv => inv.status === 'pending' || inv.status === 'active')
      .map(inv => ({
        id: inv.id,
        title: 'Приглашение в организацию',
        message: `Вас пригласили в "${inv.organizationName || 'Без названия'}"`,
      }));
  } catch (error) {
    // Тишина
  }
};

const unreadNotifications = computed(() => notifications.value.length);

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
  router.push('/auth/login');
};

const handleClickOutside = (e: MouseEvent) => {
  if (showNotifications.value) {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      showNotifications.value = false;
    }
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadNotifications();
  const interval = setInterval(loadNotifications, 30000);
  onUnmounted(() => clearInterval(interval));
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
