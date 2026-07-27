<template>
  <Transition name="banner">
    <div
      v-if="isVisible"
      class="fixed bottom-0 left-0 right-0 z-100 bg-ink-900/95 backdrop-blur-md border-t border-ink-800 p-4 sm:p-6"
    >
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div class="flex-1 text-center sm:text-left">
            <h3 class="text-white font-semibold text-lg mb-1">
              Мы используем куки!
            </h3>
            <p class="text-ink-300 text-sm sm:text-base leading-relaxed">
              Наш сайт использует куки для улучшения вашего опыта. Продолжая
              использовать сайт, вы соглашаетесь на использование куки.
            </p>
          </div>
          <button
            @click="closeBanner"
            class="flex items-center justify-center w-10 h-10 bg-ink-800 hover:bg-brand-500 text-white rounded-lg transition-colors duration-200 shrink-0"
          >
            <IconCross class="size-5" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import IconCross from "./icons/IconCross.vue";

const isVisible = ref(false);

const closeBanner = () => {
  isVisible.value = false;
  localStorage.setItem("cookiesBannerClosed", "true");
};

onMounted(() => {
  const closed = localStorage.getItem("cookiesBannerClosed");
  if (!closed) {
    isVisible.value = true;
  }
});
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
