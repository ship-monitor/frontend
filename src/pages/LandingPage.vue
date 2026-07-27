<template>
  <div class="bg-cotton text-moonless-night">
    <!-- ====== Хедер с логотипом ====== -->
    <header class="">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-3 sm:py-4">
          <!-- Логотип — только картинка, без текста -->
          <div class="flex items-center">
            <div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0">
              <img
                :src="BIG_LOGO"
                alt="ШиП-монитор"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
          <div class="flex gap-10">
            <router-link
              v-for="link in NAV_LINKS"
              :to="link.to"
              class="hover:text-electric-blue text-center transition-all duration-300 text-lg"
            >
              {{ link.label }}
            </router-link>
          </div>
        </div>
      </div>
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
              :to="ROUTES.REGISTER"
              class="text-xl items-center bg-electric-blue text-cotton rounded-full px-5 py-3 hover:bg-electric-blue/90"
            >
              Подключить мониторинг
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== План развития (Roadmap) ====== -->
    <section class="py-12 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10 sm:mb-16">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900">
            Дорожная карта
          </h2>
          <p class="mt-3 sm:mt-4 text-base sm:text-lg text-ink-600">
            Что уже реализовано и что пока в разработке
          </p>
        </div>

        <div class="relative">
          <div
            class="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-brand-200 via-brand-300 to-brand-200 hidden lg:block"
          ></div>

          <div class="space-y-8">
            <template v-for="item in roadmapItems" :key="item.id">
              <div
                class="relative flex flex-col lg:flex-row items-center gap-6 sm:gap-8"
              >
                <div class="flex-1 w-full lg:w-auto order-2 lg:order-1"></div>

                <div class="flex-1 w-full order-1 lg:order-2">
                  <div
                    class="bg-white rounded-2xl p-6 sm:p-8 border border-ink-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div class="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-brand-100 text-brand-700"
                      >
                        {{ item.stage_date }}
                      </span>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-ink-900 mb-2">
                      {{ item.stage_name }}
                    </h3>
                    <p
                      class="text-sm sm:text-base text-ink-600 leading-relaxed"
                    >
                      {{ item.stage_description }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== Форма лидов ====== -->
    <section class="py-12 sm:py-20 bg-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="bg-brand-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"
          ></div>

          <div class="relative z-10 text-center mb-10">
            <h2 class="text-3xl sm:text-4xl font-bold mb-4">Оставить заявку</h2>
            <p class="text-brand-100 text-lg">
              Оставьте заявку, и мы свяжемся с вами в ближайшее время
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  for="person_name"
                  class="block text-sm font-medium text-brand-200 mb-2"
                  >Имя *</label
                >
                <input
                  id="person_name"
                  v-model="leadForm.person_name"
                  type="text"
                  :class="[
                    'w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all',
                    formErrors.person_name
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-brand-400 bg-white/10 focus:ring-white/50 focus:border-white',
                    formStatus === 'loading'
                      ? 'opacity-50 cursor-not-allowed'
                      : '',
                  ]"
                  placeholder="Иван"
                  :disabled="formStatus === 'loading'"
                />
                <p
                  v-if="formErrors.person_name"
                  class="mt-1 text-sm text-red-200"
                >
                  {{ formErrors.person_name }}
                </p>
              </div>

              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-brand-200 mb-2"
                  >Телефон *</label
                >
                <input
                  id="phone"
                  v-model="leadForm.phone"
                  type="tel"
                  :class="[
                    'w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all',
                    formErrors.phone
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-brand-400 bg-white/10 focus:ring-white/50 focus:border-white',
                    formStatus === 'loading'
                      ? 'opacity-50 cursor-not-allowed'
                      : '',
                  ]"
                  placeholder="+7 (999) 000-00-00"
                  :disabled="formStatus === 'loading'"
                />
                <p v-if="formErrors.phone" class="mt-1 text-sm text-red-200">
                  {{ formErrors.phone }}
                </p>
              </div>

              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-brand-200 mb-2"
                  >Email *</label
                >
                <input
                  id="email"
                  v-model="leadForm.email"
                  type="email"
                  :class="[
                    'w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all',
                    formErrors.email
                      ? 'border-red-300 bg-red-50 focus:ring-red-200'
                      : 'border-brand-400 bg-white/10 focus:ring-white/50 focus:border-white',
                    formStatus === 'loading'
                      ? 'opacity-50 cursor-not-allowed'
                      : '',
                  ]"
                  placeholder="example@mail.com"
                  :disabled="formStatus === 'loading'"
                />
                <p v-if="formErrors.email" class="mt-1 text-sm text-red-200">
                  {{ formErrors.email }}
                </p>
              </div>
            </div>

            <div>
              <label
                for="company_name"
                class="block text-sm font-medium text-brand-200 mb-2"
                >Название компании *</label
              >
              <input
                id="company_name"
                v-model="leadForm.company_name"
                type="text"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all',
                  formErrors.company_name
                    ? 'border-red-300 bg-red-50 focus:ring-red-200'
                    : 'border-brand-400 bg-white/10 focus:ring-white/50 focus:border-white',
                  formStatus === 'loading'
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
                placeholder="ООО Пример"
                :disabled="formStatus === 'loading'"
              />
              <p
                v-if="formErrors.company_name"
                class="mt-1 text-sm text-red-200"
              >
                {{ formErrors.company_name }}
              </p>
            </div>

            <div>
              <label
                for="refrigerators_count"
                class="block text-sm font-medium text-brand-200 mb-2"
                >Количество холодильных камер *</label
              >
              <input
                id="refrigerators_count"
                v-model.number="leadForm.refrigerators_count"
                type="number"
                min="1"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all',
                  formErrors.refrigerators_count
                    ? 'border-red-300 bg-red-50 focus:ring-red-200'
                    : 'border-brand-400 bg-white/10 focus:ring-white/50 focus:border-white',
                  formStatus === 'loading'
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
                placeholder="1"
                :disabled="formStatus === 'loading'"
              />
              <p
                v-if="formErrors.refrigerators_count"
                class="mt-1 text-sm text-red-200"
              >
                {{ formErrors.refrigerators_count }}
              </p>
            </div>

            <div>
              <label
                for="comment"
                class="block text-sm font-medium text-brand-200 mb-2"
                >Комментарий</label
              >
              <textarea
                id="comment"
                v-model="leadForm.comment"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none',
                  'h-24',
                  formErrors.comment
                    ? 'border-red-300 bg-red-50 focus:ring-red-200'
                    : 'border-brand-400 bg-white/10 focus:ring-white/50 focus:border-white',
                  formStatus === 'loading'
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
                placeholder="Ваши пожелания или вопросы..."
                :disabled="formStatus === 'loading'"
              />
            </div>

            <div class="flex items-start gap-3">
              <div class="pt-0.5">
                <input
                  id="personal_data_agreement"
                  v-model="leadForm.personal_data_agreement"
                  type="checkbox"
                  :class="[
                    'w-4 h-4 rounded border-2 focus:ring-0 focus:ring-offset-0 cursor-pointer',
                    formErrors.personal_data_agreement
                      ? 'border-red-300'
                      : 'border-brand-400',
                    formStatus === 'loading'
                      ? 'opacity-50 cursor-not-allowed'
                      : '',
                  ]"
                  :disabled="formStatus === 'loading'"
                />
              </div>
              <label
                for="personal_data_agreement"
                class="text-sm text-brand-100 leading-tight cursor-pointer"
              >
                Согласен на обработку персональных данных в соответствии с
                <a href="#" class="text-white hover:text-brand-200 underline"
                  >политикой конфиденциальности</a
                >
                *
              </label>
            </div>
            <p
              v-if="formErrors.personal_data_agreement"
              class="text-sm text-red-200 ml-7"
            >
              {{ formErrors.personal_data_agreement }}
            </p>

            <template v-if="formStatus === 'success'">
              <div
                class="bg-brand-500/20 border border-brand-400/50 rounded-xl p-4 text-center animate-fade-in"
              >
                <div
                  class="flex items-center justify-center gap-2 text-brand-300 mb-2"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span class="font-semibold">Заявка успешно отправлена!</span>
                </div>
                <p class="text-brand-200 text-sm">
                  Мы свяжемся с вами в ближайшее время
                </p>
              </div>
            </template>

            <button
              type="submit"
              :class="[
                'w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform active:scale-[0.98]',
                formStatus === 'loading'
                  ? 'bg-brand-400 cursor-not-allowed'
                  : 'bg-white text-brand-700 hover:bg-brand-50 hover:shadow-lg',
                formStatus === 'success' || formStatus === 'error'
                  ? 'hidden'
                  : '',
              ]"
              :disabled="formStatus === 'loading'"
            >
              <span v-if="formStatus !== 'loading'">Отправить заявку</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg
                  class="animate-spin w-5 h-5"
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
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Отправляем...
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- ====== Технологии ====== -->
    <section class="py-12 sm:py-20 bg-ink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10 sm:mb-16">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900">
            Технологии, на которых построена система
          </h2>
          <p class="mt-3 sm:mt-4 text-base sm:text-lg text-ink-600">
            Надёжное промышленное решение
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <!-- Аппаратная часть -->
          <div
            class="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-ink-200"
          >
            <h3
              class="text-xl sm:text-2xl font-bold text-ink-900 mb-6 flex items-center gap-3"
            >
              <span
                class="w-10 h-10 bg-linear-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </span>
              Контроллер «ШиП-01»
            </h3>

            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Вычислительное ядро:</p>
                  <p class="text-sm text-ink-600">
                    Orange Pi — проверенный промышленный контроллер
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Связь:</p>
                  <p class="text-sm text-ink-600">
                    GSM-модуль для SMS-уведомлений. Работает без интернета и
                    Wi-Fi
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Датчики:</p>
                  <p class="text-sm text-ink-600">
                    Выносные цифровые термодатчики. Длина кабеля до 5 метров
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Питание:</p>
                  <p class="text-sm text-ink-600">
                    5V, стандартный блок питания. Потребление менее 5 Вт
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Корпус:</p>
                  <p class="text-sm text-ink-600">
                    Промышленный пластиковый бокс, защита IP54
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Программная часть -->
          <div
            class="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-ink-200"
          >
            <h3
              class="text-xl sm:text-2xl font-bold text-ink-900 mb-6 flex items-center gap-3"
            >
              <span
                class="w-10 h-10 bg-linear-to-br from-brand-400 to-brand-500 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </span>
              Облачный сервис (SaaS)
            </h3>

            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Стек технологий:</p>
                  <p class="text-sm text-ink-600">
                    Vue 3, TypeScript, Node.js, PostgreSQL, Docker
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Визуализация:</p>
                  <p class="text-sm text-ink-600">
                    Графики температуры в реальном времени с историей за любой
                    период
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Уведомления:</p>
                  <p class="text-sm text-ink-600">
                    Push-уведомления в браузере + SMS через GSM-модуль
                    (дублирование)
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Отчётность:</p>
                  <p class="text-sm text-ink-600">
                    Автоматическая генерация журналов температуры для СЭС
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mt-0.5"
                >
                  <svg
                    class="w-4 h-4 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-ink-900">Доступ:</p>
                  <p class="text-sm text-ink-600">
                    Мультипользовательский (директор, менеджер, холодильщик). С
                    любого устройства
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== Цены ====== -->
    <section class="py-12 sm:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10 sm:mb-16">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900">
            Сколько стоит ваша уверенность?
          </h2>
          <p class="mt-3 sm:mt-4 text-base sm:text-lg text-ink-600">
            Прозрачные цены. Никаких скрытых платежей.
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto"
        >
          <!-- Тариф Базовый -->
          <div
            class="bg-white rounded-2xl border-2 border-ink-200 p-6 sm:p-8 hover:border-brand-300 transition-all duration-300"
          >
            <div class="text-center">
              <h3 class="text-xl sm:text-2xl font-bold text-ink-900 mb-2">
                Стартовый
              </h3>
              <p class="text-sm text-ink-600 mb-6">
                Для небольших складов (1-3 камеры)
              </p>

              <div class="mb-6">
                <span class="text-4xl sm:text-5xl font-extrabold text-ink-900"
                  >25 000 ₽</span
                >
                <span class="text-ink-500 text-sm ml-1">/контроллер</span>
              </div>

              <div class="bg-brand-50 rounded-xl p-4 mb-6">
                <p class="text-2xl font-bold text-brand-700">
                  1 500 ₽<span class="text-sm font-normal text-brand-600"
                    >/мес</span
                  >
                </p>
                <p class="text-xs text-brand-600 mt-1">Подписка на сервис</p>
              </div>

              <ul class="space-y-3 text-left mb-8">
                <li class="flex items-start gap-2 text-sm">
                  <svg
                    class="w-5 h-5 text-brand-500 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Контроллер «ШиП-01» + датчик</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <svg
                    class="w-5 h-5 text-brand-500 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>SMS-уведомления (включены)</span>
                </li>
                <li class="flex items-start gap-2 text-sm">
                  <svg
                    class="w-5 h-5 text-brand-500 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Графики температуры</span>
                </li>
              </ul>

              <template v-if="!isAuthenticated">
                <router-link
                  :to="ROUTES.REGISTER"
                  class="block w-full py-3 px-6 text-center bg-linear-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Подключить
                </router-link>
              </template>
              <template v-else>
                <router-link
                  :to="ROUTES.ORGANIZATIONS"
                  class="block w-full py-3 px-6 text-center bg-linear-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Мои организации
                </router-link>
              </template>
            </div>
          </div>

          <!-- Тариф Корпоративный -->
          <div
            class="bg-linear-to-br from-ink-900 to-ink-800 rounded-2xl p-6 sm:p-8 text-white transform scale-100 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
          >
            <div
              class="absolute top-4 right-4 bg-linear-to-r from-yellow-400 to-orange-500 text-ink-900 text-xs font-bold px-3 py-1 rounded-full"
            >
              Популярный
            </div>

            <div class="text-center">
              <h3 class="text-xl sm:text-2xl font-bold mb-2">Корпоративный</h3>
              <p class="text-sm text-ink-400 mb-6">
                Для распределительных центров (4+ камер)
              </p>

              <div class="mb-6">
                <span class="text-4xl sm:text-5xl font-extrabold"
                  >23 000 ₽</span
                >
                <span class="text-ink-400 text-sm ml-1">/контроллер</span>
                <p class="text-xs text-brand-400 mt-1">
                  Экономия 2 000 ₽ с каждого
                </p>
              </div>

              <div class="bg-white/10 rounded-xl p-4 mb-6">
                <p class="text-2xl font-bold text-brand-300">
                  1 200 ₽<span class="text-sm font-normal text-ink-400"
                    >/мес</span
                  >
                </p>
                <p class="text-xs text-ink-400 mt-1">
                  Подписка при 4+ контроллерах
                </p>
              </div>

              <ul class="space-y-3 text-left mb-8">
                <li class="flex items-start gap-2 text-sm text-ink-300">
                  <svg
                    class="w-5 h-5 text-brand-400 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Всё из «Стартового»</span>
                </li>
                <li class="flex items-start gap-2 text-sm text-ink-300">
                  <svg
                    class="w-5 h-5 text-brand-400 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Мультипользовательский доступ</span>
                </li>
                <li class="flex items-start gap-2 text-sm text-ink-300">
                  <svg
                    class="w-5 h-5 text-brand-400 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Приоритетная поддержка 24/7</span>
                </li>
                <li class="flex items-start gap-2 text-sm text-ink-300">
                  <svg
                    class="w-5 h-5 text-brand-400 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Расширенная гарантия 18 месяцев</span>
                </li>
              </ul>

              <template v-if="!isAuthenticated">
                <router-link
                  :to="ROUTES.REGISTER"
                  class="block w-full py-3 px-6 text-center bg-linear-to-r from-brand-400 to-brand-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Получить предложение
                </router-link>
              </template>
              <template v-else>
                <router-link
                  :to="ROUTES.ORGANIZATIONS"
                  class="block w-full py-3 px-6 text-center bg-linear-to-r from-brand-400 to-brand-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Мои организации
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== О компании ====== -->
    <section
      class="py-12 sm:py-20 bg-linear-to-br from-ink-900 to-ink-800 text-white"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:items-center lg:gap-16">
          <div class="lg:w-1/2 mb-10 lg:mb-0">
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              О компании «ШиП-монитор»
            </h2>
            <div
              class="space-y-3 sm:space-y-4 text-sm sm:text-base text-ink-300 leading-relaxed"
            >
              <p>
                Мы специализируемся на разработке интеллектуальных систем
                мониторинга для промышленного холодильного оборудования. Наша
                миссия — обеспечить непрерывный контроль температурных режимов и
                предотвратить порчу продукции наших клиентов.
              </p>
              <p>
                Система «ШиП-монитор» разработана с учётом всех современных
                требований к безопасности, надёжности и удобству использования.
              </p>

              <div class="grid grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div class="text-center">
                  <div class="text-2xl sm:text-3xl font-bold text-brand-400">
                    24/7
                  </div>
                  <div class="text-xs sm:text-sm text-ink-400 mt-1">
                    Поддержка
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-2xl sm:text-3xl font-bold text-brand-400">
                    99.9%
                  </div>
                  <div class="text-xs sm:text-sm text-ink-400 mt-1">
                    Uptime серверов
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-2xl sm:text-3xl font-bold text-brand-400">
                    500+
                  </div>
                  <div class="text-xs sm:text-sm text-ink-400 mt-1">
                    Датчиков под управлением
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:w-1/2">
            <div
              class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20"
            >
              <h3 class="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                Ключевые цифры проекта
              </h3>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div
                    class="shrink-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center mt-0.5"
                  >
                    <svg
                      class="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-white text-sm sm:text-base">
                      Срок окупаемости для клиента
                    </p>
                    <p class="text-xs sm:text-sm text-ink-400">
                      от 1 до 3 месяцев (за счёт предотвращения 1 аварии)
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div
                    class="shrink-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center mt-0.5"
                  >
                    <svg
                      class="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-white text-sm sm:text-base">
                      Точность измерений
                    </p>
                    <p class="text-xs sm:text-sm text-ink-400">
                      Погрешность не более ±0.1°C
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div
                    class="shrink-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center mt-0.5"
                  >
                    <svg
                      class="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-white text-sm sm:text-base">
                      Время развёртывания
                    </p>
                    <p class="text-xs sm:text-sm text-ink-400">
                      15 минут на подключение одного контроллера
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div
                    class="shrink-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center mt-0.5"
                  >
                    <svg
                      class="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-white text-sm sm:text-base">
                      Масштабируемость
                    </p>
                    <p class="text-xs sm:text-sm text-ink-400">
                      От 1 до 1000+ датчиков в одной системе
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== Footer ====== -->
    <!-- ====== Footer ====== -->
    <footer class="bg-ink-900 border-t border-ink-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <!-- Только логотип, без текста -->
          <div class="w-24 h-24 sm:w-32 sm:h-12 shrink-0">
            <img
              :src="BIG_LOGO_D"
              alt="ШиП-монитор"
              class="w-full h-full object-contain"
            />
          </div>

          <div class="text-ink-400 text-xs sm:text-sm text-center">
            © {{ new Date().getFullYear() }} ШиП-монитор. Все права защищены.
          </div>

          <div class="text-ink-400 text-xs sm:text-sm">
            По вопросам:
            <a
              href="mailto:support@ship-monitor.ru"
              class="text-brand-400 hover:text-brand-300 transition-colors"
              >support@ship-monitor.ru</a
            >
          </div>
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

const { roadmapItems, fetchRoadmap } = useRoadmap();
const { createLead } = useLeads();

const NAV_LINKS = [
  {
    label: "Дорожная карта",
    to: "/#",
  },
  {
    label: "Документация",
    to: "/#",
  },
  {
    label: "Цены",
    to: "/#",
  },
];

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
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(20px, -30px) scale(1.1);
  }

  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  75% {
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
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
