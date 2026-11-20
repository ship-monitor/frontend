<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6">
    <div
      v-if="loading"
      class="text-center py-12"
    >
      <svg
        class="w-8 h-8 mx-auto text-brand-500 animate-spin mb-3"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
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
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p class="text-ink-400">
        Загрузка...
      </p>
    </div>

    <div
      v-else-if="loadError"
      class="app-card p-8 text-center"
    >
      <p class="text-lg font-semibold text-ink-900 mb-1">
        {{ loadError }}
      </p>
      <p class="text-sm text-ink-500 mb-4">
        Проверьте соединение и повторите
      </p>
      <button
        class="px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
        @click="reload"
      >
        Повторить
      </button>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <DevicePageHeader
        :name="deviceName"
        :device-id="deviceId"
        :is-connected="deviceIsConnected"
        :status-unknown="statusUnknown"
        :battery-level="metrics.batteryLevel"
        :power-connected="metrics.powerConnected"
      />

      <div class="flex justify-end -mt-3 -mb-3 relative z-10">
        <button
          type="button"
          class="text-sm text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 transition-colors active:translate-y-px"
          @click="firmwareOpen = true"
        >
          <svg
            class="size-4"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 7.5v3M8 5.2v.4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="M6.8 2.6a1.8 1.8 0 0 1 2.4 0l4.2 3.8a1.8 1.8 0 0 1 .6 1.35V13A1.5 1.5 0 0 1 12.5 14.5h-9A1.5 1.5 0 0 1 2 13V7.75c0-.51.22-1 .6-1.35l4.2-3.8Z"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
          </svg>
          Прошивка
        </button>
      </div>

      <DeviceInfoTab
        :settings="settings"
        :saving="saving"
        :error="saveError"
        :disconnecting="disconnecting"
        :disconnect-error="disconnectError"
        @save="saveSettings"
        @disconnect="onDisconnect"
      />

      <SensorsCard
        :sensors="sensors"
        :loading="sensorsLoading"
        :error="sensorsError"
      />

      <FirmwareModal
        :open="firmwareOpen"
        :device-name="deviceName"
        :device-firmware="deviceFirmware ?? undefined"
        :sensors="sensors"
        @close="firmwareOpen = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ROUTES } from "@/constants/routes";
import DevicePageHeader from "@/components/devices/DevicePageHeader.vue";
import DeviceInfoTab from "@/components/devices/DeviceInfoTab.vue";
import FirmwareModal from "@/components/devices/FirmwareModal.vue";
import SensorsCard from "@/components/devices/SensorsCard.vue";
import { useDeviceDetails } from "@/composables/useDeviceDetails";

const route = useRoute();
const router = useRouter();

const deviceId = computed(() => {
  const id = route.params.id;
  return typeof id === "string" ? id : "";
});

const {
  loading,
  loadError,
  reload,
  deviceName,
  deviceFirmware,
  deviceIsConnected,
  statusUnknown,
  metrics,
  sensors,
  sensorsLoading,
  sensorsError,
  settings,
  saving,
  saveError,
  saveSettings,
  disconnecting,
  disconnectError,
  disconnect,
} = useDeviceDetails(deviceId);

async function onDisconnect() {
  if (await disconnect()) {
    void router.push(ROUTES.DASHBOARD);
  }
}

const firmwareOpen = ref(false);
</script>
