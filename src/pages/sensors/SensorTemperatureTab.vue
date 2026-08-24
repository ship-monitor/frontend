<template>
  <div class="space-y-6">
    <div class="ship-card p-6 text-center">
      <p class="text-sm text-ink-500 mb-2">
        Текущая температура
      </p>
      <transition
        name="temp-fade"
        mode="out-in"
      >
        <div
          v-if="currentTemp"
          key="value"
          class="text-6xl font-bold mb-2"
          :class="tempColor"
        >
          {{ (currentTemp.value as number).toFixed(1) + "°C" }}
        </div>
        <div
          v-else
          key="empty"
          class="text-6xl font-bold mb-2 text-ink-400"
        >
          --
        </div>
      </transition>
      <p class="text-xs text-ink-400 mb-4">
        {{ lastTempTime || "Нет данных" }}
        <span
          v-if="stale"
          class="text-amber-600"
        >(данные могли устареть)</span>
      </p>
      <ShipButton
        :disabled="loading"
        class="px-6"
        @click="$emit('refresh')"
      >
        {{ loading ? "Запрос..." : "Запросить температуру" }}
      </ShipButton>
      <transition
        name="error-fade"
        mode="out-in"
      >
        <p
          v-if="error"
          :key="error"
          role="alert"
          class="text-xs mt-2 text-red-500"
        >
          {{ error }}
        </p>
      </transition>
    </div>

    <PeriodTabs
      :selected-period="selectedPeriod"
      :periods="periods"
      @update:selected-period="$emit('update:period', $event)"
    />

    <div class="ship-card p-6">
      <h2 class="text-lg font-bold text-ink-900 mb-4">
        График температуры
      </h2>
      <transition
        name="chart-empty-fade"
        mode="out-in"
      >
        <div
          v-if="filteredHistory.length === 0"
          key="empty"
          class="text-center py-12 text-ink-500"
        >
          Нет данных за выбранный период
        </div>
        <div
          v-else
          key="chart"
          class="space-y-2"
        >
          <TemperatureChart
            :history="filteredHistory"
            :thresholds="thresholds"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type DeviceStateRecord } from "@/data";

import ShipButton from "@/components/ShipButton.vue";
import PeriodTabs from "@/components/PeriodTabs.vue";
import TemperatureChart from "@/components/TemperatureChart.vue";

const props = defineProps<{
  currentTemp: DeviceStateRecord<number> | null;
  lastTempTime: string;
  error: string;
  stale?: boolean;
  loading: boolean;
  selectedPeriod: string;
  history: Array<{ time: string; value: number; timestamp: number }>;
  thresholds: { min: number; max: number };
  isConnected: boolean;
}>();

defineEmits<{
  refresh: [];
  "update:period": [value: string];
}>();

const periods = [
  { label: "12 часов", value: "12h", ms: 12 * 60 * 60 * 1000 },
  { label: "24 часа", value: "24h", ms: 24 * 60 * 60 * 1000 },
  { label: "48 часов", value: "48h", ms: 48 * 60 * 60 * 1000 },
];

const tempColor = computed(() => {
  if (!props.isConnected) return "text-ink-400";
  if (props.currentTemp === null) return "text-ink-400";
  const t = props.currentTemp.value;
  if (t < props.thresholds.min || t > props.thresholds.max)
    return "text-red-600";
  if (t < -20) return "text-blue-600";
  if (t < -10) return "text-blue-500";
  if (t < 0) return "text-cyan-500";
  if (t < 10) return "text-brand-500";
  if (t < 25) return "text-lime-500";
  return "text-orange-500";
});

const filteredHistory = computed(() => {
  const period = periods.find((p) => p.value === props.selectedPeriod);
  if (!period) return props.history;
  const cutoff = Date.now() - period.ms;
  return props.history.filter((item) => item.timestamp >= cutoff);
});
</script>

<style scoped>
.temp-fade-enter-active,
.temp-fade-leave-active {
  transition: opacity 0.2s ease;
}
.temp-fade-enter-from,
.temp-fade-leave-to {
  opacity: 0;
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: opacity 0.2s ease;
}
.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
}

.chart-empty-fade-enter-active,
.chart-empty-fade-leave-active {
  transition: opacity 0.2s ease;
}
.chart-empty-fade-enter-from,
.chart-empty-fade-leave-to {
  opacity: 0;
}
</style>
