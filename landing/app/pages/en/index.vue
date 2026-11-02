<script setup lang="ts">
import LandingPage from "@/components/LandingPage.vue";
import {
  getRawFaqItems,
  hydrateFaqItems,
  useFaq,
} from "@/composables/useFaq";
import {
  getRawRoadmapItems,
  hydrateRoadmapItems,
  useRoadmap,
} from "@/composables/useRoadmap";
import { useLandingSeo } from "@/composables/useLandingSeo";

definePageMeta({
  layout: "landing",
});

// SSR: FAQ и roadmap загружаются на сервере до рендера и сериализуются
// в payload — клиент гидратирует кэш без повторного запроса к CMS.
const { data } = await useAsyncData("landing-content", async () => {
  await Promise.allSettled([useFaq().fetchFaq(), useRoadmap().fetchRoadmap()]);
  return { faq: getRawFaqItems(), roadmap: getRawRoadmapItems() };
});

if (data.value) {
  hydrateFaqItems(data.value.faq);
  hydrateRoadmapItems(data.value.roadmap);
}

useLandingSeo("en");
</script>

<template>
  <LandingPage />
</template>
