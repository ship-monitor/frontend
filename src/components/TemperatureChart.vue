<template>
  <transition name="chart-fade" mode="out-in">
    <canvas ref="chartCanvas" class="w-full h-64 sm:h-96"></canvas>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";

const props = defineProps<{
  history: Array<{ time: string; value: number; timestamp: number }>;
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);

const filteredHistory = computed(() => props.history);

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

<style scoped>
.chart-fade-enter-active,
.chart-fade-leave-active {
  transition: opacity 0.3s ease;
}
.chart-fade-enter-from,
.chart-fade-leave-to {
  opacity: 0;
}
</style>
