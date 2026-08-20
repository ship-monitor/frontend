<template>
  <!-- ====== Hero Section ====== -->
  <section ref="heroSection" class="relative overflow-hidden flex items-center">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <hgroup class="flex flex-col gap-5">
        <div class="text-xl">Температура холодильного оборудования под контролем 24/7</div>
        <h1 class="text-4xl sm:text-7xl  md:text-9xl  font-extrabold font-accent uppercase">
          ШИП-монитор
        </h1>
        <p class="mt-6 max-w-2xl text-lg text-moonless-night/70">
          Промышленный холодильный контроллер и датчики температуры для автоматического контроля на пищевых
          производствах, складах, в аптеках и торговых сетях.
        </p>
      </hgroup>

      <div class="mt-40 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 justify-center">
        <button @click="scrollToForm"
          class="text-xl items-center bg-electric-blue text-cotton rounded-full px-5 py-3 hover:bg-electric-blue/90">
          Подключить мониторинг
        </button>
      </div>
    </div>
  </section>

  <!-- ====== Дорожная карта ====== -->
  <section class="py-16 sm:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ShipHeading heading="Дорожная карта" headingAlt="что сделано и что в работе" description="" />

      <div class="border-t border-moonless-night/10">
        <div v-for="item in roadmapItems" :key="item.id"
          class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-8 py-6 border-b border-moonless-night/10">
          <span class="text-electric-blue text-sm font-semibold pt-1">
            {{ item.stage_date }}
          </span>
          <div>
            <h3 class="text-lg font-bold mb-1">{{ item.stage_name }}</h3>
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
        <h2 class="text-4xl sm:text-5xl font-bold uppercase">Железо и софт</h2>
      </div>
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20">
        <!-- Аппаратная часть -->
        <div>
          <p class="text-electric-blue font-semibold text-sm mb-4">
            Аппаратная часть
          </p>

          <!-- Датчик -->
          <h3 class="text-xl font-bold mb-4">Промышленный датчик температуры</h3>
          <dl class="space-y-0 mb-8">
            <div v-for="spec in sensorSpecs" :key="spec.label"
              class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0">
              <dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50">
                {{ spec.label }}
              </dt>
              <dd class="text-sm flex-1">{{ spec.value }}</dd>
            </div>
          </dl>

          <!-- Хаб -->
          <h3 class="text-xl font-bold mb-4">Промышленный холодильный контроллер (Шлюз)</h3>
          <dl class="space-y-0">
            <div v-for="spec in hubSpecs" :key="spec.label"
              class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0">
              <dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50">
                {{ spec.label }}
              </dt>
              <dd class="text-sm flex-1">{{ spec.value }}</dd>
            </div>
          </dl>
        </div>

        <!-- Программная часть -->
        <div>
          <p class="text-electric-blue font-semibold text-sm mb-4">
            Программная часть
          </p>
          <h3 class="text-2xl font-bold mb-6">Облачный сервис мониторинга</h3>
          <dl class="space-y-0">
            <div v-for="spec in softwareSpecs" :key="spec.label"
              class="flex gap-4 sm:gap-6 py-3 border-t border-moonless-night/10 first:border-t-0">
              <dt class="w-28 sm:w-32 shrink-0 text-sm text-moonless-night/50">
                {{ spec.label }}
              </dt>
              <dd class="text-sm flex-1">{{ spec.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>

  <AISection />

  <!-- ====== Форма заявки ====== -->
  <section id="lead-form" class="py-16 sm:py-24 bg-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-baseline gap-4 mb-10">
        <h2 class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl">
          Заявка
        </h2>
        <span class="text-moonless-night/40 text-sm hidden sm:inline">
          ответим в течение дня
        </span>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label for="person_name" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Имя *</label>
            <input id="person_name" v-model="leadForm.person_name" type="text" placeholder="Иван"
              :class="leadInputClass('person_name')" :disabled="formStatus === 'loading'" />
            <p v-if="formErrors.person_name" class="mt-1 text-xs text-red-500">
              {{ formErrors.person_name }}
            </p>
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Телефон</label>
            <input id="phone" v-model="leadForm.phone" type="tel" placeholder="+7 (999) 000-00-00"
              :class="leadInputClass('phone')" :disabled="formStatus === 'loading'" />
            <p v-if="formErrors.phone" class="mt-1 text-xs text-red-500">
              {{ formErrors.phone }}
            </p>
          </div>
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Email *</label>
          <input id="email" v-model="leadForm.email" type="email" placeholder="you@company.ru"
            :class="leadInputClass('email')" :disabled="formStatus === 'loading'" />
          <p v-if="formErrors.email" class="mt-1 text-xs text-red-500">
            {{ formErrors.email }}
          </p>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label for="company_name" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Компания *</label>
            <input id="company_name" v-model="leadForm.company_name" type="text" placeholder="ООО Пример"
              :class="leadInputClass('company_name')" :disabled="formStatus === 'loading'" />
            <p v-if="formErrors.company_name" class="mt-1 text-xs text-red-500">
              {{ formErrors.company_name }}
            </p>
          </div>
          <div>
            <label for="refrigerators_count" class="block text-sm font-medium text-moonless-night/60 mb-1.5">Камер
              *</label>
            <input id="refrigerators_count" v-model.number="leadForm.refrigerators_count" type="number" min="1"
              placeholder="1" :class="leadInputClass('refrigerators_count')" :disabled="formStatus === 'loading'" />
            <p v-if="formErrors.refrigerators_count" class="mt-1 text-xs text-red-500">
              {{ formErrors.refrigerators_count }}
            </p>
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
          <span class="text-sm text-moonless-night/60">
            Согласен на обработку персональных данных *
          </span>
        </label>
        <p v-if="formErrors.personal_data_agreement" class="text-xs text-red-500">
          {{ formErrors.personal_data_agreement }}
        </p>

        <div v-if="formStatus === 'success'"
          class="p-4 rounded-2xl bg-electric-blue/10 text-electric-blue text-sm border border-electric-blue/20">
          Заявка отправлена. Мы свяжемся с вами в ближайшее время.
        </div>

        <button type="submit" :disabled="formStatus === 'loading'"
          class="px-8 py-3.5 bg-electric-blue text-cotton rounded-full font-semibold hover:bg-electric-blue/90 disabled:opacity-50 disabled:pointer-events-none transition-colors">
          <span v-if="formStatus === 'loading'" class="flex items-center gap-2">
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Отправляем…
          </span>
          <span v-else>Отправить заявку</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, reactive, ref } from "vue";
import { useRoadmap } from "@/composables/useRoadmap";
import { useLeads } from "@/composables/useLeads";
import { useAuthStore } from "@/stores/authStore";
import AISection from "@/components/AISection.vue";
import ShipHeading from "@/components/ShipHeading.vue";

const { roadmapItems, fetchRoadmap } = useRoadmap();
const { createLead } = useLeads();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

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

// ====== Новая логика для высоты hero-секции ======
const heroSection = ref<HTMLElement | null>(null);
const headerHeight = ref(0);

const updateHeroHeight = () => {
  const header = document.querySelector('header');
  const headerH = header ? header.offsetHeight : 0;
  headerHeight.value = headerH;
  if (heroSection.value) {
    heroSection.value.style.minHeight = `calc(100vh - ${headerH}px)`;
  }
};

// Аппаратные спецификации – датчик
const sensorSpecs = [
  { label: "Чип", value: "Температурный модуль + микроконтроллер" },
  { label: "Радио", value: "Встроенный радиомодуль для связи с хабом" },
  { label: "Датчики", value: "Выносные цифровые термодатчики, кабель до 5 м" },
  { label: "Питание", value: "Аккумулятор + модуль зарядки, USB-C" },
  { label: "Корпус", value: "Промышленный пластик, IP54" },
];

// Аппаратные спецификации – хаб (холодильный контроллер)
const hubSpecs = [
  { label: "Тип", value: "Промышленный холодильный контроллер" },
  { label: "Ядро", value: "Промышленный микроконтроллер" },
  { label: "Связь", value: "GSM-модуль (SMS) + радиомодуль для датчиков" },
  { label: "Питание", value: "Аккумулятор с резервом до 8 ч, USB-C" },
  { label: "Корпус", value: "Промышленный пластик, IP54" },
];

// Программные спецификации
const softwareSpecs = [
  { label: "Визуализация", value: "Температура в реальном времени, графики, история" },
  { label: "Уведомления", value: "Push + SMS, настройка порогов для каждого датчика" },
  { label: "Отчёты", value: "Экспорт журналов для СЭС в один клик" },
  { label: "Группировка", value: "Объединение датчиков по объектам и зонам" },
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
  if (!validateForm()) return;

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
    }, 3000);
  } else {
    formStatus.value = "error";
  }
};

const scrollToForm = () => {
  const el = document.getElementById('lead-form');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

onMounted(() => {
  fetchRoadmap();
  updateHeroHeight();
  window.addEventListener('resize', updateHeroHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeroHeight);
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