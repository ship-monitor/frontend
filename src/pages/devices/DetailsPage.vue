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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ROUTES } from "@/constants/routes";
import DevicePageHeader from "@/components/devices/DevicePageHeader.vue";
import DeviceInfoTab from "@/components/devices/DeviceInfoTab.vue";
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
</script>
