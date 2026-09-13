<template>
  <Transition name="banner">
    <div
      v-if="isVisible"
      class="fixed inset-x-0 bottom-0 z-100 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6"
      role="region"
      aria-label="Уведомление об использовании cookie-файлов"
    >
      <div
        class="mx-auto max-w-2xl rounded-2xl border border-moonless-night/10 bg-white p-5 sm:p-6 shadow-[0_24px_48px_-16px_rgb(45_45_45/0.25)]"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div class="flex-1">
            <h3 class="mb-1 text-lg font-bold tracking-tight text-moonless-night">
              Cookie-файлы
            </h3>
            <p class="text-sm leading-relaxed text-moonless-night/70 sm:text-base">
              Мы используем cookie-файлы для корректной работы сайта. Продолжая
              пользоваться сайтом, вы соглашаетесь с их использованием. По
              вопросам обработки персональных данных:
              <a
                :href="`mailto:${SUPPORT_EMAIL}`"
                class="font-medium text-electric-blue underline decoration-electric-blue/40 underline-offset-2 transition-colors hover:decoration-electric-blue"
              >{{ SUPPORT_EMAIL }}</a>
            </p>
          </div>
          <button
            type="button"
            class="inline-flex w-full sm:w-auto shrink-0 items-center justify-center rounded-full bg-electric-blue px-7 py-3 text-base font-semibold text-cotton select-none cursor-pointer transition-colors hover:bg-electric-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue/60 focus-visible:ring-offset-2 active:translate-y-0.5"
            @click="closeBanner"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { SUPPORT_EMAIL } from "@/constants/contacts";
import safeStorage from "@/utils/storage";

const isVisible = ref(false);

const closeBanner = () => {
  isVisible.value = false;
  safeStorage.setItem("cookiesBannerClosed", "true");
};

onMounted(() => {
  if (!safeStorage.getJson("cookiesBannerClosed")) {
    isVisible.value = true;
  }
});
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition:
    opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(24px);
}

@media (prefers-reduced-motion: reduce) {
  .banner-enter-active,
  .banner-leave-active {
    transition: none;
  }
}
</style>
