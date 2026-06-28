<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl border p-6 text-center">
      <p class="text-sm text-gray-500 mb-2">Текущая температура</p>
      <transition name="temp-fade" mode="out-in">
        <div
          v-if="currentTemp"
          class="text-6xl font-bold mb-2"
          :class="tempColor"
        >
          {{ (currentTemp.value as number).toFixed(1) + "°C" }}
        </div>
      </transition>
      <p class="text-xs text-gray-400 mb-4">
        {{ lastTempTime || "Нет данных" }}
      </p>
      <ShipButton @click="$emit('refresh')" :disabled="loading" class="px-6">
        {{ loading ? "Запрос..." : "Запросить температуру" }}
      </ShipButton>
      <transition name="error-fade" mode="out-in">
        <p
          v-if="error"
          :key="error"
          class="text-xs mt-2"
          :class="error.includes('Ошибка') ? 'text-red-500' : 'text-gray-500'"
        >
          {{ error }}
        </p>
      </transition>
    </div>

    <PeriodTabs
      :selected-period="selectedPeriod"
      :periods="periods"
      @select="$emit('update:period', $event)"
    />

    <div class="bg-white rounded-xl border p-6">
      <h2 class="text-lg font-semibold mb-4">График температуры</h2>
      <transition name="chart-empty-fade" mode="out-in">
        <div
          v-if="history.length === 0"
          key="empty"
          class="text-center py-12 text-gray-500"
        >
          Нет данных за выбранный период
        </div>
        <div v-else key="chart">
          <TemperatureChart :history="filteredHistory" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, nextTick } from "vue";
import { type DeviceStateRecord } from "@/data";

import ShipButton from "@/components/ShipButton.vue";
import PeriodTabs from "@/components/PeriodTabs.vue";
import TemperatureChart from "@/components/TemperatureChart.vue";

const props = defineProps<{
  currentTemp: DeviceStateRecord<number> | null;
  lastTempTime: string;
  error: string;
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
  { label: "Час", value: "1h", ms: 60 * 60 * 1000 },
  { label: "2 часа", value: "2h", ms: 2 * 60 * 60 * 1000 },
  { label: "3 часа", value: "3h", ms: 3 * 60 * 60 * 1000 },
  { label: "6 часов", value: "6h", ms: 6 * 60 * 60 * 1000 },
  { label: "12 часов", value: "12h", ms: 12 * 60 * 60 * 1000 },
  { label: "1 день", value: "1d", ms: 24 * 60 * 60 * 1000 },
  { label: "2 дня", value: "2d", ms: 48 * 60 * 60 * 1000 },
];

const tempColor = computed(() => {
  if (!props.isConnected) return "text-gray-400";
  if (props.currentTemp === null) return "text-gray-400";
  const t = props.currentTemp.value;
  if (t < props.thresholds.min || t > props.thresholds.max)
    return "text-red-600";
  if (t < -20) return "text-blue-600";
  if (t < -10) return "text-blue-500";
  if (t < 0) return "text-cyan-500";
  if (t < 10) return "text-green-500";
  if (t < 25) return "text-lime-500";
  return "text-orange-500";
});

const filteredHistory = computed(() => {
  const period = periods.find((p) => p.value === props.selectedPeriod);
  if (!period) return props.history;
  const cutoff = Date.now() - period.ms;
  return props.history.filter((item) => item.timestamp >= cutoff);
});

watch(
  filteredHistory,
  async () => {
    await nextTick();
  },
  { deep: true }
);
onMounted(async () => {
  await nextTick();
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
