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
    <div v-if="!isLoading && !user">
      <p class="ship-card p-4 text-sm text-red-600">
        Не удалось загрузить профиль. Обновите страницу и попробуйте ещё раз.
      </p>
    </div>

    <!-- Информация о пользователе -->
    <div
      v-if="user"
      class="ship-card p-5 sm:p-6"
    >
      <h2 class="text-base font-semibold text-ink-900 mb-4">
        Информация
      </h2>
      <div class="space-y-4">
        <div>
          <label class="block text-xs text-ink-400 mb-0.5">Имя</label>
          <p class="text-sm font-medium text-ink-800">
            {{ user?.name || "Не указано" }}
          </p>
        </div>
        <div>
          <label class="block text-xs text-ink-400 mb-0.5">Email</label>
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-ink-800">
              {{ user?.email }}
            </p>
            <span
              v-if="user?.emailVerified"
              class="ship-badge ship-badge-success"
            >
              Подтверждён
            </span>
            <span
              v-else
              class="ship-badge ship-badge-danger"
            >
              Не подтверждён
            </span>
          </div>
        </div>
        <div v-if="!user?.emailVerified">
          <button
            :disabled="sendingConfirmation"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 touch-target transition-colors font-medium"
            @click="handleConfirmEmail"
          >
            {{ sendingConfirmation ? "Отправка..." : "Подтвердить почту" }}
          </button>
          <p
            v-if="confirmEmailSuccess"
            role="status"
            class="text-brand-600 text-xs mt-2"
          >
            {{ confirmEmailSuccess }}
          </p>
          <p
            v-if="confirmEmailError"
            role="alert"
            class="text-red-500 text-xs mt-2"
          >
            {{ confirmEmailError }}
          </p>
        </div>
      </div>
    </div>

    <!-- Изменение email -->
    <div class="ship-card p-5 sm:p-6">
      <h2 class="text-base font-semibold text-ink-900 mb-4">
        Изменить email
      </h2>
      <div class="space-y-3">
        <label
          class="sr-only"
          for="profile-email"
        >Новый email</label>
        <ShipInput
          id="profile-email"
          v-model="newEmail"
          type="email"
          placeholder="Новый email"
          inputmode="email"
          autocomplete="email"
          :aria-invalid="emailError ? 'true' : undefined"
          aria-describedby="profile-email-status"
          @keyup.enter="handleUpdateEmail"
        />
        <button
          class="w-full px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 font-medium text-sm touch-target transition-colors"
          :disabled="!newEmail.trim() || updatingEmail"
          @click="handleUpdateEmail"
        >
          {{ updatingEmail ? "Сохранение..." : "Обновить email" }}
        </button>
      </div>
      <p
        v-if="emailError"
        id="profile-email-status"
        role="alert"
        class="text-red-500 text-xs mt-2"
      >
        {{ emailError }}
      </p>
      <p
        v-if="emailSuccess"
        id="profile-email-status"
        role="status"
        class="text-brand-600 text-xs mt-2"
      >
        {{ emailSuccess }}
      </p>
    </div>

    <!-- Изменение пароля -->
    <div class="ship-card p-5 sm:p-6">
      <h2 class="text-base font-semibold text-ink-900 mb-4">
        Изменить пароль
      </h2>
      <div class="space-y-3">
        <label
          class="sr-only"
          for="profile-password"
        >Новый пароль</label>
        <ShipInput
          id="profile-password"
          v-model="newPassword"
          type="password"
          placeholder="Новый пароль"
          autocomplete="new-password"
          :aria-invalid="passwordError ? 'true' : undefined"
          aria-describedby="profile-password-status"
        />
        <button
          class="w-full px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 font-medium text-sm touch-target transition-colors"
          :disabled="!newPassword.trim() || updatingPassword"
          @click="handleUpdatePassword"
        >
          {{ updatingPassword ? "Сохранение..." : "Обновить пароль" }}
        </button>
      </div>
      <p
        v-if="passwordError"
        id="profile-password-status"
        role="alert"
        class="text-red-500 text-xs mt-2"
      >
        {{ passwordError }}
      </p>
      <p
        v-if="passwordSuccess"
        id="profile-password-status"
        role="status"
        class="text-brand-600 text-xs mt-2"
      >
        {{ passwordSuccess }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  getCurrentUser,
  startEmailConfirmation,
  setUserEmail,
  setUserPassword,
} from "@/data";
import ShipInput from "@/components/ShipInput.vue";
import { useAsyncState } from "@vueuse/core";

const { state: user, isLoading } = useAsyncState(
  async () =>
    (await getCurrentUser())
      .inspectErr((err) => console.error("Failed get current user: %s", err))
      .unwrapOr(null),
  null
);

// Email
const newEmail = ref("");
const updatingEmail = ref(false);
const emailError = ref("");
const emailSuccess = ref("");

// Password
const newPassword = ref("");
const updatingPassword = ref(false);
const passwordError = ref("");
const passwordSuccess = ref("");

// Email confirmation
const sendingConfirmation = ref(false);
const confirmEmailSuccess = ref("");
const confirmEmailError = ref("");

async function handleUpdateEmail() {
  const email = newEmail.value.trim();
  const current = user.value;
  if (!email || !current) return;
  updatingEmail.value = true;
  emailError.value = "";
  emailSuccess.value = "";

  const result = await setUserEmail(current.id, email);
  result
    .map(() => {
      emailSuccess.value = "Email обновлён";
      current.email = email;
      newEmail.value = "";
    })
    .inspectErr((err) => {
      emailError.value = err;
    })
    .unwrapOr(undefined);

  updatingEmail.value = false;
}

async function handleUpdatePassword() {
  const password = newPassword.value;
  const current = user.value;
  if (!password || !current) return;
  updatingPassword.value = true;
  passwordError.value = "";
  passwordSuccess.value = "";

  const result = await setUserPassword(current.id, password);
  result
    .map(() => {
      passwordSuccess.value = "Пароль обновлён";
      newPassword.value = "";
    })
    .inspectErr((err) => {
      passwordError.value = err;
    })
    .unwrapOr(undefined);

  updatingPassword.value = false;
}

async function handleConfirmEmail() {
  sendingConfirmation.value = true;
  confirmEmailSuccess.value = "";
  confirmEmailError.value = "";

  const result = await startEmailConfirmation();
  result
    .map(() => {
      confirmEmailSuccess.value =
        "Письмо для подтверждения отправлено на вашу почту";
    })
    .inspectErr((err) => {
      confirmEmailError.value = err;
    })
    .unwrapOr(undefined);

  sendingConfirmation.value = false;
}
</script>
