<template>
  <div class="relative">
    <canvas
      ref="chartCanvas"
      class="chart-canvas"
      role="img"
      :aria-label="summaryLabel"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      @touchmove="onTouchMove"
      @touchend="onMouseLeave"
    />
    <div
      v-if="tooltip.visible"
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <p class="font-semibold text-ink-900">
        {{ tooltip.value.toFixed(1) }}°C
      </p>
      <p class="text-ink-500">
        {{ tooltip.time }}
      </p>
    </div>
    <!-- Текстовая альтернатива для скринридеров -->
    <table class="sr-only">
      <caption>История температуры</caption>
      <thead>
        <tr>
          <th scope="col">
            Время
          </th>
          <th scope="col">
            Температура
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in recentHistory"
          :key="`${item.timestamp}-${index}`"
        >
          <td>{{ new Date(item.timestamp).toLocaleString("ru") }}</td>
          <td>{{ item.value.toFixed(1) }} °C</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps<{
  history: Array<{ time: string; value: number; timestamp: number }>;
  thresholds?: { min: number; max: number };
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  value: 0,
  time: "",
});

const points = ref<Array<{ x: number; y: number }>>([]);

const recentHistory = computed(() => props.history.slice(-12));

const summaryLabel = computed(() => {
  if (props.history.length === 0) return "График температуры: нет данных";
  const values = props.history.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const last = props.history[props.history.length - 1];
  return `График температуры за период: минимум ${min.toFixed(1)} градуса, максимум ${max.toFixed(1)} градуса, последнее значение ${last?.value.toFixed(1)} градуса в ${new Date(last?.timestamp ?? Date.now()).toLocaleString("ru")}. Всего точек: ${props.history.length}.`;
});

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
}

function getAdaptive() {
  if (!chartCanvas.value) {
    return {
      width: 320,
      height: 260,
      paddingTop: 16,
      paddingRight: 12,
      paddingBottom: 24,
      paddingLeft: 32,
      fontSizeY: 11,
      fontSizeX: 10,
      lineWidth: 2,
    };
  }
  const width = chartCanvas.value.clientWidth || window.innerWidth;
  const isMobile = width < 480;
  return {
    width,
    height: isMobile ? 220 : 340,
    paddingTop: isMobile ? 12 : 18,
    paddingRight: isMobile ? 10 : 14,
    paddingBottom: isMobile ? 22 : 26,
    paddingLeft: isMobile ? 28 : 36,
    fontSizeY: isMobile ? 10 : 12,
    fontSizeX: isMobile ? 9 : 11,
    lineWidth: isMobile ? 1.6 : 2.4,
  };
}

