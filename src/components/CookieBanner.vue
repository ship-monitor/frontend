<template>
  <div v-if="isVisible" class="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 sm:p-6 transition-all duration-300">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
        <div class="flex-1 text-center lg:text-left">
          <h3 class="text-white font-semibold text-lg mb-1">Мы используем куки!</h3>
          <p class="text-gray-300 text-sm sm:text-base leading-relaxed">
            Our website uses cookies to enhance your experience. By using our site, you agree to our use of cookies.
          </p>
        </div>
        <div class="flex items-center gap-3 w-full lg:w-auto">
          <button
            @click="acceptCookies"
            class="flex-1 lg:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
          >
            Принять
          </button>
          <button
            @click="rejectCookies"
            class="flex-1 lg:flex-none px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const isVisible = ref(false);

const acceptCookies = () => {
  isVisible.value = false;
  localStorage.setItem("cookiesAccepted", "true");
  sessionStorage.setItem("cookiesAccepted", "true");
};

const rejectCookies = () => {
  isVisible.value = false;
  localStorage.setItem("cookiesAccepted", "false");
  sessionStorage.setItem("cookiesAccepted", "false");
};

onMounted(() => {
  const accepted = localStorage.getItem("cookiesAccepted");
  if (!accepted) {
    isVisible.value = true;
  }
});
</script>