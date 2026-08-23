<script setup lang="ts">
import { ref } from "vue";
import BIG_LOGO_D from "@/assets/big-logo-dark.png";
import BIG_LOGO from "@/assets/big-logo.png";

// TODO(navigation): Give every item a unique ID and a real distinct route, anchor, or contact destination; duplicate '/#' keys are broken placeholders.
const NAV_LINKS = [
  { label: "Документация", to: "/#" },
  { label: "Тарифы", to: "/#pricing" },
  { label: "Поддержка", to: "/#" },
];
const mobileMenuOpen = ref(false);
</script>
<template>
  <div
    class="bg-cotton text-moonless-night selection:bg-moonless-night selection:text-cotton"
  >
    <header>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-3 sm:py-4">
          <!-- Логотип -->
          <div class="flex items-center">
            <div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0">
              <img
                :src="BIG_LOGO"
                alt="ШиП-монитор"
                class="w-full h-full object-contain"
              />
            </div>
          </div>

          <!-- Десктоп-меню -->
          <nav class="hidden md:flex gap-10">
            <router-link
              v-for="link in NAV_LINKS"
              :key="link.to"
              :to="link.to"
              class="hover:text-electric-blue text-center transition-all duration-300 text-lg"
            >
              {{ link.label }}
            </router-link>
          </nav>

          <!-- Бургер (мобильное) -->
          <!-- TODO(a11y): Bind aria-expanded/aria-controls and provide distinct open/close labels for this disclosure button. -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 -mr-2 text-moonless-night"
            aria-label="Меню"
          >
            <svg
              v-if="!mobileMenuOpen"
              class="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Мобильное меню -->
      <Transition name="mobile-menu">
        <nav
          v-if="mobileMenuOpen"
          class="md:hidden bg-white border-t border-moonless-night/10"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            <router-link
              v-for="link in NAV_LINKS"
              :key="link.to"
              :to="link.to"
              @click="mobileMenuOpen = false"
              class="block px-4 py-3 rounded-xl text-lg hover:bg-cotton hover:text-electric-blue transition-colors"
            >
              {{ link.label }}
            </router-link>
          </div>
        </nav>
      </Transition>
    </header>
    <!-- TODO(a11y): Wrap the page slot in a main landmark. -->
    <slot></slot>
    <footer class="bg-moonless-night text-cotton/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0">
            <img
              :src="BIG_LOGO_D"
              alt="ШиП-монитор"
              class="w-full h-full object-contain"
            />
          </div>
          <p class="text-xs sm:text-sm text-center">
            © {{ new Date().getFullYear() }} ШиП-монитор · Российское ПО
          </p>
          <a
            href="mailto:support@ship-monitor.ru"
            class="text-xs sm:text-sm text-electric-blue hover:text-electric-blue/80 transition-colors"
            >support@ship-monitor.ru</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>
