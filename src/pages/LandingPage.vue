<template>
  <!-- ====== Hero Section ====== -->
  <section
    class="relative overflow-hidden flex items-center min-h-[calc(100dvh-120px)] sm:min-h-[calc(100dvh-80px)]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <hgroup class="flex flex-col gap-5">
        <div class="text-xl">
          {{ $t("hero.tagline") }}
        </div>
        <h1
          class="text-4xl sm:text-7xl md:text-9xl font-extrabold font-accent uppercase"
        >
          {{ $t("hero.title") }}
        </h1>
        <p class="mt-6 max-w-2xl text-lg text-moonless-night/70">
          {{ $t("hero.subtitle") }}
        </p>
      </hgroup>

      <div
        class="mt-40 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 justify-center"
      >
        <LandingCtaButton
          size="lg"
          @click="scrollToForm"
        >
          {{ $t("hero.cta") }}
        </LandingCtaButton>
      </div>
      <p class="mt-4 text-center text-sm text-moonless-night/60">
        {{ $t("hero.priceNote") }}
        <template v-if="isRuLocale">
          ·
          <router-link
            :to="route.zhurnalTemperatur()"
            class="text-electric-blue hover:text-electric-blue/80 transition-colors"
          >
            {{ $t("hero.zhurnalLink") }}
          </router-link>
        </template>
      </p>
    </div>
  </section>

  <!-- ====== Архитектура системы ====== -->
  <ArchitectureSection />

  <!-- ====== Сегменты ====== -->
  <SegmentsSection />

  <!-- ====== Дорожная карта ====== -->
  <section class="py-16 sm:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ShipHeading
        :heading="$t('roadmap.heading')"
        :heading-alt="$t('roadmap.headingAlt')"
        description=""
      />

      <div
        v-if="roadmapLoading"
        class="border-t border-moonless-night/10"
        role="status"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-8 py-6 border-b border-moonless-night/10 animate-pulse"
        >
          <div class="h-4 bg-moonless-night/10 rounded" />
          <div class="space-y-2">
            <div class="h-5 bg-moonless-night/10 rounded w-1/3" />
            <div class="h-3 bg-moonless-night/10 rounded w-2/3" />
          </div>
        </div>
      </div>

      <div
        v-else-if="roadmapError"
        class="py-10 text-center"
        role="alert"
      >
        <p class="text-moonless-night/60 mb-3">
          {{ $t("roadmap.unavailable") }}
        </p>
        <button
          class="px-5 py-2.5 bg-electric-blue text-cotton rounded-full text-sm font-semibold hover:bg-electric-blue/90"
          @click="fetchRoadmap"
        >
          {{ $t("roadmap.retry") }}
        </button>
      </div>

      <p
        v-else-if="roadmapItems.length === 0"
        class="py-10 text-center text-moonless-night/50"
      >
        {{ $t("roadmap.empty") }}
      </p>

      <div
        v-else
        class="border-t border-moonless-night/10"
      >
        <div
          v-for="item in roadmapItems"
          :key="item.id"
          class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-8 py-6 border-b border-moonless-night/10"
        >
          <span class="text-electric-blue text-sm font-semibold pt-1">
            {{ item.stage_date }}
          </span>
          <div>
            <h3 class="text-lg font-bold mb-1">
              {{ item.stage_name }}
            </h3>
            <p class="text-moonless-night/60 text-sm leading-relaxed">
              {{ item.stage_description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====== Технологии ====== -->
  <section class="py-16 sm:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-baseline gap-4 mb-12">
        <h2 class="text-4xl sm:text-5xl font-bold uppercase">
          {{ $t("tech.heading") }}
        </h2>
      </div>
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20">
        <!-- Аппаратная часть -->
        <div>
          <p class="text-electric-blue font-semibold text-sm mb-4">
            {{ $t("tech.hardware") }}
          </p>

          <!-- Датчик -->
          <h3 class="text-xl font-bold mb-4">
            {{ $t("tech.sensorTitle") }}
          </h3>
          <dl class="space-y-0 mb-8">
            <div
              v-for="spec in sensorSpecs"
              :key="spec.label"
              class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0"
            >
              <dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50">
                {{ spec.label }}
              </dt>
              <dd class="text-sm flex-1">
                {{ spec.value }}
              </dd>
            </div>
          </dl>

          <!-- Хаб -->
          <h3 class="text-xl font-bold mb-4">
            {{ $t("tech.hubTitle") }}
          </h3>
          <dl class="space-y-0">
            <div
              v-for="spec in hubSpecs"
              :key="spec.label"
              class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0"
            >
              <dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50">
                {{ spec.label }}
              </dt>
              <dd class="text-sm flex-1">
                {{ spec.value }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Программная часть -->
        <div>
          <p class="text-electric-blue font-semibold text-sm mb-4">
            {{ $t("tech.software") }}
          </p>
          <h3 class="text-2xl font-bold mb-6">
            {{ $t("tech.cloudTitle") }}
          </h3>
          <dl class="space-y-0">
            <div
              v-for="spec in softwareSpecs"
              :key="spec.label"
              class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0"
            >
              <dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50">
                {{ spec.label }}
              </dt>
              <dd class="text-sm flex-1">
                {{ spec.value }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>

  <AISection />

  <LeadFormSection />
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { useRoadmap } from "@/composables/useRoadmap";
import { currentLocale } from "@/i18n";
import { route } from "@/constants/routes";
import AISection from "@/components/AISection.vue";
import ArchitectureSection from "@/components/ArchitectureSection.vue";
import SegmentsSection from "@/components/SegmentsSection.vue";
import ShipHeading from "@/components/ShipHeading.vue";
import LandingCtaButton from "@/components/LandingCtaButton.vue";
import LeadFormSection from "@/components/LeadFormSection.vue";

const { t } = useI18n();

const isRuLocale = computed(() => currentLocale() === "ru");

const {
  roadmapItems,
  isLoading: roadmapLoading,
  error: roadmapError,
  fetchRoadmap,
} = useRoadmap();

// Аппаратные спецификации – датчик
const sensorSpecs = computed(() => [
  { label: t("tech.sensorChipLabel"), value: t("tech.sensorChipValue") },
  { label: t("tech.sensorRadioLabel"), value: t("tech.sensorRadioValue") },
  { label: t("tech.sensorProbesLabel"), value: t("tech.sensorProbesValue") },
  { label: t("tech.sensorPowerLabel"), value: t("tech.sensorPowerValue") },
  { label: t("tech.sensorCaseLabel"), value: t("tech.sensorCaseValue") },
]);

// Аппаратные спецификации – хаб (холодильный контроллер)
const hubSpecs = computed(() => [
  { label: t("tech.hubTypeLabel"), value: t("tech.hubTypeValue") },
  { label: t("tech.hubCoreLabel"), value: t("tech.hubCoreValue") },
  { label: t("tech.hubCommsLabel"), value: t("tech.hubCommsValue") },
  { label: t("tech.hubPowerLabel"), value: t("tech.hubPowerValue") },
  { label: t("tech.hubCaseLabel"), value: t("tech.hubCaseValue") },
]);

// Программные спецификации
const softwareSpecs = computed(() => [
  { label: t("tech.cloudVizLabel"), value: t("tech.cloudVizValue") },
  { label: t("tech.cloudAlertsLabel"), value: t("tech.cloudAlertsValue") },
  { label: t("tech.cloudReportsLabel"), value: t("tech.cloudReportsValue") },
  { label: t("tech.cloudGroupsLabel"), value: t("tech.cloudGroupsValue") },
  { label: t("tech.cloudAccessLabel"), value: t("tech.cloudAccessValue") },
  { label: t("tech.cloudStackLabel"), value: t("tech.cloudStackValue") },
]);

const scrollToForm = () => {
  const el = document.getElementById("lead-form");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

onMounted(() => {
  fetchRoadmap();
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
