<template>
  <div class="space-y-6">
    <div class="app-card p-6">
      <h2 class="text-lg font-bold text-ink-900 mb-6">
        Настройки устройства
      </h2>

      <div class="space-y-6">
        <div>
          <label
            class="block text-sm font-medium text-ink-700 mb-1.5"
            for="device-name"
          >
            Название устройства
          </label>
          <AppInput
            id="device-name"
            v-model="local.name"
            type="text"
            placeholder="Введите новое название"
            class="w-full"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-ink-100">
          <AppButton
            variant="secondary"
            @click="cancel"
          >
            Отмена
          </AppButton>
          <AppButton
            variant="primary"
            :disabled="saving"
            @click="$emit('save', local)"
          >
            {{ saving ? "Сохранение..." : "Сохранить" }}
          </AppButton>
        </div>

        <p
          v-if="error"
          role="alert"
          class="text-sm text-red-600 text-right"
        >
          {{ error }}
        </p>
      </div>
    </div>

    <div class="app-card p-6 border-red-200">
      <h2 class="text-lg font-bold text-red-700 mb-2">
        Отключение устройства
      </h2>
      <p class="text-sm text-ink-500 mb-4">
        Устройство будет отвязано от аккаунта. Датчики перестанут отслеживаться,
        данные на сервере сохранятся.
      </p>
      <AppButton
        variant="danger"
        :disabled="disconnecting"
        @click="confirmDisconnect"
      >
        {{ disconnecting ? "Отключение..." : "Отключить устройство" }}
      </AppButton>
      <p
        v-if="disconnectError"
        role="alert"
        class="text-sm text-red-600 mt-3"
      >
        {{ disconnectError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppButton from "@/components/ui/AppButton.vue";
import type { DeviceSettings } from "@/composables/useDeviceDetails";

const props = defineProps<{
  settings: DeviceSettings;
  saving: boolean;
  error?: string;
  disconnecting?: boolean;
  disconnectError?: string;
}>();

const emit = defineEmits<{
  save: [settings: DeviceSettings];
  disconnect: [deviceId: string];
}>();

const confirmDisconnect = () => {
  if (
    window.confirm(
      `Отключить устройство «${props.settings.name || props.settings.id.slice(0, 8)}»?`
    )
  ) {
    emit("disconnect", props.settings.id);
  }
};

const local = reactive<DeviceSettings>({ ...props.settings });

watch(
  () => props.settings,
  (val) => {
    Object.assign(local, val);
  },
  { deep: true }
);

const cancel = () => {
  Object.assign(local, props.settings);
};
</script>
