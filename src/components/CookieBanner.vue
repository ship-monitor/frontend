<template>
  <div v-if="isVisible" class="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 sm:p-6 transition-all duration-300">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        <div class="flex-1 text-center sm:text-left">
          <h3 class="text-white font-semibold text-lg mb-1">Мы используем куки!</h3>
          <p class="text-gray-300 text-sm sm:text-base leading-relaxed">
            Наш сайт использует куки для улучшения вашего опыта. Продолжая использовать сайт, вы соглашаетесь на использование куки.
          </p>
        </div>
        <button
          @click="closeBanner"
          class="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex-shrink-0"
        >
          <svg
            class="w-5 h-5"
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
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

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