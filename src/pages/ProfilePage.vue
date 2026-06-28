<template>
  <div class="max-w-lg mx-auto p-4 sm:p-6">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Профиль</h1>

    <!-- Информация о пользователе -->
    <div class="bg-white rounded-xl border p-5 sm:p-6 mb-6">
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

    <!-- Настройки email-уведомлений -->
    <div class="bg-white rounded-xl border p-5 sm:p-6 mb-6">
      <h2 class="text-base font-semibold text-gray-800 mb-4">
        Email-уведомления
      </h2>
      <div class="space-y-4">
        <label
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg touch-target cursor-pointer"
        >
          <div>
            <p class="text-sm font-medium text-gray-800">
              Приглашения в организации
            </p>
            <p class="text-xs text-gray-500">
              Когда вас приглашают в новую организацию
            </p>
          </div>
          <input
            v-model="notifications.invitations"
            type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 shrink-0"
            @change="saveNotifications"
          />
        </label>

        <label
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg touch-target cursor-pointer"
        >
          <div>
            <p class="text-sm font-medium text-gray-800">Изменение роли</p>
            <p class="text-xs text-gray-500">
              Когда изменяют вашу роль в организации
            </p>
          </div>
          <input
            v-model="notifications.roleChanges"
            type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 shrink-0"
            @change="saveNotifications"
          />
        </label>

        <label
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg touch-target cursor-pointer"
        >
          <div>
            <p class="text-sm font-medium text-gray-800">
              Системные уведомления
            </p>
            <p class="text-xs text-gray-500">
              Важные обновления и новости сервиса
            </p>
          </div>
          <input
            v-model="notifications.system"
            type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 shrink-0"
            @change="saveNotifications"
          />
        </label>
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
import { ref, onMounted } from "vue";
import api from "@/api";
import type { AxiosError } from "axios";
import { startEmailConfirmation } from "@/data";
import ShipTextbox from "@/components/ShipTextbox.vue";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  blocked: boolean;
}

const user = ref<User | null>(null);

// Уведомления
const notifications = ref({
  invitations: true,
  roleChanges: true,
  system: false,
});

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

onMounted(() => {
  loadUser();
  loadNotifications();
});

function loadUser() {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      user.value = JSON.parse(userStr);
    } catch {
      console.error("Ошибка парсинга user из localStorage");
    }
  }
}

function loadNotifications() {
  const saved = localStorage.getItem("profile_notifications");
  if (saved) {
    try {
      notifications.value = JSON.parse(saved);
    } catch {
      /* */
    }
  }
}

function saveNotifications() {
  localStorage.setItem(
    "profile_notifications",
    JSON.stringify(notifications.value)
  );
}

async function handleUpdateEmail() {
  if (!newEmail.value.trim() || !user.value) return;
  updatingEmail.value = true;
  emailError.value = "";
  emailSuccess.value = "";

  try {
    await api.post(`/api/users/${user.value.id}/set-email`, {
      email: newEmail.value,
    });
    emailSuccess.value = "Email обновлён";
    user.value.email = newEmail.value;
    localStorage.setItem("user", JSON.stringify(user.value));
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
    confirmEmailSuccess.value = "Письмо для подтверждения отправлено на вашу почту";
  } catch (e) {
    confirmEmailError.value = e instanceof Error ? e.message : "Не удалось отправить письмо";
  } finally {
    sendingConfirmation.value = false;
  }
}
</script>
