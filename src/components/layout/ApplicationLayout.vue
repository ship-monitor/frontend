<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from "vue";
import { useRouter } from "vue-router";
import {
  getInvitations,
  acceptInvitation,
  rejectInvitation,
  type Invitation,
} from "@/data";
import { logout } from "@/data";
import { ROUTES } from "@/constants/routes";
import IconLogout from "@/components/icons/IconLogout.vue";
import IconPulse from "@/components/icons/IconPulse.vue";
import IconBuilding from "@/components/icons/IconBuilding.vue";
import IconPerson from "@/components/icons/IconPerson.vue";

const router = useRouter();

type NavigationItem = { label: string; link: string; icon: Component };
const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Мониторинг", link: ROUTES.DASHBOARD, icon: IconPulse },
  { label: "Организации", link: ROUTES.ORGANIZATIONS, icon: IconBuilding },
  { label: "Профиль", link: ROUTES.PROFILE, icon: IconPerson },
];

// ===== Состояние =====
const showNotifications = ref(false);
const notifications = ref<
  Array<{ id: string; title: string; message: string }>
>([]);

// ===== Вычисляемые =====

const unreadNotifications = computed(() => notifications.value.length);

// ===== Методы =====
const loadNotifications = async () => {
  const invitations = (await getInvitations())
    .inspectErr((err) => console.error("Failed load invitations: %s", err))
    .unwrapOr([]);
  notifications.value = invitations
    .filter(
      (inv: Invitation) => inv.status === "pending" || inv.status === "active"
    )
    .map((inv: Invitation) => ({
      id: inv.id,
      title: "Приглашение в организацию",
      message: `Вас пригласили в "${inv.organizationName || "Без названия"}"`,
    }));
};

const handleAcceptInvitation = async (id: string) => {
  try {
    await acceptInvitation(id);
    await loadNotifications();
  } catch (error) {
    console.error("Failed to accept:", error);
  }
};

const handleRejectInvitation = async (id: string) => {
  try {
    await rejectInvitation(id);
    await loadNotifications();
  } catch (error) {
    console.error("Failed to reject:", error);
  }
};

const logoutHandler = () => {
  logout();
  router.push(ROUTES.LANDING);
};

// ===== Закрытие уведомлений по клику вне =====
const handleClickOutside = (e: MouseEvent) => {
  if (showNotifications.value) {
    const target = e.target as HTMLElement;
    if (!target.closest(".relative") && !target.closest("header")) {
      showNotifications.value = false;
    }
  }
};

router.afterEach(() => {
  showNotifications.value = false;
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  // Загружаем уведомления только для авторизованных
  if (localStorage.getItem("token")) {
    loadNotifications();

    setInterval(loadNotifications, 10000);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-gray-50">
    <!-- ====== Мобильный хедер ====== -->
    <header
      class="lg:hidden bg-[#1E293B] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40"
    >
      <router-link :to="ROUTES.DASHBOARD">
        <h2 class="text-lg font-bold">ШиП-монитор</h2>
      </router-link>
      <button
        @click="showNotifications = !showNotifications"
        class="relative p-2 hover:bg-gray-700 rounded-lg touch-target"
        aria-label="Уведомления"
      >
        <span class="text-xl">🔔</span>
        <span
          v-if="unreadNotifications > 0"
          class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
        >
          {{ unreadNotifications }}
        </span>
      </button>
    </header>
    <!-- ====== Боковое меню (десктоп) ====== -->
    <aside
      class="hidden h-fit lg:flex bg-[#1E293B] text-white flex-col lg:w-64 lg:min-h-screen lg:sticky lg:top-0"
    >
      <!-- Логотип (только десктоп) -->
      <div class="hidden lg:block p-4 border-b border-gray-700">
        <router-link to="/">
          <h2 class="text-xl font-bold">ШиП-монитор</h2>
        </router-link>
      </div>
      <!-- Навигация -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in NAVIGATION_ITEMS"
          :to="item.link"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-gray-700 transition-colors touch-target"
          active-class="bg-gray-700"
        >
          <component :is="item.icon" class="size-5" />
          <span class="text-base">{{ item.label }}</span>
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
      <header
        class="hidden lg:flex bg-white border-b px-6 py-3 justify-end items-center gap-4 sticky top-0 z-20"
      >
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
          <!-- Выпадашка уведомлений -->
          <div
            v-if="showNotifications"
            class="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div class="p-4 border-b">
              <h3 class="font-semibold">Уведомления</h3>
            </div>
            <div class="overflow-y-auto flex-1">
              <div
                v-if="notifications.length === 0"
                class="p-4 text-gray-500 text-center"
              >
                Нет новых уведомлений
              </div>
              <div
                v-for="notif in notifications"
                :key="notif.id"
                class="p-4 border-b hover:bg-gray-50"
              >
                <p class="text-sm font-medium">{{ notif.title }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ notif.message }}</p>
                <div class="flex gap-2 mt-2">
                  <button
                    @click="handleAcceptInvitation(notif.id)"
                    class="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 touch-target"
                  >
                    Принять
                  </button>
                  <button
                    @click="handleRejectInvitation(notif.id)"
                    class="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 touch-target"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          @click="logoutHandler"
          class="px-4 flex py-2 gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span> Выйти </span>
          <icon-logout class="size-6" />
        </button>
      </header>
      <!-- Мобильный блок с уведомлениями (под хедером) -->
      <div
        v-if="showNotifications"
        class="lg:hidden bg-white border-b shadow-lg"
      >
        <div class="p-4 border-b">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">Уведомления</h3>
            <button
              @click="showNotifications = false"
              class="text-gray-400 hover:text-gray-600 p-1 touch-target"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="max-h-64 overflow-y-auto">
          <div
            v-if="notifications.length === 0"
            class="p-4 text-gray-500 text-center"
          >
            Нет новых уведомлений
          </div>
          <div
            v-for="notif in notifications"
            :key="notif.id"
            class="p-4 border-b hover:bg-gray-50"
          >
            <p class="text-sm font-medium">{{ notif.title }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ notif.message }}</p>
            <div class="flex gap-2 mt-2">
              <button
                @click="handleAcceptInvitation(notif.id)"
                class="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 touch-target"
              >
                Принять
              </button>
              <button
                @click="handleRejectInvitation(notif.id)"
                class="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 touch-target"
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Основной контент -->
      <main class="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
        <slot></slot>
      </main>
      <!-- Мобильная нижняя панель навигации -->
      <nav
        class="lg:hidden bg-white border-t flex justify-around py-2 sticky bottom-0 z-30 safe-bottom"
      >
        <router-link
          v-for="item in NAVIGATION_ITEMS"
          :to="item.link"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-blue-600 transition-colors touch-target"
          active-class="!text-blue-600"
        >
          <component :is="item.icon" class="size-6" />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </router-link>
        <button
          @click="logoutHandler"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400 hover:text-red-500 transition-colors touch-target"
        >
          <!-- Иконка: Выход (дверь со стрелкой) -->
          <icon-logout class="size-6" />
          <span class="text-[10px] font-medium">Выйти</span>
        </button>
      </nav>
    </div>
  </div>
</template>
