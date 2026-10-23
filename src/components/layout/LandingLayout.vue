<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { SUPPORT_EMAIL } from "@/constants/contacts";
import BIG_LOGO_D from "@/assets/big-logo-dark.webp";
import BIG_LOGO from "@/assets/big-logo.webp";

const { t } = useI18n();

const mobileMenuOpen = ref(false);

const navLinks = computed(() => [
  { label: t("nav.devices"), to: "#devices" },
  { label: t("nav.pricing"), to: "#pricing" },
  { label: t("nav.support"), to: "#lead-form" },
]);

const scrollToSection = (anchor: string) => {
  mobileMenuOpen.value = false;
  const element = document.querySelector(anchor);
  if (element) {
    const headerHeight = 80; // Примерная высота header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};
</script>
<template>
  <div class="bg-cotton text-moonless-night selection:bg-moonless-night selection:text-cotton">
    <header class="fixed top-0 left-0 right-0 z-50 bg-cotton border-b border-moonless-night/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-3 sm:py-4">
          <!-- Логотип -->
          <div class="flex items-center">
            <div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0">
              <img
                :src="BIG_LOGO"
                alt="ШиП-монитор"
                class="w-full h-full object-contain"
              >
            </div>
          </div>

          <!-- Десктоп-меню -->
          <nav class="hidden md:flex gap-10">
            <a
              v-for="link in navLinks"
              :key="link.to"
              :href="link.to"
              class="hover:text-electric-blue text-center transition-all duration-300 text-lg cursor-pointer"
              @click.prevent="scrollToSection(link.to)"
            >
              {{ link.label }}
            </a>
          </nav>

          <div class="flex items-center gap-2">
            <nav class="hidden md:flex gap-1 rounded-full border border-moonless-night/15 p-1 text-sm">
              <router-link
                to="/"
                class="rounded-full px-3 py-1 transition-colors"
                :class="$route.name === 'Landing' ? 'bg-electric-blue text-cotton' : 'hover:text-electric-blue'"
              >
                RU
              </router-link>
              <router-link
                to="/en"
                class="rounded-full px-3 py-1 transition-colors"
                :class="$route.name === 'LandingEn' ? 'bg-electric-blue text-cotton' : 'hover:text-electric-blue'"
              >
                EN
              </router-link>
            </nav>

            <!-- Бургер (мобильное) -->
            <button
              class="md:hidden p-2 -mr-2 text-moonless-night"
              :aria-label="$t('layout.menu')"
              :aria-expanded="mobileMenuOpen"
              aria-controls="mobile-menu"
              @click="mobileMenuOpen = !mobileMenuOpen"
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
      </div>

      <!-- Мобильное меню -->
      <Transition name="mobile-menu">
        <nav
          v-if="mobileMenuOpen"
          id="mobile-menu"
          class="md:hidden bg-white border-t border-moonless-night/10"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            <a
              v-for="link in navLinks"
              :key="link.to"
              :href="link.to"
              class="block px-4 py-3 rounded-xl text-lg hover:bg-cotton hover:text-electric-blue transition-colors cursor-pointer"
              @click.prevent="scrollToSection(link.to)"
            >
              {{ link.label }}
            </a>
            <div class="flex gap-2 px-4 pt-3 text-lg">
              <router-link
                to="/"
                class="rounded-full border border-moonless-night/15 px-4 py-2"
                :class="$route.name === 'Landing' ? 'bg-electric-blue text-cotton border-electric-blue' : ''"
              >
                RU
              </router-link>
              <router-link
                to="/en"
                class="rounded-full border border-moonless-night/15 px-4 py-2"
                :class="$route.name === 'LandingEn' ? 'bg-electric-blue text-cotton border-electric-blue' : ''"
              >
                EN
              </router-link>
            </div>
          </div>
        </nav>
      </Transition>
    </header>

    <!-- Отступ, чтобы контент не скрывался под фиксированным header -->
    <main class="pt-16 md:pt-20">
      <slot />
    </main>
    <footer class="bg-moonless-night text-cotton/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0">
            <img
              :src="BIG_LOGO_D"
              alt="ШиП-монитор"
              class="w-full h-full object-contain"
            >
          </div>
          <p class="text-xs sm:text-sm text-center">
            © {{ new Date().getFullYear() }} ШиП-монитор · {{ $t("layout.footerNote") }}
          </p>
          <a
            :href="`mailto:${SUPPORT_EMAIL}`"
            class="text-xs sm:text-sm text-electric-blue hover:text-electric-blue/80 transition-colors"
          >{{ SUPPORT_EMAIL }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
