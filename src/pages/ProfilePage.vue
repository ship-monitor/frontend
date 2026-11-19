<template>
  <div class="max-w-lg mx-auto space-y-5 animate-fade-in">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
        Профиль
      </h1>
      <p class="text-sm text-ink-500 mt-0.5">
        Управление аккаунтом
      </p>
    </div>

    <div class="app-card p-5 sm:p-6 flex items-center gap-4">
      <div class="size-14 rounded-2xl bg-brand-50 ring-1 ring-inset ring-brand-200 flex items-center justify-center shrink-0">
        <IconPerson class="size-7 text-brand-600" />
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-ink-900">
          Владелец аккаунта
        </p>
        <p class="text-sm text-ink-500 mt-0.5">
          Личные данные появятся после обновления API
        </p>
      </div>
    </div>

    <!-- NOTE: данные пользователя, смена email/пароля и подтверждение почты
         вернутся, когда соответствующие эндпоинты появятся в API v2. -->
    <div class="app-card p-5 sm:p-6">
      <h2 class="text-base font-bold text-ink-900 mb-1">
        Данные аккаунта
      </h2>
      <p class="text-sm text-ink-500">
        Смена имени, email и пароля временно недоступна — функция готовится
        к переносу в новое API.
      </p>
    </div>

    <div class="app-card p-5 sm:p-6">
      <h2 class="text-base font-bold text-ink-900 mb-1">
        Поддержка
      </h2>
      <p class="text-sm text-ink-500 mb-3">
        Вопросы по работе сервиса и подключению устройств
      </p>
      <a
        :href="'mailto:' + SUPPORT_EMAIL"
        class="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
      >
        <svg
          class="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
        {{ SUPPORT_EMAIL }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconPerson from "@/components/icons/IconPerson.vue";
import { SUPPORT_EMAIL } from "@/constants/contacts";
</script>
