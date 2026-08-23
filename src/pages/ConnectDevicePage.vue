<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-ink-50"
  >
    <div class="ship-card p-6 sm:p-8 max-w-md w-full animate-scale-in">
      <!-- Заголовок -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 transition-colors mb-4"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад
        </button>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight">
          Подключение устройства
        </h1>
        <p class="text-sm text-ink-500 mt-1">
          Введите данные с наклейки устройства
        </p>
      </div>

      <!-- Форма -->
      <!-- TODO(a11y): Associate field errors with inputs and announce dynamic submit status with aria-invalid, aria-describedby, and a live region. -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- ID устройства -->
        <div>
          <label
            for="device-id"
            class="block text-sm font-medium text-ink-700 mb-1.5"
          >
            Идентификатор устройства <span class="text-red-500">*</span>
          </label>
          <input
            id="device-id"
            v-model="form.deviceId"
            type="text"
            placeholder="UUID устройства"
            class="ship-field font-mono text-sm"
            :class="{ '!border-red-400': errors.deviceId }"
            :disabled="submitting"
          />
          <p v-if="errors.deviceId" class="mt-1 text-xs text-red-500">
            {{ errors.deviceId }}
          </p>
        </div>

        <!-- Пароль устройства -->
        <div>
          <label
            for="device-password"
            class="block text-sm font-medium text-ink-700 mb-1.5"
          >
            Пароль устройства <span class="text-red-500">*</span>
          </label>
          <input
            id="device-password"
            v-model="form.password"
            type="password"
            placeholder="Пароль с наклейки"
            class="ship-field"
            :class="{ '!border-red-400': errors.password }"
            :disabled="submitting"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-500">
            {{ errors.password }}
          </p>
        </div>

        <!-- Название устройства -->
        <div>
          <label
            for="device-name"
            class="block text-sm font-medium text-ink-700 mb-1.5"
          >
            Название устройства <span class="text-red-500">*</span>
          </label>
          <input
            id="device-name"
            v-model="form.name"
            type="text"
            placeholder="Холодильник N1"
            class="ship-field"
            :class="{ '!border-red-400': errors.name }"
            :disabled="submitting"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-500">
            {{ errors.name }}
          </p>
        </div>

        <!-- Успех -->
        <div
          v-if="submitStatus === 'success'"
          class="p-4 rounded-xl bg-brand-50 text-brand-700 text-sm ring-1 ring-inset ring-brand-200 flex items-center gap-2.5"
        >
          <svg
            class="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Устройство подключено.
          <router-link :to="ROUTES.DASHBOARD" class="font-semibold underline"
            >На дашборд</router-link
          >
        </div>

        <!-- Ошибка -->
        <div
          v-if="submitStatus === 'error'"
          class="p-4 rounded-xl bg-red-50 text-red-700 text-sm ring-1 ring-inset ring-red-200 flex items-center gap-2.5"
        >
          <svg
            class="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ errorMessage }}
        </div>

        <!-- Кнопка -->
        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-3.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:pointer-events-none transition-colors active:scale-[0.98] touch-target"
        >
          <span
            v-if="submitting"
            class="flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
            Подключение…
          </span>
          <span v-else>Подключить устройство</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { connectDevice } from "@/data";
import { ROUTES } from "@/constants/routes";

const currentRoute = useRoute();
const router = useRouter();

const submitting = ref(false);
const submitStatus = ref<"idle" | "success" | "error">("idle");
const errorMessage = ref("");
const errors = reactive<{
  deviceId?: string;
  password?: string;
  name?: string;
}>({});

const form = reactive({
  deviceId: "",
  password: "",
  name: "",
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(ROUTES.DASHBOARD);
  }
};

const validate = (): boolean => {
  // TODO: Validate deviceId against the documented device identifier/UUID format instead of checking only for non-empty text.
  errors.deviceId = form.deviceId.trim() ? undefined : "Введите ID устройства";
  errors.password = form.password ? undefined : "Введите пароль устройства";
  errors.name = form.name.trim() ? undefined : "Введите название устройства";
  return !errors.deviceId && !errors.password && !errors.name;
};

// TODO: Catch rejected transport requests and reset submitting in finally so network failures cannot leave the form permanently disabled.
const handleSubmit = async () => {
  if (!validate()) return;

  submitting.value = true;
  submitStatus.value = "idle";

  const result = await connectDevice(
    form.deviceId.trim(),
    form.password,
    form.name.trim()
  );

  submitting.value = false;

  result.match({
    Ok: () => {
      submitStatus.value = "success";
    },
    Err: (err: string) => {
      submitStatus.value = "error";
      errorMessage.value = err || "Не удалось подключить устройство";
    },
  });
};

onMounted(() => {
  const queryDevice = currentRoute.query.device;
  if (typeof queryDevice === "string" && queryDevice.trim()) {
    form.deviceId = queryDevice.trim();
  }
});
</script>
