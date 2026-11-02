<template>
  <section
    id="segments"
    class="py-16 sm:py-24 bg-white"
  >
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ShipHeading
        :heading="$t('segments.heading')"
        :heading-alt="$t('segments.headingAlt')"
        :description="$t('segments.description')"
      />

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="segment in segments"
          :key="segment.title"
          class="rounded-[26px] border border-moonless-night/10 bg-cotton p-6 sm:p-7"
        >
          <h3 class="text-xl font-bold">
            {{ segment.title }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-moonless-night/50">
            {{ segment.text }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import ShipHeading from "@/components/ShipHeading.vue";

const { t } = useI18n();

const segments = computed(() => [
  { title: t("segments.seg1Title"), text: t("segments.seg1Text") },
  { title: t("segments.seg2Title"), text: t("segments.seg2Text") },
  { title: t("segments.seg3Title"), text: t("segments.seg3Text") },
  { title: t("segments.seg4Title"), text: t("segments.seg4Text") },
  { title: t("segments.seg5Title"), text: t("segments.seg5Text") },
  { title: t("segments.seg6Title"), text: t("segments.seg6Text") },
]);
</script>
