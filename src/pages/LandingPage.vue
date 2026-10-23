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
    </div>
  </section>

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

  <!-- ====== Форма заявки ====== -->
  <section
    id="lead-form"
    class="py-16 sm:py-24 bg-white"
  >
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-baseline gap-4 mb-10">
        <h2
          class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl"
        >
          {{ $t("form.heading") }}
        </h2>
        <span class="text-moonless-night/40 text-sm hidden sm:inline">
          {{ $t("form.note") }}
        </span>
      </div>

      <form
        class="space-y-4"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              for="person_name"
              class="block text-sm font-medium text-moonless-night/60 mb-1.5"
            >{{ $t("form.nameLabel") }} *</label>
            <input
              id="person_name"
              v-model="leadForm.person_name"
              type="text"
              :placeholder="$t('form.namePlaceholder')"
              required
              autocomplete="name"
              :class="leadInputClass('person_name')"
              :disabled="formStatus === 'loading'"
              :aria-invalid="formErrors.person_name ? 'true' : undefined"
              :aria-describedby="formErrors.person_name ? 'person_name-error' : undefined"
            >
            <p
              v-if="formErrors.person_name"
              id="person_name-error"
              class="mt-1 text-xs text-red-500"
            >
              {{ formErrors.person_name }}
            </p>
          </div>
          <div>
            <label
              for="phone"
              class="block text-sm font-medium text-moonless-night/60 mb-1.5"
            >{{ $t("form.phoneLabel") }}</label>
            <input
              id="phone"
              v-model="leadForm.phone"
              type="tel"
              placeholder="+7 (999) 000-00-00"
              autocomplete="tel"
              :class="leadInputClass('phone')"
              :disabled="formStatus === 'loading'"
              :aria-invalid="formErrors.phone ? 'true' : undefined"
              :aria-describedby="formErrors.phone ? 'phone-error' : undefined"
            >
            <p
              v-if="formErrors.phone"
              id="phone-error"
              class="mt-1 text-xs text-red-500"
            >
              {{ formErrors.phone }}
            </p>
          </div>
        </div>
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-moonless-night/60 mb-1.5"
          >{{ $t("form.emailLabel") }} *</label>
          <input
            id="email"
            v-model="leadForm.email"
            type="email"
            placeholder="you@company.ru"
            required
            autocomplete="email"
            :class="leadInputClass('email')"
            :disabled="formStatus === 'loading'"
            :aria-invalid="formErrors.email ? 'true' : undefined"
            :aria-describedby="formErrors.email ? 'email-error' : undefined"
          >
          <p
            v-if="formErrors.email"
            id="email-error"
            class="mt-1 text-xs text-red-500"
          >
            {{ formErrors.email }}
          </p>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              for="company_name"
              class="block text-sm font-medium text-moonless-night/60 mb-1.5"
            >{{ $t("form.companyLabel") }} *</label>
            <input
              id="company_name"
              v-model="leadForm.company_name"
              type="text"
              :placeholder="$t('form.companyPlaceholder')"
              required
              autocomplete="organization"
              :class="leadInputClass('company_name')"
              :disabled="formStatus === 'loading'"
              :aria-invalid="formErrors.company_name ? 'true' : undefined"
              :aria-describedby="formErrors.company_name ? 'company_name-error' : undefined"
            >
            <p
              v-if="formErrors.company_name"
              id="company_name-error"
              class="mt-1 text-xs text-red-500"
            >
              {{ formErrors.company_name }}
            </p>
          </div>
          <div>
            <label
              for="refrigerators_count"
              class="block text-sm font-medium text-moonless-night/60 mb-1.5"
            >{{ $t("form.chambersLabel") }} *</label>
            <input
              id="refrigerators_count"
              v-model.number="leadForm.refrigerators_count"
              type="number"
              min="1"
              placeholder="1"
              required
              :class="leadInputClass('refrigerators_count')"
              :disabled="formStatus === 'loading'"
              :aria-invalid="formErrors.refrigerators_count ? 'true' : undefined"
              :aria-describedby="formErrors.refrigerators_count ? 'refrigerators_count-error' : undefined"
            >
            <p
              v-if="formErrors.refrigerators_count"
              id="refrigerators_count-error"
              class="mt-1 text-xs text-red-500"
            >
              {{ formErrors.refrigerators_count }}
            </p>
          </div>
        </div>
        <div>
          <label
            for="comment"
            class="block text-sm font-medium text-moonless-night/60 mb-1.5"
          >{{ $t("form.commentLabel") }}</label>
          <textarea
            id="comment"
            v-model="leadForm.comment"
            rows="3"
            :placeholder="$t('form.commentPlaceholder')"
            :class="[leadInputClass('comment'), 'resize-none']"
            :disabled="formStatus === 'loading'"
          />
        </div>
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="leadForm.personal_data_agreement"
            type="checkbox"
            class="mt-0.5 w-4 h-4 rounded border-moonless-night/30 text-electric-blue focus:ring-electric-blue focus:ring-offset-0"
            :disabled="formStatus === 'loading'"
          >
          <span class="text-sm text-moonless-night/60">
            {{ $t("form.agreement") }} *
          </span>
        </label>
        <p
          v-if="formErrors.personal_data_agreement"
          class="text-xs text-red-500"
        >
          {{ formErrors.personal_data_agreement }}
        </p>

        <div
          v-if="formStatus === 'success'"
          role="status"
          class="p-4 rounded-2xl bg-electric-blue/10 text-electric-blue text-sm border border-electric-blue/20"
        >
          {{ $t("form.success") }}
        </div>

        <div
          v-else-if="formStatus === 'error'"
          role="alert"
          class="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200"
        >
          {{ formError }}
        </div>

        <LandingCtaButton
          type="submit"
          :disabled="formStatus === 'loading' || formStatus === 'success'"
        >
          <span
            v-if="formStatus === 'loading'"
            class="flex items-center gap-2"
          >
            <svg
              class="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ $t("form.sending") }}
          </span>
          <span v-else>{{ $t("form.submit") }}</span>
        </LandingCtaButton>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useRoadmap } from "@/composables/useRoadmap";
