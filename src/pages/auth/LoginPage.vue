<script setup lang="ts">
import { computed, ref } from "vue";
import { ROUTES } from "@/constants/routes";
import { login } from "@/data/auth";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

import ShipTextbox from "@/components/ShipTextbox.vue";

const email = ref("");
const password = ref("");
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const errorMessage = ref<string | null>(null);

const justRegistered = computed(() => route.query.registered === "1");
const showPassword = ref(false);

const handleLogin = async () => {
  errorMessage.value = null;
  const result = await login(email.value.trim(), password.value);
  await result.match({
    Ok: async () => {
      await authStore.checkLogin();
      const redirect = route.query.redirect;
      const target =
        typeof redirect === "string" &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : ROUTES.DASHBOARD;
      router.push(target);
    },
    Err: async (err) => {
      errorMessage.value = err;
    },
  });
};
</script>

<template>
  <div class="min-h-screen flex">
    <!-- ====== Левая бренд-панель (десктоп) ====== -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-ink-900 text-white relative overflow-hidden flex-col justify-between p-12"
    >
      <div class="absolute inset-0 bg-grid opacity-30"></div>

      <!-- Логотип -->
      <div class="relative flex items-center gap-3">
        <span class="w-11 h-11 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-brand-500/30">Ш</span>
        <span class="text-xl font-bold tracking-tight">ШиП-монитор</span>
      </div>

      <!-- Контент -->
      <div class="relative space-y-6">
        <h1 class="text-4xl font-bold leading-tight tracking-tight">
          Контроль температуры<br />
          <span class="text-brand-400">24 часа в сутки</span>
        </h1>
        <p class="text-ink-300 text-lg leading-relaxed max-w-md">
          Мониторинг холодильного оборудования с мгновенными уведомлениями
          при авариях — даже без интернета.
        </p>
        <div class="flex items-center gap-6 pt-4">
          <div>
            <p class="text-2xl font-bold text-brand-400">24/7</p>
            <p class="text-xs text-ink-400">Мониторинг</p>
          </div>
          <div class="w-px h-10 bg-ink-700"></div>
          <div>
            <p class="text-2xl font-bold text-brand-400">SMS</p>
            <p class="text-xs text-ink-400">Уведомления</p>
          </div>
          <div class="w-px h-10 bg-ink-700"></div>
          <div>
            <p class="text-2xl font-bold text-brand-400">GSM</p>
            <p class="text-xs text-ink-400">Без интернета</p>
          </div>
        </div>
      </div>

      <p class="relative text-xs text-ink-500">
        Российское ПО · Реестр отечественного ПО · 152-ФЗ
      </p>
    </div>

    <!-- ====== Правая форма ====== -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-12 bg-ink-50">
      <div class="w-full max-w-sm animate-fade-in-up">
        <!-- Мобильный логотип -->
        <div class="lg:hidden flex items-center justify-center gap-2.5 mb-8">
          <span class="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-base">Ш</span>
          <span class="text-lg font-bold text-ink-900">ШиП-монитор</span>
        </div>

        <h2 class="text-2xl font-bold text-ink-900 tracking-tight">Вход</h2>
        <p class="text-sm text-ink-500 mt-1.5 mb-6">
          Войдите в систему мониторинга
        </p>

        <!-- Уведомления -->
        <div
          v-if="justRegistered"
          class="mb-4 p-3.5 rounded-xl bg-brand-50 text-brand-700 text-sm ring-1 ring-inset ring-brand-200 flex items-center gap-2.5 animate-scale-in"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Регистрация успешна. Войдите в аккаунт.
        </div>
        <div
          v-if="errorMessage"
          class="mb-4 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm ring-1 ring-inset ring-red-200 flex items-center gap-2.5 animate-scale-in"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
            <ship-textbox
              v-model="email"
              placeholder="you@example.com"
              name="email"
              autocomplete="email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-700 mb-1.5">Пароль</label>
            <div class="relative">
              <ship-textbox
                v-model="password"
                placeholder="••••••••"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="pr-11"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors p-1"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-all duration-150 active:scale-[0.98] hover:shadow-md hover:shadow-brand-500/20"
          >
            Войти
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-ink-500">
          Нет аккаунта?
          <router-link
            :to="ROUTES.REGISTER"
            class="text-brand-600 hover:text-brand-700 font-semibold"
          >
            Зарегистрироваться
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
