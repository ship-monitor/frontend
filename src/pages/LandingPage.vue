<template>
  <div class="bg-cotton text-moonless-night">
    <!-- ====== Хедер с логотипом ====== -->
    <header>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-3 sm:py-4">
          <!-- Логотип -->
          <div class="flex items-center">
            <div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0">
              <img
                :src="BIG_LOGO"
                alt="ШиП-монитор"
                class="w-full h-full object-contain"
              />
            </div>
          </div>

          <!-- Десктоп-меню -->
          <nav class="hidden md:flex gap-10">
            <router-link
              v-for="link in NAV_LINKS"
              :key="link.to"
              :to="link.to"
              class="hover:text-electric-blue text-center transition-all duration-300 text-lg"
            >
              {{ link.label }}
            </router-link>
          </nav>

          <!-- Бургер (мобильное) -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 -mr-2 text-moonless-night"
            aria-label="Меню"
          >
            <svg v-if="!mobileMenuOpen" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Мобильное меню -->
      <Transition name="mobile-menu">
        <nav v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-moonless-night/10">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            <router-link
              v-for="link in NAV_LINKS"
              :key="link.to"
              :to="link.to"
              @click="mobileMenuOpen = false"
              class="block px-4 py-3 rounded-xl text-lg hover:bg-cotton hover:text-electric-blue transition-colors"
            >
              {{ link.label }}
            </router-link>
          </div>
        </nav>
      </Transition>
    </header>

    <!-- ====== Hero Section ====== -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div class="">
          <hgroup class="flex flex-col gap-5">
            <div class="text-xl">
              Важные показатели под постоянным контролем
            </div>
            <h1 class="text-9xl font-extrabold font-accent uppercase">
              ШИП-монитор
            </h1>
          </hgroup>

          <div
            class="mt-40 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 justify-center"
          >
            <router-link
              :to="isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER"
              class="text-xl items-center bg-electric-blue text-cotton rounded-full px-5 py-3 hover:bg-electric-blue/90"
            >
              {{ isAuthenticated ? 'Открыть дашборд' : 'Подключить мониторинг' }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== Дорожная карта ====== -->
    <section class="py-16 sm:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-baseline gap-4 mb-10">
          <h2 class="text-4xl sm:text-5xl font-bold uppercase">Дорожная карта</h2>
          <span class="text-moonless-night/40 text-sm hidden sm:inline">что сделано и что в работе</span>
        </div>

        <div class="border-t border-moonless-night/10">
          <div v-for="item in roadmapItems" :key="item.id" class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-8 py-6 border-b border-moonless-night/10">
            <span class="text-electric-blue text-sm font-semibold pt-1">{{ item.stage_date }}</span>
            <div>
              <h3 class="text-lg font-bold mb-1">{{ item.stage_name }}</h3>
              <p class="text-moonless-night/60 text-sm leading-relaxed">{{ item.stage_description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== Технологии ====== -->
    <section class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-baseline gap-4 mb-12">
          <h2 class="text-4xl sm:text-5xl font-bold uppercase">Железо и софт</h2>
        </div>
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p class="text-electric-blue font-semibold text-sm mb-4">Аппаратная часть</p>
            <h3 class="text-2xl font-bold mb-6">Контроллер «ШиП-01»</h3>
            <dl class="space-y-0">
              <div v-for="spec in hardwareSpecs" :key="spec.label" class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0">
                <dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50">{{ spec.label }}</dt>
                <dd class="text-sm flex-1">{{ spec.value }}</dd>
              </div>
            </dl>
          </div>
          <div>
            <p class="text-electric-blue font-semibold text-sm mb-4">Программная часть</p>
            <h3 class="text-2xl font-bold mb-6">Облачный сервис</h3>
            <dl class="space-y-0">
              <div v-for="spec in softwareSpecs" :key="spec.label" class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0">
                <dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50">{{ spec.label }}</dt>
                <dd class="text-sm flex-1">{{ spec.value }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <a-i-section />

    <!-- ====== Форма заявки ====== -->
    <section id="lead-form" class="py-16 sm:py-24 bg-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-baseline gap-4 mb-10">
          <h2 class="text-4xl sm:text-5xl font-bold uppercase">Заявка</h2>
          <span class="text-moonless-night/40 text-sm hidden sm:inline">ответим в течение дня</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label for="person_name" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Имя *</label>
              <input id="person_name" v-model="leadForm.person_name" type="text" placeholder="Иван"
                :class="leadInputClass('person_name')" :disabled="formStatus === 'loading'" />
              <p v-if="formErrors.person_name" class="mt-1 text-xs text-red-500">{{ formErrors.person_name }}</p>
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Телефон</label>
              <input id="phone" v-model="leadForm.phone" type="tel" placeholder="+7 (999) 000-00-00"
                :class="leadInputClass('phone')" :disabled="formStatus === 'loading'" />
              <p v-if="formErrors.phone" class="mt-1 text-xs text-red-500">{{ formErrors.phone }}</p>
            </div>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Email *</label>
            <input id="email" v-model="leadForm.email" type="email" placeholder="you@company.ru"
              :class="leadInputClass('email')" :disabled="formStatus === 'loading'" />
            <p v-if="formErrors.email" class="mt-1 text-xs text-red-500">{{ formErrors.email }}</p>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label for="company_name" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Компания *</label>
              <input id="company_name" v-model="leadForm.company_name" type="text" placeholder="ООО Пример"
                :class="leadInputClass('company_name')" :disabled="formStatus === 'loading'" />
              <p v-if="formErrors.company_name" class="mt-1 text-xs text-red-500">{{ formErrors.company_name }}</p>
            </div>
            <div>
              <label for="refrigerators_count" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Камер *</label>
              <input id="refrigerators_count" v-model.number="leadForm.refrigerators_count" type="number" min="1" placeholder="1"
                :class="leadInputClass('refrigerators_count')" :disabled="formStatus === 'loading'" />
              <p v-if="formErrors.refrigerators_count" class="mt-1 text-xs text-red-500">{{ formErrors.refrigerators_count }}</p>
            </div>
          </div>
          <div>
            <label for="comment" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Комментарий</label>
            <textarea id="comment" v-model="leadForm.comment" rows="3" placeholder="Вопросы, пожелания…"
              :class="[leadInputClass('comment'), 'resize-none']" :disabled="formStatus === 'loading'"></textarea>
          </div>
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" v-model="leadForm.personal_data_agreement"
              class="mt-0.5 w-4 h-4 rounded border-moonless-night/30 text-electric-blue focus:ring-electric-blue focus:ring-offset-0"
              :disabled="formStatus === 'loading'" />
            <span class="text-sm text-moonless-night/60">Согласен на обработку персональных данных *</span>
          </label>
          <p v-if="formErrors.personal_data_agreement" class="text-xs text-red-500">{{ formErrors.personal_data_agreement }}</p>

          <div v-if="formStatus === 'success'" class="p-4 rounded-2xl bg-electric-blue/10 text-electric-blue text-sm border border-electric-blue/20">
            Заявка отправлена. Мы свяжемся с вами в ближайшее время.
          </div>

          <button type="submit" :disabled="formStatus === 'loading'"
            class="px-8 py-3.5 bg-electric-blue text-cotton rounded-full font-semibold hover:bg-electric-blue/90 disabled:opacity-50 disabled:pointer-events-none transition-colors">
            <span v-if="formStatus === 'loading'" class="flex items-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Отправляем…
            </span>
            <span v-else>Отправить заявку</span>
          </button>
        </form>
      </div>
    </section>

    <!-- ====== Footer ====== -->
    <footer class="bg-moonless-night text-cotton/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0">
            <img :src="BIG_LOGO_D" alt="ШиП-монитор" class="w-full h-full object-contain" />
          </div>
          <p class="text-xs sm:text-sm text-center">© {{ new Date().getFullYear() }} ШиП-монитор · Российское ПО</p>
          <a href="mailto:support@ship-monitor.ru" class="text-xs sm:text-sm text-electric-blue hover:text-electric-blue/80 transition-colors">support@ship-monitor.ru</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import BIG_LOGO_D from "@/assets/big-logo-dark.png";
import BIG_LOGO from "@/assets/big-logo.png";
import { ROUTES } from "@/constants/routes";
import { useRoadmap } from "@/composables/useRoadmap";
import { useLeads } from "@/composables/useLeads";
import { useAuthStore } from "@/stores/authStore";
import AISection from "@/components/AISection.vue";

const { roadmapItems, fetchRoadmap } = useRoadmap();
const { createLead } = useLeads();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const mobileMenuOpen = ref(false);

const NAV_LINKS = [
  { label: "Оборудование", to: "/#devices" },
  { label: "Тарифы", to: "/#pricing" },
  { label: "FAQ", to: "/#faq" },
];

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

const hardwareSpecs = [
  { label: "Ядро", value: "Orange Pi — промышленный контроллер" },
  { label: "Связь", value: "GSM-модуль для SMS. Работает без интернета" },
  { label: "Датчики", value: "Цифровые термодатчики, кабель до 5 м" },
  { label: "Питание", value: "5 В, до 5 Вт потребления" },
  { label: "Корпус", value: "Промышленный пластик, IP54" },
];

const softwareSpecs = [
  { label: "Графики", value: "Температура в реальном времени, история за любой период" },
  { label: "Уведомления", value: "Push в браузере + SMS через GSM (дублирование)" },
  { label: "Отчёты", value: "Автогенерация журналов для СЭС" },
  { label: "Доступ", value: "Мультипользовательский, роли: директор, менеджер" },
  { label: "Стек", value: "Vue 3, TypeScript, Node.js, PostgreSQL" },
];

const leadInputClass = (field: string) => [
  "w-full px-4 py-3 rounded-2xl border bg-cotton outline-none transition-colors focus:border-electric-blue",
  formErrors.value[field] ? "border-red-400" : "border-moonless-night/15",
  formStatus.value === "loading" ? "opacity-50 cursor-not-allowed" : "",
];

const validateForm = (): boolean => {
  const errors: Record<string, string> = {};

  if (!leadForm.person_name.trim()) {
    errors.person_name = "Введите имя";
  }

  if (!leadForm.email.trim()) {
    errors.email = "Введите email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadForm.email)) {
    errors.email = "Некорректный email";
  }

  if (!leadForm.company_name.trim()) {
    errors.company_name = "Введите название компании";
  }

  if (leadForm.refrigerators_count < 1) {
    errors.refrigerators_count = "Количество должно быть минимум 1";
  }

  if (!leadForm.personal_data_agreement) {
    errors.personal_data_agreement = "Требуется согласие на обработку данных";
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }

  formStatus.value = "loading";

  const success = await createLead({
    person_name: leadForm.person_name.trim(),
    email: leadForm.email.trim(),
    phone: leadForm.phone.trim(),
    company_name: leadForm.company_name.trim(),
    refrigerators_count: leadForm.refrigerators_count,
    comment: leadForm.comment.trim(),
    personal_data_agreement: leadForm.personal_data_agreement,
  });

  if (success) {
    formStatus.value = "success";
    setTimeout(() => {
      leadForm.person_name = "";
      leadForm.email = "";
      leadForm.phone = "";
      leadForm.company_name = "";
      leadForm.refrigerators_count = 1;
      leadForm.comment = "";
      leadForm.personal_data_agreement = false;
      formStatus.value = "idle";
    }, 3000);
  } else {
    formStatus.value = "error";
  }
};

onMounted(() => {
  fetchRoadmap();
});
</script>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.2s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

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
