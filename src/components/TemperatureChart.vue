<template>
  <div class="relative">
    <transition name="chart-fade" mode="out-in">
      <!-- TODO(a11y): Give the canvas an accessible label and provide a keyboard/screen-reader-readable data summary or table. -->
      <canvas
        ref="chartCanvas"
        class="chart-canvas"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        @touchmove="onTouchMove"
        @touchend="onMouseLeave"
      />
    </transition>
    <div
      v-if="tooltip.visible"
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <p class="font-semibold text-ink-900">{{ tooltip.value.toFixed(1) }}°C</p>
      <p class="text-ink-500">{{ tooltip.time }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";

const props = defineProps<{
  history: Array<{ time: string; value: number; timestamp: number }>;
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

  const container = chartCanvas.value.parentElement;
  if (container) {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const a = getAdaptive();
    chartCanvas.value.width = a.width * dpr;
    chartCanvas.value.height = a.height * dpr;
    chartCanvas.value.style.width = `${a.width}px`;
    chartCanvas.value.style.height = `${a.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const width = chartCanvas.value.clientWidth;
  const height = chartCanvas.value.clientHeight;
  const a = getAdaptive();
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
  // TODO: Scale X positions and hit testing from timestamps rather than indexes so telemetry gaps are represented truthfully.
  const stepX = chartWidth / (history.length - 1);

  function x(i: number) {
    return padding.left + i * stepX;
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

  ctx.beginPath();
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = a.lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (history.length === 2) {
    ctx.moveTo(x(0), y(history[0]!.value));
    ctx.lineTo(x(1), y(history[1]!.value));
  } else {
    ctx.moveTo(x(0), y(history[0]!.value));
    for (let i = 1; i < history.length - 1; i++) {
      const xMid = (x(i) + x(i + 1)) / 2;
      const yMid = (y(history[i]!.value) + y(history[i + 1]!.value)) / 2;
      ctx.quadraticCurveTo(x(i), y(history[i]!.value), xMid, yMid);
    }
    const last = history.length - 1;
    ctx.lineTo(x(last), y(history[last]!.value));
  }
  ctx.stroke();

  if (highlightIndex !== null && history[highlightIndex]) {
    const item = history[highlightIndex]!;
    const px = x(highlightIndex);
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

  points.value = history.map((_, i) => ({ x: x(i), y: y(history[i]!.value) }));

  ctx.fillStyle = "#64748b";
  ctx.font = `${a.fontSizeX}px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const labelEvery = Math.max(1, Math.ceil(history.length / 6));
  for (let i = 0; i < history.length; i += labelEvery) {
    ctx.fillText(
      formatTime(history[i]!.timestamp),
      x(i),
      height - padding.bottom + 6
    );
  }
}

function getClosestIndex(clientX: number): number | null {
  if (!chartCanvas.value || props.history.length === 0) return null;
  const history = props.history;
  const rect = chartCanvas.value.getBoundingClientRect();
  const x = clientX - rect.left;
  const width = rect.width;
  const a = getAdaptive();
  const paddingLeft = a.paddingLeft;
  const paddingRight = a.paddingRight;
  const chartWidth = width - paddingLeft - paddingRight;
  const stepX = chartWidth / (history.length - 1);

  let closestIndex = 0;
  let closestDist = Infinity;
  history.forEach((_, i) => {
    const px = paddingLeft + i * stepX;
    const dist = Math.abs(x - px);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  });

  return closestDist < stepX * 1.5 ? closestIndex : null;
}

function positionTooltip(index: number) {
  if (!chartCanvas.value || points.value.length === 0) return;
  const point = points.value[index];
  if (!point) return;
  const rect = chartCanvas.value.getBoundingClientRect();
  const tooltipWidth = 110;
  const tooltipHeight = 48;

  // Центрируем по X относительно точки
  let left = point.x - tooltipWidth / 2;
  // По умолчанию сверху от точки
  let top = point.y - tooltipHeight - 8;

  // Если не влезает сверху — показываем снизу
  if (top < 0) {
    top = point.y + 8;
  }

  // Clamping по ширине canvas
  if (left < 4) left = 4;
  if (left + tooltipWidth > rect.width - 4) {
    left = rect.width - tooltipWidth - 4;
  }

  // Clamping по высоте canvas
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

function onMouseMove(event: MouseEvent) {
  const index = getClosestIndex(event.clientX);
  if (index === null) {
    tooltip.value.visible = false;
    drawChart(null);
    return;
  }
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

function onTouchMove(event: TouchEvent) {
  const touch = event.touches?.[0];
  if (!touch) return;
  const index = getClosestIndex(touch.clientX);
  if (index === null) {
    tooltip.value.visible = false;
    drawChart(null);
    return;
  }
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

// TODO: Disconnect the ResizeObserver on unmount so detached charts and component closures are released.
let resizeObserver: ResizeObserver | null = null;
onMounted(async () => {
  await nextTick();
  drawChart();
  if (typeof window !== "undefined" && "ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => drawChart());
    if (chartCanvas.value) resizeObserver.observe(chartCanvas.value);
  }
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

.chart-fade-enter-active,
.chart-fade-leave-active {
  transition: opacity 0.3s ease;
}
.chart-fade-enter-from,
.chart-fade-leave-to {
  opacity: 0;
}
</style>
