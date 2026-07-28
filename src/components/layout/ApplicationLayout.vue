<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from "vue";
import { useRouter } from "vue-router";
import {
  getInvitations,
  acceptInvitation,
  rejectInvitation,
  type Invitation,
} from "@/data";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/constants/routes";
import IconLogout from "@/components/icons/IconLogout.vue";
import IconPulse from "@/components/icons/IconPulse.vue";
import IconBuilding from "@/components/icons/IconBuilding.vue";
import IconPerson from "@/components/icons/IconPerson.vue";

const router = useRouter();
const authStore = useAuthStore();

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

const logoutHandler = async () => {
  await authStore.logout();
  router.push(ROUTES.LANDING);
};

// ===== Закрытие уведомлений по клику вне =====
const handleClickOutside = (e: MouseEvent) => {
  if (showNotifications.value) {
    const target = e.target as HTMLElement;
    if (!target.closest(".notif-container") && !target.closest("header")) {
      showNotifications.value = false;
    }
  }
};

router.afterEach(() => {
  showNotifications.value = false;
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  if (authStore.isAuthenticated) {
    loadNotifications();
    setInterval(loadNotifications, 10000);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-ink-50">
    <!-- ====== Мобильный хедер ====== -->
    <header
      class="lg:hidden bg-ink-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-ink-800"
    >
      <router-link :to="ROUTES.DASHBOARD" class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-sm">Ш</span>
        <h2 class="text-lg font-bold tracking-tight">ШиП-монитор</h2>
      </router-link>
      <div class="notif-container relative">
        <button
          @click="showNotifications = !showNotifications"
          class="relative p-2 hover:bg-ink-800 rounded-lg touch-target transition-colors"
          aria-label="Уведомления"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          <span
            v-if="unreadNotifications > 0"
            class="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold ring-2 ring-ink-900"
          >
            {{ unreadNotifications }}
          </span>
        </button>
      </div>
    </header>

    <!-- ====== Боковое меню (десктоп) ====== -->
    <aside
      class="hidden h-fit lg:flex bg-ink-900 text-white flex-col lg:w-64 lg:min-h-screen lg:sticky lg:top-0"
    >
      <!-- Логотип -->
      <div class="hidden lg:block p-5 border-b border-ink-800">
        <router-link to="/" class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-base shadow-lg shadow-brand-500/20">Ш</span>
          <h2 class="text-lg font-bold tracking-tight">ШиП-монитор</h2>
        </router-link>
      </div>

      <!-- Навигация -->
      <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <router-link
          v-for="item in NAVIGATION_ITEMS"
          :key="item.link"
          :to="item.link"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-300 hover:bg-ink-800 hover:text-white transition-all duration-150 touch-target group"
          active-class="!bg-brand-500/15 !text-brand-300 font-medium"
        >
          <component :is="item.icon" class="size-5 transition-transform group-hover:scale-110" />
          <span class="text-[15px]">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Поддержка внизу -->
      <div class="p-4 border-t border-ink-800">
        <div class="flex items-center gap-3 px-2">
          <div class="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-sm font-semibold">А</div>
          <div class="min-w-0">
            <p class="text-sm text-white truncate">Поддержка</p>
            <p class="text-xs text-ink-400 truncate">Шевцов А.</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- ====== Правая часть (контент) ====== -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Десктопный хедер -->
      <header
        class="hidden lg:flex bg-white/80 backdrop-blur-md border-b border-ink-200 px-6 py-3 justify-end items-center gap-4 sticky top-0 z-20"
      >
        <div class="notif-container relative">
          <button
            @click="showNotifications = !showNotifications"
            class="relative p-2.5 hover:bg-ink-100 rounded-xl transition-colors touch-target"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            <span
              v-if="unreadNotifications > 0"
              class="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold ring-2 ring-white"
            >
              {{ unreadNotifications }}
            </span>
          </button>
          <!-- Выпадашка уведомлений -->
          <Transition name="notif">
            <div
              v-if="showNotifications"
              class="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-xl border border-ink-200 z-50 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div class="p-4 border-b border-ink-100 flex items-center justify-between">
                <h3 class="font-semibold text-ink-900">Уведомления</h3>
                <span v-if="unreadNotifications > 0" class="ship-badge ship-badge-success">{{ unreadNotifications }}</span>
              </div>
              <div class="overflow-y-auto flex-1">
                <div
                  v-if="notifications.length === 0"
                  class="p-8 text-ink-400 text-center text-sm"
                >
                  Нет новых уведомлений
                </div>
                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="p-4 border-b border-ink-100 hover:bg-ink-50 transition-colors"
                >
                  <p class="text-sm font-medium text-ink-900">{{ notif.title }}</p>
                  <p class="text-xs text-ink-500 mt-1">{{ notif.message }}</p>
                  <div class="flex gap-2 mt-3">
                    <button
                      @click="handleAcceptInvitation(notif.id)"
                      class="px-3 py-1.5 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600 touch-target transition-colors font-medium"
                    >
                      Принять
                    </button>
                    <button
                      @click="handleRejectInvitation(notif.id)"
                      class="px-3 py-1.5 text-xs bg-ink-100 text-ink-600 rounded-lg hover:bg-ink-200 touch-target transition-colors font-medium"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        <button
          @click="logoutHandler"
          class="px-4 flex py-2 gap-2.5 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
        >
          <span>Выйти</span>
          <icon-logout class="size-5" />
        </button>
      </header>

      <!-- Мобильный блок с уведомлениями -->
      <Transition name="notif">
        <div
          v-if="showNotifications"
          class="lg:hidden bg-white border-b border-ink-200 shadow-lg"
        >
          <div class="p-4 border-b border-ink-100 flex justify-between items-center">
            <h3 class="font-semibold text-ink-900">Уведомления</h3>
            <button
              @click="showNotifications = false"
              class="text-ink-400 hover:text-ink-600 p-1 touch-target"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <div
              v-if="notifications.length === 0"
              class="p-4 text-ink-400 text-center text-sm"
            >
              Нет новых уведомлений
            </div>
            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="p-4 border-b border-ink-100 hover:bg-ink-50"
            >
              <p class="text-sm font-medium text-ink-900">{{ notif.title }}</p>
              <p class="text-xs text-ink-500 mt-1">{{ notif.message }}</p>
              <div class="flex gap-2 mt-3">
                <button
                  @click="handleAcceptInvitation(notif.id)"
                  class="px-3 py-1.5 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600 touch-target transition-colors font-medium"
                >
                  Принять
                </button>
                <button
                  @click="handleRejectInvitation(notif.id)"
                  class="px-3 py-1.5 text-xs bg-ink-100 text-ink-600 rounded-lg hover:bg-ink-200 touch-target transition-colors font-medium"
                >
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Основной контент -->
      <main class="flex-1 overflow-auto p-3 sm:p-4 lg:p-8">
        <slot></slot>
      </main>

      <!-- Мобильная нижняя панель навигации -->
      <nav
        class="lg:hidden bg-white border-t border-ink-200 flex justify-around py-2 sticky bottom-0 z-30 safe-bottom"
      >
        <router-link
          v-for="item in NAVIGATION_ITEMS"
          :key="item.link"
          :to="item.link"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-ink-400 hover:text-brand-600 transition-colors touch-target"
          active-class="!text-brand-600"
        >
          <component :is="item.icon" class="size-6" />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </router-link>
        <button
          @click="logoutHandler"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-ink-400 hover:text-red-500 transition-colors touch-target"
        >
          <icon-logout class="size-6" />
          <span class="text-[10px] font-medium">Выйти</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.notif-enter-active,
.notif-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.notif-enter-from,
.notif-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
</style>
