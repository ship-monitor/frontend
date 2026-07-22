<template>
  <div class="max-w-lg mx-auto p-4 sm:p-6">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Профиль</h1>
    <div>
      <p v-if="error">{{ error }}</p>
    </div>

    <!-- Информация о пользователе -->
    <div class="bg-white rounded-xl border p-5 sm:p-6 mb-6" v-if="user">
      <h2 class="text-base font-semibold text-gray-800 mb-4">Информация</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-xs text-gray-500 mb-0.5">Имя</label>
          <p class="text-sm font-medium text-gray-800">
            {{ user?.name || "Не указано" }}
          </p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-0.5">Email</label>
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-gray-800">{{ user?.email }}</p>
            <span
              v-if="user?.emailVerified"
              class="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium"
            >
              Подтверждён
            </span>
            <span
              v-else
              class="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium"
            >
              Не подтверждён
            </span>
          </div>
        </div>
        <div v-if="!user?.emailVerified">
          <button
            @click="handleConfirmEmail"
            :disabled="sendingConfirmation"
            class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 touch-target"
          >
            {{ sendingConfirmation ? "Отправка..." : "Подтвердить почту" }}
          </button>
          <p v-if="confirmEmailSuccess" class="text-green-600 text-xs mt-1.5">
            {{ confirmEmailSuccess }}
          </p>
          <p v-if="confirmEmailError" class="text-red-600 text-xs mt-1.5">
            {{ confirmEmailError }}
          </p>
        </div>
      </div>
    </div>

    <!-- Изменение email -->
    <div class="bg-white rounded-xl border p-5 sm:p-6 mb-6">
      <h2 class="text-base font-semibold text-gray-800 mb-4">Изменить email</h2>
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
          class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium text-sm touch-target"
          :disabled="!newEmail.trim() || updatingEmail"
        >
          {{ updatingEmail ? "Сохранение..." : "Обновить email" }}
        </button>
      </div>
      <p v-if="emailError" class="text-red-500 text-xs mt-2">
        {{ emailError }}
      </p>
      <p v-if="emailSuccess" class="text-green-500 text-xs mt-2">
        {{ emailSuccess }}
      </p>
    </div>

    <!-- Изменение пароля -->
    <div class="bg-white rounded-xl border p-5 sm:p-6">
      <h2 class="text-base font-semibold text-gray-800 mb-4">
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
          class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium text-sm touch-target"
          :disabled="!newPassword.trim() || updatingPassword"
        >
          {{ updatingPassword ? "Сохранение..." : "Обновить пароль" }}
        </button>
      </div>
      <p v-if="passwordError" class="text-red-500 text-xs mt-2">
        {{ passwordError }}
      </p>
      <p v-if="passwordSuccess" class="text-green-500 text-xs mt-2">
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
