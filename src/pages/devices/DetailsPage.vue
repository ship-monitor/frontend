<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6">
    <div
      v-if="loading"
      class="space-y-6 animate-fade-in"
      aria-label="Загрузка устройства"
    >
      <div class="space-y-3">
        <div class="skeleton h-4 w-20" />
        <div class="skeleton h-8 w-64" />
        <div class="skeleton h-3 w-44" />
      </div>
      <div class="app-card p-6 space-y-6">
        <div class="skeleton h-5 w-44" />
        <div class="skeleton h-11 w-full" />
        <div class="skeleton h-10 w-40 ml-auto" />
      </div>
      <div class="app-card">
        <div class="px-6 pt-5 pb-4">
          <div class="skeleton h-5 w-20" />
        </div>
        <div class="border-t border-ink-100 divide-y divide-ink-100">
          <div
            v-for="i in 3"
            :key="i"
            class="px-6 py-4 flex items-center gap-4"
          >
            <div class="skeleton h-3.5 w-5" />
            <div class="flex-1 space-y-2">
              <div class="skeleton h-3.5 w-36" />
              <div class="skeleton h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
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
        class="px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold active:scale-[0.98]"
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
