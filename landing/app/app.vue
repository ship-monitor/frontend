<script setup lang="ts">
import CookieBanner from "@/components/CookieBanner.vue";

const route = useRoute();

const lang = computed(() => (route.path.startsWith("/en") ? "en" : "ru"));

useHead({
  htmlAttrs: { lang },
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CookieBanner />
</template>
