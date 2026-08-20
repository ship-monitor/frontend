<template>
  <div class="max-w-lg mx-auto space-y-5 animate-fade-in">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">Профиль</h1>
      <p class="text-sm text-ink-500 mt-0.5">Управление аккаунтом</p>
    </div>
    <div>
      <p v-if="error">{{ error }}</p>
    </div>

    <!-- Информация о пользователе -->
    <div class="ship-card p-5 sm:p-6" v-if="user">
      <h2 class="text-base font-semibold text-ink-900 mb-4">Информация</h2>
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
            <p class="text-sm font-medium text-ink-800">{{ user?.email }}</p>
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
            @click="handleConfirmEmail"
            :disabled="sendingConfirmation"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 touch-target transition-colors font-medium"
          >
            {{ sendingConfirmation ? "Отправка..." : "Подтвердить почту" }}
          </button>
          <p v-if="confirmEmailSuccess" class="text-brand-600 text-xs mt-2">
            {{ confirmEmailSuccess }}
          </p>
          <p v-if="confirmEmailError" class="text-red-500 text-xs mt-2">
            {{ confirmEmailError }}
          </p>
        </div>
      </div>
    </div>

    <!-- Изменение email -->
    <div class="ship-card p-5 sm:p-6">
      <h2 class="text-base font-semibold text-ink-900 mb-4">Изменить email</h2>
      <div class="space-y-3">
        <ShipTextbox
          v-model="newEmail"
          type="email"
          placeholder="Новый email"
          inputmode="email"
          @keyup.enter="handleUpdateEmail"
        />
        <button
          @click="handleUpdateEmail"
          class="w-full px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 font-medium text-sm touch-target transition-colors"
          :disabled="!newEmail.trim() || updatingEmail"
        >
          {{ updatingEmail ? "Сохранение..." : "Обновить email" }}
        </button>
      </div>
      <p v-if="emailError" class="text-red-500 text-xs mt-2">
        {{ emailError }}
      </p>
      <p v-if="emailSuccess" class="text-brand-600 text-xs mt-2">
        {{ emailSuccess }}
      </p>
    </div>

    <!-- Изменение пароля -->
    <div class="ship-card p-5 sm:p-6">
      <h2 class="text-base font-semibold text-ink-900 mb-4">
        Изменить пароль
      </h2>
      <div class="space-y-3">
        <ShipTextbox
          v-model="newPassword"
          type="password"
          placeholder="Новый пароль"
        />
        <button
          @click="handleUpdatePassword"
          class="w-full px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 font-medium text-sm touch-target transition-colors"
          :disabled="!newPassword.trim() || updatingPassword"
        >
          {{ updatingPassword ? "Сохранение..." : "Обновить пароль" }}
        </button>
      </div>
      <p v-if="passwordError" class="text-red-500 text-xs mt-2">
        {{ passwordError }}
      </p>
      <p v-if="passwordSuccess" class="text-brand-600 text-xs mt-2">
        {{ passwordSuccess }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "@/api";
import type { AxiosError } from "axios";
import { getCurrentUser, startEmailConfirmation } from "@/data";
import ShipTextbox from "@/components/ShipTextbox.vue";
import { useAsyncState } from "@vueuse/core";

const { state: user, error } = useAsyncState(
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

/**
 * @deprecated Move this to data
 */
async function handleUpdateEmail() {
  if (!newEmail.value.trim() || !user.value) return;
  updatingEmail.value = true;
  emailError.value = "";
  emailSuccess.value = "";

  if (!user) return;

  try {
    await api.post(`/api/users/${user.value.id}/set-email`, {
      email: newEmail.value,
    });
    emailSuccess.value = "Email обновлён";
    user.value.email = newEmail.value;
    newEmail.value = "";
  } catch (error) {
    emailError.value =
      ((error as AxiosError).response?.data as { details: string }).details ||
      "Ошибка при обновлении email";
  } finally {
    updatingEmail.value = false;
  }
}

async function handleUpdatePassword() {
  if (!newPassword.value.trim() || !user.value) return;
  updatingPassword.value = true;
  passwordError.value = "";
  passwordSuccess.value = "";

  try {
    await api.post(`/api/users/${user.value.id}/set-password`, {
      password: newPassword.value,
    });
    passwordSuccess.value = "Пароль обновлён";
    newPassword.value = "";
  } catch (error) {
    passwordError.value =
      ((error as AxiosError).response?.data as { details: string }).details ||
      "Ошибка при обновлении пароля";
  } finally {
    updatingPassword.value = false;
  }
}

async function handleConfirmEmail() {
  sendingConfirmation.value = true;
  confirmEmailSuccess.value = "";
  confirmEmailError.value = "";

  try {
    await startEmailConfirmation();
    confirmEmailSuccess.value =
      "Письмо для подтверждения отправлено на вашу почту";
  } catch (e) {
    confirmEmailError.value =
      e instanceof Error ? e.message : "Не удалось отправить письмо";
  } finally {
    sendingConfirmation.value = false;
  }
}
</script>
