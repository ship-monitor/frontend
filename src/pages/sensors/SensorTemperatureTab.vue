<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl border p-6 text-center">
      <p class="text-sm text-gray-500 mb-2">Текущая температура</p>
      <div class="text-6xl font-bold mb-2" :class="tempColor">
        {{ currentTemp !== null ? currentTemp.toFixed(1) + "°C" : "--" }}
      </div>
      <p class="text-xs text-gray-400 mb-4">
        {{ lastTempTime || "Нет данных" }}
      </p>
      <button
        @click="$emit('refresh')"
        :disabled="loading"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm touch-target"
      >
        {{ loading ? "Запрос..." : "Запросить температуру" }}
      </button>
      <p
        v-if="error"
        class="text-xs mt-2"
        :class="error.includes('Ошибка') ? 'text-red-500' : 'text-gray-500'"
      >
        {{ error }}
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="$emit('update:period', period.value)"
        :class="[
          'px-4 py-2 text-sm rounded-lg transition-colors touch-target',
          selectedPeriod === period.value
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ]"
      >
        {{ period.label }}
      </button>
    </div>

    <div class="bg-white rounded-xl border p-6">
      <h2 class="text-lg font-semibold mb-4">График температуры</h2>
      <div v-if="history.length === 0" class="text-center py-12 text-gray-500">
        Нет данных за выбранный период
      </div>
      <div v-else>
        <canvas ref="chartCanvas" class="w-full h-64 sm:h-96"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";

const props = defineProps<{
  currentTemp: number | null;
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

const chartCanvas = ref<HTMLCanvasElement | null>(null);

const tempColor = computed(() => {
  if (!props.isConnected) return "text-gray-400";
  if (props.currentTemp === null) return "text-gray-400";
  const t = props.currentTemp;
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

function drawChart() {
  if (!chartCanvas.value || filteredHistory.value.length === 0) return;
  const canvas = chartCanvas.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth - 32;
    canvas.height = 300;
  }

  const { width, height } = canvas;
  const padding = 40;
  ctx.clearRect(0, 0, width, height);

  if (filteredHistory.value.length < 2) {
    ctx.fillStyle = "#999";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Недостаточно данных", width / 2, height / 2);
    return;
  }

  const values = filteredHistory.value.map((d) => d.value);
  const minVal = Math.min(...values) - 2;
  const maxVal = Math.max(...values) + 2;
  const range = maxVal - minVal || 1;
  const stepX = (width - padding * 2) / (filteredHistory.value.length - 1);

  ctx.strokeStyle = "#e5e7eb";
  ctx.fillStyle = "#9ca3af";
  ctx.font = "11px sans-serif";
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height - padding * 2) * (i / 4);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    ctx.fillText((maxVal - (range * i) / 4).toFixed(1) + "C", 5, y + 3);
  }

  ctx.beginPath();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  filteredHistory.value.forEach((item, i) => {
    const x = padding + i * stepX;
    const y =
      padding + (height - padding * 2) * ((maxVal - item.value) / range);
    return i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  filteredHistory.value.forEach((item, i) => {
    const x = padding + i * stepX;
    const y =
      padding + (height - padding * 2) * ((maxVal - item.value) / range);
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

watch(
  filteredHistory,
  async () => {
    await nextTick();
    drawChart();
  },
  { deep: true }
);
onMounted(async () => {
  await nextTick();
  drawChart();
});
</script>
