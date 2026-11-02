<template>
  <!-- ====== Hero ====== -->
  <section class="relative overflow-hidden flex items-center min-h-[calc(50dvh-120px)] sm:min-h-[calc(50dvh-80px)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <hgroup class="flex flex-col gap-5">
        <p class="text-sm font-bold uppercase tracking-[0.08em] text-electric-blue">
          {{ $t("zhurnalTemperatur.eyebrow") }}
        </p>
        <h1 class="max-w-4xl text-4xl sm:text-6xl font-extrabold font-accent uppercase leading-tight">
          {{ $t("zhurnalTemperatur.heading") }}
        </h1>
        <p class="mt-6 max-w-2xl text-lg text-moonless-night/70">
          {{ $t("zhurnalTemperatur.lead") }}
        </p>
      </hgroup>

      <div class="mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-0">
        <LandingCtaButton
          size="lg"
          @click="scrollToForm"
        >
          {{ $t("zhurnalTemperatur.cta") }}
        </LandingCtaButton>
        <router-link
          :to="route.landing()"
          class="self-center text-sm font-semibold text-electric-blue hover:text-electric-blue/80 transition-colors"
        >
          ← {{ $t("zhurnalTemperatur.backLink") }}
        </router-link>
      </div>
    </div>
  </section>

  <!-- ====== Что требует СанПиН ====== -->
  <section class="py-16 sm:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ShipHeading
        :heading="$t('zhurnalTemperatur.sanpinHeading')"
        :heading-alt="$t('zhurnalTemperatur.sanpinHeadingAlt')"
        :description="$t('zhurnalTemperatur.sanpinDescription')"
      />

      <div class="grid gap-5 md:grid-cols-3">
        <article
          v-for="item in sanpinItems"
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

  <!-- ====== Ручной против автоматического ====== -->
  <section class="py-16 sm:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-baseline gap-4 mb-12">
        <h2 class="text-4xl sm:text-5xl font-bold uppercase">
          {{ $t("zhurnalTemperatur.compareHeading") }}
        </h2>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <article class="rounded-[26px] border border-moonless-night/10 bg-white p-6 sm:p-8">
          <h3 class="text-xl font-bold text-moonless-night/60">
            {{ $t("zhurnalTemperatur.manualTitle") }}
          </h3>
          <ul class="mt-5 space-y-3">
            <li
              v-for="item in manualItems"
              :key="item"
              class="flex gap-3 text-sm leading-6 text-moonless-night/50"
            >
              <span class="text-moonless-night/30">✕</span>
              {{ item }}
            </li>
          </ul>
        </article>
        <article class="rounded-[26px] border border-electric-blue/30 bg-electric-blue/5 p-6 sm:p-8">
          <h3 class="text-xl font-bold">
            {{ $t("zhurnalTemperatur.autoTitle") }}
          </h3>
          <ul class="mt-5 space-y-3">
            <li
              v-for="item in autoItems"
              :key="item"
              class="flex gap-3 text-sm leading-6"
            >
              <span class="text-electric-blue">✓</span>
              {{ item }}
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <!-- ====== Как это работает ====== -->
  <section class="py-16 sm:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ShipHeading
        :heading="$t('zhurnalTemperatur.howHeading')"
        :heading-alt="$t('zhurnalTemperatur.eyebrow')"
        description=""
      />

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(item, index) in howItems"
          :key="item.title"
          class="rounded-[26px] border border-moonless-night/10 bg-cotton p-6"
        >
          <p class="text-sm font-bold text-electric-blue">
            0{{ index + 1 }}
          </p>
          <h3 class="mt-2 text-lg font-bold">
            {{ item.title }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-moonless-night/50">
            {{ item.text }}
          </p>
        </article>
      </div>
    </div>
  </section>

  <!-- ====== Кому нужен ====== -->
  <section class="py-16 sm:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-baseline gap-4 mb-12">
        <h2 class="text-4xl sm:text-5xl font-bold uppercase">
          {{ $t("zhurnalTemperatur.audienceHeading") }}
        </h2>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <article
          v-for="item in audienceItems"
          :key="item.title"
          class="rounded-[26px] border border-moonless-night/10 bg-white p-6 sm:p-7"
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

  <!-- ====== Форма заявки ====== -->
  <LeadFormSection />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { route } from "@/constants/routes";
import ShipHeading from "@/components/ShipHeading.vue";
import LandingCtaButton from "@/components/LandingCtaButton.vue";
import LeadFormSection from "@/components/LeadFormSection.vue";

const { t } = useI18n();

const sanpinItems = computed(() => [
  { title: t("zhurnalTemperatur.sanpin1Title"), text: t("zhurnalTemperatur.sanpin1Text") },
  { title: t("zhurnalTemperatur.sanpin2Title"), text: t("zhurnalTemperatur.sanpin2Text") },
  { title: t("zhurnalTemperatur.sanpin3Title"), text: t("zhurnalTemperatur.sanpin3Text") },
]);

const manualItems = computed(() => [
  t("zhurnalTemperatur.manual1"),
  t("zhurnalTemperatur.manual2"),
  t("zhurnalTemperatur.manual3"),
  t("zhurnalTemperatur.manual4"),
]);

const autoItems = computed(() => [
  t("zhurnalTemperatur.auto1"),
  t("zhurnalTemperatur.auto2"),
  t("zhurnalTemperatur.auto3"),
  t("zhurnalTemperatur.auto4"),
]);

const howItems = computed(() => [
  { title: t("zhurnalTemperatur.how1Title"), text: t("zhurnalTemperatur.how1Text") },
  { title: t("zhurnalTemperatur.how2Title"), text: t("zhurnalTemperatur.how2Text") },
  { title: t("zhurnalTemperatur.how3Title"), text: t("zhurnalTemperatur.how3Text") },
  { title: t("zhurnalTemperatur.how4Title"), text: t("zhurnalTemperatur.how4Text") },
]);

const audienceItems = computed(() => [
  { title: t("zhurnalTemperatur.audience1Title"), text: t("zhurnalTemperatur.audience1Text") },
  { title: t("zhurnalTemperatur.audience2Title"), text: t("zhurnalTemperatur.audience2Text") },
  { title: t("zhurnalTemperatur.audience3Title"), text: t("zhurnalTemperatur.audience3Text") },
  { title: t("zhurnalTemperatur.audience4Title"), text: t("zhurnalTemperatur.audience4Text") },
]);

const scrollToForm = () => {
  const el = document.getElementById("lead-form");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};
</script>
