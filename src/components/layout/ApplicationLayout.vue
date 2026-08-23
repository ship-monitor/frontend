<script setup lang="ts">
import { type Component } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/constants/routes";
import IconLogout from "@/components/icons/IconLogout.vue";
import IconPulse from "@/components/icons/IconPulse.vue";
import IconPerson from "@/components/icons/IconPerson.vue";

const router = useRouter();
const authStore = useAuthStore();

type NavigationItem = { label: string; link: string; icon: Component };
const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Мониторинг", link: ROUTES.DASHBOARD, icon: IconPulse },
  { label: "Профиль", link: ROUTES.PROFILE, icon: IconPerson },
];

const logoutHandler = async () => {
  await authStore.logout();
  router.push(ROUTES.LANDING);
};

// TODO(dead-code): Remove this no-op global hook; every layout mount registers another callback and discards its cleanup function.
router.afterEach(() => {});
</script>
<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-ink-50">
    <!-- ====== Мобильный хедер ====== -->
    <header
      class="lg:hidden bg-ink-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-ink-800"
    >
      <router-link :to="ROUTES.DASHBOARD" class="flex items-center gap-2">
        <span
          class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-sm"
          >Ш</span
        >
        <h2 class="text-lg font-bold tracking-tight">ШиП-монитор</h2>
      </router-link>
      <router-link
        :to="ROUTES.CONNECT_DEVICE"
        class="px-3 py-1.5 bg-brand-500 text-white rounded-lg text-sm font-medium touch-target transition-colors hover:bg-brand-600"
      >
        + Устройство
      </router-link>
    </header>

    <!-- ====== Боковое меню (десктоп) ====== -->
    <aside
      class="hidden h-fit lg:flex bg-ink-900 text-white flex-col lg:w-64 lg:min-h-screen lg:sticky lg:top-0"
    >
      <!-- Логотип -->
      <div class="hidden lg:block p-5 border-b border-ink-800">
        <!-- TODO(router): Use the central route constant instead of a hard-coded application path. -->
        <router-link to="/" class="flex items-center gap-3">
          <span
            class="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-base shadow-lg shadow-brand-500/20"
            >Ш</span
          >
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
          <component
            :is="item.icon"
            class="size-5 transition-transform group-hover:scale-110"
          />
          <span class="text-[15px]">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Поддержка внизу -->
      <div class="p-4 border-t border-ink-800">
        <div class="flex items-center gap-3 px-2">
          <div
            class="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-sm font-semibold"
          >
            А
          </div>
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
        <router-link
          :to="ROUTES.CONNECT_DEVICE"
          class="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium text-sm hover:bg-brand-700 transition-colors touch-target"
        >
          + Подключить устройство
        </router-link>
        <button
          @click="logoutHandler"
          class="px-4 flex py-2 gap-2.5 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
        >
          <span>Выйти</span>
          <icon-logout class="size-5" />
        </button>
      </header>

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
