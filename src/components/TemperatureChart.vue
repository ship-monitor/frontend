<template>
  <div class="relative">
    <transition name="chart-fade" mode="out-in">
      <canvas
        ref="chartCanvas"
        class="w-full h-80 sm:h-[28rem]"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      />
    </transition>
    <div
      v-if="tooltip.visible"
      class="pointer-events-none absolute rounded-lg border bg-white/95 px-3 py-2 text-xs shadow-sm"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <p class="font-semibold text-gray-800">{{ tooltip.value.toFixed(1) }}°C</p>
      <p class="text-gray-500">{{ tooltip.time }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";

const props = defineProps<{
  history: Array<{ time: string; value: number; timestamp: number }>;
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);

const filteredHistory = computed(() => props.history);

const tooltip = ref<{
  visible: boolean;
  x: number;
  y: number;
  value: number;
  time: string;
}>({
  visible: false,
  x: 0,
  y: 0,
  value: 0,
  time: "",
});

function drawChart(highlightIndex: number | null = null) {
  if (!chartCanvas.value || filteredHistory.value.length === 0) return;
  const canvas = chartCanvas.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth - 32;
    canvas.height = 360;
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
    const isHighlighted = highlightIndex === i;
    ctx.fillStyle = isHighlighted ? "#1d4ed8" : "#3b82f6";
    ctx.beginPath();
    ctx.arc(x, y, isHighlighted ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function getPointAtEvent(event: MouseEvent) {
  if (!chartCanvas.value || filteredHistory.value.length === 0) return null;
  const rect = chartCanvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const width = chartCanvas.value.width;
  const padding = 40;
  const stepX = (width - padding * 2) / (filteredHistory.value.length - 1);

  let closestIndex = 0;
  let closestDist = Infinity;
  filteredHistory.value.forEach((_, i) => {
    const px = padding + i * stepX;
    const dist = Math.abs(x - px);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  });

  return closestIndex;
}

function onMouseMove(event: MouseEvent) {
  const index = getPointAtEvent(event);
  if (index === null) return;
  const item = filteredHistory.value[index];
  if (!item) return;
  tooltip.value = {
    visible: true,
    x: event.offsetX + 12,
    y: event.offsetY - 12,
    value: item.value,
    time: item.time,
  };
  drawChart(index);
}

function onMouseLeave() {
  tooltip.value.visible = false;
  drawChart(null);
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
