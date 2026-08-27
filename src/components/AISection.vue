<template>
  <!-- Каталог устройств -->
  <section id="devices" class="py-20 md:py-28 lg:py-32 bg-white">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ShipHeading headingAlt="Оборудование" heading="Устройства"
        description="Промышленные датчики температуры и холодильные контроллеры передают показания в облачную систему и продолжают контролировать объект даже при нестабильном подключении" />

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <!-- Устройство 1: Датчик T1 -->
        <article class="bg-cotton overflow-hidden rounded-[26px] border border-moonless-night/10">
          <div
            class="grid min-h-[310px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(52,120,212,0.14),transparent_58%)]">
            <div
              class="relative h-[145px] w-[110px] rotate-[-5deg] rounded-3xl border-[7px] border-[#252525] bg-white px-4 py-6 shadow-2xl">
              <span class="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-electric-blue"></span>
              <div class="mt-9 grid h-14 place-items-center rounded-lg bg-[#1e2633] font-mono text-lg text-[#9ec5ff]">
                +4.2°
              </div>
              <span class="absolute bottom-5 left-5 font-extrabold">ШиП</span>
            </div>
          </div>
          <div class="p-6 sm:p-8">
            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-electric-blue">
              Промышленный датчик температуры
            </p>
            <h3 class="text-3xl font-bold">ШиП T1</h3>
            <p class="mt-4 leading-7 text-moonless-night/50">
              Компактный датчик температуры для холодильных камер, складов, аптек и производственных помещений. Работает
              в диапазоне −40…+85 °C.
            </p>
            <dl class="mt-7 grid grid-cols-3 gap-3">
              <div>
                <dt class="mb-1 text-xs text-moonless-night/50">Диапазон</dt>
                <dd class="text-sm font-semibold">−40…+85 °C</dd>
              </div>
              <div>
                <dt class="mb-1 text-xs text-moonless-night/50">Связь</dt>
                <dd class="text-sm font-semibold">Радио</dd>
              </div>
              <div>
                <dt class="mb-1 text-xs text-moonless-night/50">Питание</dt>
                <dd class="text-sm font-semibold">Аккум.</dd>
              </div>
            </dl>
            <div class="mt-8 flex items-center justify-between border-t border-moonless-night/10 pt-6">
              <strong class="text-xl">от 10 000 ₽</strong>
              <a href="#lead-form" class="group inline-flex items-center gap-2 font-semibold text-electric-blue">
                Запросить<span class="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </article>

        <!-- Устройство 2: Хаб (промышленный холодильный контроллер) -->
        <article class="bg-cotton overflow-hidden rounded-[26px] border border-moonless-night/10">
          <div
            class="grid min-h-[310px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(52,120,212,0.14),transparent_58%)]">
            <div
              class="relative h-[160px] w-[210px] rotate-3 rounded-3xl border-[7px] border-[#252525] bg-white px-4 py-6 shadow-2xl">
              <span class="absolute -top-12 right-6 h-12 w-2 rounded-t-full bg-[#252525]"></span>
              <span class="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-electric-blue"></span>
              <div class="mt-8 grid h-12 place-items-center rounded-lg bg-[#1e2633] font-mono text-sm text-[#9ec5ff]">
                ONLINE
              </div>
              <span class="absolute bottom-4 left-5 font-extrabold">ШиП</span>
            </div>
          </div>
          <div class="p-6 sm:p-8">
            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-electric-blue">
              Промышленный холодильный контроллер
            </p>
            <h3 class="text-3xl font-bold">ШиП Hub</h3>
            <p class="mt-4 leading-7 text-moonless-night/50">
              Контроллер для холодильного оборудования: сбор данных с датчиков температуры, управление уведомлениями,
              GSM-резерв. Поддерживает до 32 датчиков.
            </p>
            <dl class="mt-7 grid grid-cols-3 gap-3">
              <div>
                <dt class="mb-1 text-xs text-moonless-night/50">Каналы</dt>
                <dd class="text-sm font-semibold">Wi-Fi + GSM</dd>
              </div>
              <div>
                <dt class="mb-1 text-xs text-moonless-night/50">Датчики</dt>
                <dd class="text-sm font-semibold">До 32</dd>
              </div>
              <div>
                <dt class="mb-1 text-xs text-moonless-night/50">Резерв</dt>
                <dd class="text-sm font-semibold">До 8 часов</dd>
              </div>
            </dl>
            <div class="mt-8 flex items-center justify-between border-t border-moonless-night/10 pt-6">
              <strong class="text-xl">от 15 000 ₽</strong>
              <a href="#lead-form" class="group inline-flex items-center gap-2 font-semibold text-electric-blue">
                Запросить<span class="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Тарифы -->
  <section id="pricing" class="py-20 md:py-28 lg:py-32">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ShipHeading heading="Тарифы" headingAlt="прозрачные условия"
        description="Начните с базового мониторинга и расширяйте систему по мере роста" />

      <div class="grid gap-5 md:grid-cols-2 max-w-4xl mx-auto">
        <!-- Стандартный -->
        <article
          class="flex min-h-[570px] flex-col justify-between rounded-[26px] border border-moonless-night/10 bg-white/40 p-7 sm:p-9">
          <div>
            <p class="mb-3 text-sm text-moonless-night/50">Для малого и среднего бизнеса</p>
            <h3 class="text-3xl font-bold">Стандартный</h3>
            <div class="my-8 min-h-[70px]">
              <span class="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">1 500 ₽</span>
              <span class="text-moonless-night/50">/ месяц</span>
            </div>
            <ul class="space-y-4">
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                До 15 подключённых устройств
              </li>
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                Хранение истории за 12 месяцев
              </li>
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                Уведомления Push + SMS
              </li>
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                До 5 объектов мониторинга
              </li>
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                Экспорт отчётов для СЭС
              </li>
            </ul>
          </div>
          <a href="#lead-form"
            class="mt-10 inline-flex min-h-13 items-center justify-center rounded-full border border-moonless-night/15 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-moonless-night">
            Подключить
          </a>
        </article>

        <!-- Корпоративный -->
        <article
          class="flex min-h-[570px] flex-col justify-between rounded-[26px] border border-moonless-night/10 bg-white/40 p-7 sm:p-9">
          <div>
            <p class="mb-3 text-sm text-moonless-night/50">Для распределённых систем</p>
            <h3 class="text-3xl font-bold">Корпоративный</h3>
            <div class="my-8 min-h-[70px]">
              <span class="text-4xl font-bold tracking-[-0.04em]">По запросу</span>
            </div>
            <ul class="space-y-4">
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                Неограниченное количество объектов
              </li>
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                Персональные роли и права доступа
              </li>
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                Интеграция через API
              </li>
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                Настраиваемый срок хранения данных
              </li>
              <li
                class="relative pl-7 leading-6 before:absolute before:left-0 before:font-bold before:text-electric-blue before:content-['✓']">
                Индивидуальная поддержка
              </li>
            </ul>
          </div>
          <a href="#lead-form"
            class="mt-10 inline-flex min-h-13 items-center justify-center rounded-full border border-moonless-night/15 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-moonless-night">
            Обсудить проект
          </a>
        </article>
      </div>
      <p class="mt-6 text-center text-sm text-moonless-night/50">
        Стоимость оборудования рассчитывается отдельно.
      </p>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="py-20 md:py-28 lg:py-32">
    <div class="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[0.65fr_1fr] lg:gap-20 lg:px-8">
      <header class="max-w-md md:sticky md:top-10 md:self-start">
        <p class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-electric-blue">Частые вопросы</p>
        <h2 class="text-5xl font-bold leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl">FAQ</h2>
        <p class="mt-5 text-base leading-7 text-moonless-night/50 md:text-lg">
          Основное о подключении, уведомлениях и работе холодильных контроллеров.
        </p>
        <a href="#lead-form" class="group mt-7 inline-flex items-center gap-2 font-semibold text-electric-blue">
          Задать свой вопрос<span class="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </header>

      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
      </div>

      <div v-else-if="error" class="py-12 text-center text-red-500">
        {{ error }}
      </div>

      <div v-else class="border-t border-moonless-night/10">
        <details v-for="(item, index) in faqItems" :key="item.id" class="group border-b border-moonless-night/10"
          :open="index === 0">
          <summary
            class="relative flex min-h-24 cursor-pointer list-none items-center pr-14 text-lg font-semibold marker:hidden sm:text-xl">
            {{ item.title }}
            <span
              class="absolute right-1 h-8 w-8 rounded-full border border-moonless-night/15 before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-moonless-night after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-moonless-night after:transition-transform group-open:after:rotate-90"></span>
          </summary>
          <div class="max-w-2xl pb-7 pr-4 leading-7 text-moonless-night/50">
            {{ item.answer }}
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ShipHeading from "@/components/ShipHeading.vue";
import { useFaq } from "@/composables/useFaq";

const { faqItems, isLoading, error, fetchFaq } = useFaq();

onMounted(() => {
  fetchFaq();
});
</script>