import { useLeads } from "@/composables/useLeads";
import { isValidEmail } from "@/utils/validators";
import AISection from "@/components/AISection.vue";
import ShipHeading from "@/components/ShipHeading.vue";
import LandingCtaButton from "@/components/LandingCtaButton.vue";

const { t } = useI18n();

const {
  roadmapItems,
  isLoading: roadmapLoading,
  error: roadmapError,
  fetchRoadmap,
} = useRoadmap();
const { createLead } = useLeads();

const leadForm = reactive({
  person_name: "",
  email: "",
  company_name: "",
  refrigerators_count: 1,
  phone: "",
  comment: "",
  personal_data_agreement: false,
});

const formStatus = ref<"idle" | "loading" | "success" | "error">("idle");
const formErrors = ref<Record<string, string>>({});
const formError = ref("");
let resetTimer: ReturnType<typeof setTimeout> | null = null;

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

const leadInputClass = (field: string) => [
  "w-full px-4 py-3 rounded-2xl border bg-cotton outline-none transition-colors focus:border-electric-blue",
  formErrors.value[field] ? "border-red-400" : "border-moonless-night/15",
  formStatus.value === "loading" ? "opacity-50 cursor-not-allowed" : "",
];

const validateForm = (): boolean => {
  const errors: Record<string, string> = {};

  if (!leadForm.person_name.trim()) {
    errors.person_name = t("form.errorName");
  }
  if (!leadForm.email.trim()) {
    errors.email = t("form.errorEmail");
  } else if (!isValidEmail(leadForm.email)) {
    errors.email = t("form.errorEmailInvalid");
  }
  if (!leadForm.company_name.trim()) {
    errors.company_name = t("form.errorCompany");
  }
  if (leadForm.refrigerators_count < 1) {
    errors.refrigerators_count = t("form.errorCount");
  }
  if (!leadForm.personal_data_agreement) {
    errors.personal_data_agreement = t("form.errorAgreement");
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return;
  if (formStatus.value === "loading" || formStatus.value === "success") return;
  if (resetTimer) {
    clearTimeout(resetTimer);
    resetTimer = null;
  }

  formStatus.value = "loading";

  const failure = await createLead({
    person_name: leadForm.person_name.trim(),
    email: leadForm.email.trim(),
    phone: leadForm.phone.trim(),
    company_name: leadForm.company_name.trim(),
    refrigerators_count: leadForm.refrigerators_count,
    comment: leadForm.comment.trim(),
    personal_data_agreement: leadForm.personal_data_agreement,
  });

  if (failure === null) {
    formStatus.value = "success";
    resetTimer = setTimeout(() => {
      Object.assign(leadForm, {
        person_name: "",
        email: "",
        phone: "",
        company_name: "",
        refrigerators_count: 1,
        comment: "",
        personal_data_agreement: false,
      });
      formStatus.value = "idle";
      resetTimer = null;
    }, 3000);
  } else {
    formError.value = failure;
    formStatus.value = "error";
  }
};

const scrollToForm = () => {
  const el = document.getElementById("lead-form");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

onMounted(() => {
  fetchRoadmap();
});

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer);
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
