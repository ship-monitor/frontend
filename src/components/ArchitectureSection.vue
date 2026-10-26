<template>
  <section
    id="architecture"
    class="py-16 sm:py-24"
  >
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ShipHeading
        :heading="$t('arch.heading')"
        :heading-alt="$t('arch.headingAlt')"
        :description="$t('arch.description')"
      />

      <ol class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="relative rounded-[26px] border border-moonless-night/10 bg-cotton p-6 sm:p-7"
        >
          <span
            class="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-electric-blue text-sm font-bold text-cotton"
          >
            {{ index + 1 }}
          </span>
          <h3 class="text-xl font-bold">
            {{ step.title }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-moonless-night/50">
            {{ step.text }}
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import ShipHeading from "@/components/ShipHeading.vue";

const { t } = useI18n();

const steps = computed(() => [
  { title: t("arch.step1Title"), text: t("arch.step1Text") },
  { title: t("arch.step2Title"), text: t("arch.step2Text") },
  { title: t("arch.step3Title"), text: t("arch.step3Text") },
  { title: t("arch.step4Title"), text: t("arch.step4Text") },
]);
</script>