function drawChart(highlightIndex: number | null = null) {
  if (!chartCanvas.value) return;
  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const a = getAdaptive();
  chartCanvas.value.width = a.width * dpr;
  chartCanvas.value.height = a.height * dpr;
  chartCanvas.value.style.width = `${a.width}px`;
  chartCanvas.value.style.height = `${a.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = a.width;
  const height = a.height;
  const padding = {
    top: a.paddingTop,
    right: a.paddingRight,
    bottom: a.paddingBottom,
    left: a.paddingLeft,
  };
  ctx.clearRect(0, 0, width, height);

  const history = props.history;
  if (history.length < 2) {
    ctx.fillStyle = "#64748b";
    ctx.font =
      "14px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Недостаточно данных", width / 2, height / 2);
    return;
  }

  const values = history.map((d) => d.value);
  const minVal = Math.min(...values) - 1;
  const maxVal = Math.max(...values) + 1;
  const range = maxVal - minVal || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // X масштабируется по времени, а не по индексу:
  // пропуски в телеметрии отображаются честно.
  const tFirst = history[0]!.timestamp;
  const tLast = history[history.length - 1]!.timestamp;
  const timeRange = tLast - tFirst || 1;

  function x(timestamp: number) {
    return padding.left + (chartWidth * (timestamp - tFirst)) / timeRange;
  }
  function y(value: number) {
    return padding.top + chartHeight * ((maxVal - value) / range);
  }

  ctx.strokeStyle = "#e2e8f0";
  ctx.fillStyle = "#64748b";
  ctx.font = `${a.fontSizeY}px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 4; i++) {
    const value = maxVal - (range * i) / 4;
    const yy = y(value);
    ctx.beginPath();
    ctx.moveTo(padding.left, yy);
    ctx.lineTo(width - padding.right, yy);
    ctx.stroke();
    ctx.fillText(value.toFixed(1) + "°", padding.left - 6, yy);
  }

  // Пороговые линии, если заданы
  if (props.thresholds) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    for (const threshold of [props.thresholds.min, props.thresholds.max]) {
      if (threshold < minVal || threshold > maxVal) continue;
      const ty = y(threshold);
      ctx.beginPath();
      ctx.moveTo(padding.left, ty);
      ctx.lineTo(width - padding.right, ty);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.beginPath();
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = a.lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (history.length === 2) {
    ctx.moveTo(x(history[0]!.timestamp), y(history[0]!.value));
    ctx.lineTo(x(history[1]!.timestamp), y(history[1]!.value));
  } else {
    ctx.moveTo(x(history[0]!.timestamp), y(history[0]!.value));
    for (let i = 1; i < history.length - 1; i++) {
      const xMid = (x(history[i]!.timestamp) + x(history[i + 1]!.timestamp)) / 2;
      const yMid = (y(history[i]!.value) + y(history[i + 1]!.value)) / 2;
      ctx.quadraticCurveTo(
        x(history[i]!.timestamp),
        y(history[i]!.value),
        xMid,
        yMid
      );
    }
    const last = history.length - 1;
    ctx.lineTo(x(history[last]!.timestamp), y(history[last]!.value));
  }
  ctx.stroke();

  if (highlightIndex !== null && history[highlightIndex]) {
    const item = history[highlightIndex]!;
    const px = x(item.timestamp);
    const py = y(item.value);
    ctx.fillStyle = "#059669";
    ctx.beginPath();
    ctx.arc(px, py, Math.max(4, a.lineWidth * 2.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.8, a.lineWidth), 0, Math.PI * 2);
    ctx.fill();
  }

  points.value = history.map((item) => ({
    x: x(item.timestamp),
    y: y(item.value),
  }));

  ctx.fillStyle = "#64748b";
  ctx.font = `${a.fontSizeX}px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const labelEvery = Math.max(1, Math.ceil(history.length / 6));
  for (let i = 0; i < history.length; i += labelEvery) {
    ctx.fillText(
      formatTime(history[i]!.timestamp),
      x(history[i]!.timestamp),
      height - padding.bottom + 6
    );
  }
}

function getClosestIndex(clientX: number): number | null {
  if (!chartCanvas.value || props.history.length === 0) return null;
  const rect = chartCanvas.value.getBoundingClientRect();
  const targetX = clientX - rect.left;

  let closestIndex = 0;
  let closestDist = Infinity;
  points.value.forEach((point, i) => {
    const dist = Math.abs(targetX - point.x);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  });

  const a = getAdaptive();
  const minSpacing = a.paddingLeft;
  return closestDist < minSpacing ? closestIndex : null;
}

function positionTooltip(index: number) {
  if (!chartCanvas.value || points.value.length === 0) return;
  const point = points.value[index];
  if (!point) return;
  const rect = chartCanvas.value.getBoundingClientRect();
  const tooltipWidth = 110;
  const tooltipHeight = 48;

  let left = point.x - tooltipWidth / 2;
  let top = point.y - tooltipHeight - 8;

  if (top < 0) {
    top = point.y + 8;
  }
  if (left < 4) left = 4;
  if (left + tooltipWidth > rect.width - 4) {
    left = rect.width - tooltipWidth - 4;
  }
  if (top < 4) top = 4;
  if (top + tooltipHeight > rect.height - 4) {
    top = rect.height - tooltipHeight - 4;
  }

  tooltip.value = {
    visible: true,
    x: left,
    y: top,
    value: tooltip.value.value,
    time: tooltip.value.time,
  };
}

function showTooltipAt(index: number) {
  const item = props.history[index];
  if (!item) return;
  tooltip.value = {
    visible: true,
    value: item.value,
    time: item.time,
    x: 0,
    y: 0,
  };
  drawChart(index);
  positionTooltip(index);
}

function onMouseMove(event: MouseEvent) {
  const index = getClosestIndex(event.clientX);
  if (index === null) {
    tooltip.value.visible = false;
    drawChart(null);
    return;
  }
  showTooltipAt(index);
}

function onTouchMove(event: TouchEvent) {
  const touch = event.touches?.[0];
  if (!touch) return;
  const index = getClosestIndex(touch.clientX);
  if (index === null) {
    tooltip.value.visible = false;
    drawChart(null);
    return;
  }
  showTooltipAt(index);
}

function onMouseLeave() {
  tooltip.value.visible = false;
  drawChart(null);
}

watch(
  () => props.history,
  async () => {
    await nextTick();
    drawChart();
  },
  { deep: true }
);

let resizeObserver: ResizeObserver | null = null;
onMounted(async () => {
  await nextTick();
  drawChart();
  if (typeof window !== "undefined" && "ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => drawChart());
    if (chartCanvas.value) resizeObserver.observe(chartCanvas.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<style scoped>
.chart-canvas {
  display: block;
  width: 100% !important;
}

.chart-tooltip {
  pointer-events: none;
  position: absolute;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.97);
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  line-height: 1.25;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translate(0, 0);
  will-change: left, top;
}
</style>
