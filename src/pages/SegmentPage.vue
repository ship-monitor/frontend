<template>
  <!-- ====== Hero ====== -->
  <section class="relative overflow-hidden flex items-center min-h-[calc(50dvh-120px)] sm:min-h-[calc(50dvh-80px)]">
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <hgroup class="flex flex-col gap-5">
        <p class="text-sm font-bold uppercase tracking-[0.08em] text-electric-blue">
          {{ t(`segmentsPages.${segment}.eyebrow`) }}
        </p>
        <h1 class="max-w-4xl text-4xl sm:text-6xl font-extrabold font-accent uppercase leading-tight">
          {{ t(`segmentsPages.${segment}.heading`) }}
        </h1>
        <p class="mt-6 max-w-2xl text-lg text-moonless-night/70">
          {{ t(`segmentsPages.${segment}.lead`) }}
        </p>
      </hgroup>

      <div class="mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-0">
        <LandingCtaButton
          size="lg"
          @click="scrollToForm"
        >
          {{ t("segmentsPages.common.cta") }}
        </LandingCtaButton>
        <router-link
          :to="route.landing()"
          class="self-center text-sm font-semibold text-electric-blue hover:text-electric-blue/80 transition-colors"
        >
          ← {{ t("segmentsPages.common.backLink") }}
        </router-link>
      </div>
    </div>
  </section>

  <!-- ====== Задачи сегмента ====== -->
  <section class="py-16 sm:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ShipHeading
        :heading="t(`segmentsPages.${segment}.painHeading`)"
        :heading-alt="t(`segmentsPages.${segment}.eyebrow`)"
        description=""
      />

      <div class="grid gap-5 md:grid-cols-2">
        <article
          v-for="item in painItems"
          :key="item.title"
          class="rounded-[26px] border border-moonless-night/10 bg-cotton p-6 sm:p-7"
        >
          <h3 class="text-xl font-bold">
            {{ item.title }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-moonless-night/50">
            {{ item.text }}
          </p>
        </article>
      </div>
    </div>
  </section>

  <!-- ====== Почему ШиП-Монитор ====== -->
  <section class="py-16 sm:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-baseline gap-4 mb-12">
        <h2 class="text-4xl sm:text-5xl font-bold uppercase">
          {{ t("segmentsPages.common.benefitsHeading") }}
        </h2>
      </div>

      <ul class="grid gap-5 md:grid-cols-2">
        <li
          v-for="(item, index) in benefits"
          :key="item"
          class="flex gap-4 rounded-[26px] border border-moonless-night/10 bg-white p-6 text-sm leading-6"
        >
          <span class="text-electric-blue text-lg leading-none pt-0.5">✓</span>
          <span>
            <template v-if="index === 2">
              {{ item }}
              <router-link
                :to="route.zhurnalTemperatur()"
                class="text-electric-blue hover:text-electric-blue/80 transition-colors font-semibold"
              >{{ t("segmentsPages.common.benefit3Link") }}</router-link>
            </template>
            <template v-else>
              {{ item }}
            </template>
          </span>
        </li>
      </ul>
    </div>
  </section>

  <!-- ====== Форма заявки ====== -->
  <LeadFormSection />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { route } from "@/constants/routes";
import type { CustomRouteMeta } from "@/router";
import ShipHeading from "@/components/ShipHeading.vue";
import LandingCtaButton from "@/components/LandingCtaButton.vue";
import LeadFormSection from "@/components/LeadFormSection.vue";

const { t } = useI18n();
const routeState = useRoute();

const segment = computed(
  () => (routeState.meta as CustomRouteMeta).segment ?? "apteki",
);

const painItems = computed(() => [
  {
    title: t(`segmentsPages.${segment.value}.pain1Title`),
    text: t(`segmentsPages.${segment.value}.pain1Text`),
  },
  {
    title: t(`segmentsPages.${segment.value}.pain2Title`),
    text: t(`segmentsPages.${segment.value}.pain2Text`),
  },
  {
    title: t(`segmentsPages.${segment.value}.pain3Title`),
    text: t(`segmentsPages.${segment.value}.pain3Text`),
  },
  {
    title: t(`segmentsPages.${segment.value}.pain4Title`),
    text: t(`segmentsPages.${segment.value}.pain4Text`),
  },
]);

const benefits = computed(() => [
  t("segmentsPages.common.benefit1"),
  t("segmentsPages.common.benefit2"),
  t("segmentsPages.common.benefit3"),
  t("segmentsPages.common.benefit4"),
]);

const scrollToForm = () => {
  const el = document.getElementById("lead-form");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};
</script>
