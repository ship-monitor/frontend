<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6">
    <div
      v-if="loading"
      class="space-y-6"
    >
      <div class="h-8 w-48 bg-ink-100 rounded-lg animate-pulse" />
      <div class="app-card p-6 space-y-4">
        <div class="h-12 w-32 bg-ink-100 rounded-lg animate-pulse" />
        <div class="h-[220px] bg-ink-100 rounded-xl animate-pulse" />
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
        class="px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold active:translate-y-px"
        @click="reload"
      >
        Повторить
      </button>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <div class="mb-2">
        <RouterLink
          :to="route.deviceDetails(deviceId)"
          class="text-sm text-ink-500 hover:text-ink-700 mb-3 inline-flex items-center gap-1 touch-target transition-colors"
        >
          <IconArrowToLeft class="size-4" />
          {{ sensor?.displayName ? "К устройству" : "Назад" }}
        </RouterLink>
        <h1
          class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight"
        >
          {{ sensor?.displayName || "Датчик" }}
        </h1>
      </div>

      <div class="app-card p-6">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 class="text-lg font-bold text-ink-900">
              Температура
              <span class="text-xs font-normal text-ink-400">за последний час</span>
            </h2>
            <p
              v-if="temperature.updatedAt !== null"
              class="text-sm text-ink-500 mt-1"
            >
              обновлено {{ new Date(temperature.updatedAt).toLocaleTimeString("ru") }}
            </p>
          </div>
          <span
            v-if="temperature.current !== null"
            class="text-4xl sm:text-5xl font-bold text-ink-900 tabular-nums"
          >{{ temperature.current.toFixed(1) }}°C</span>
        </div>

        <div
          v-if="temperatureError"
          class="flex flex-col items-center gap-3 py-10 text-center"
        >
          <p class="text-sm text-red-600">
            {{ temperatureError }}
          </p>
          <button
            class="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold active:translate-y-px"
            @click="reloadTemperature"
          >
            Загрузить снова
          </button>
        </div>

        <div
          v-else-if="temperature.current === null"
          class="flex flex-col items-center gap-2 py-10 text-center"
        >
          <p class="text-sm text-ink-500">
            Датчик ещё не отправил данные о температуре.
          </p>
          <p class="text-xs text-ink-400">
            Показания появляются в течение минуты после подключения датчика.
          </p>
        </div>

        <TemperatureChart
          v-else
          :history="chartHistory"
        />
      </div>

      <div
        v-if="sensor?.firmware"
        class="app-card p-6"
      >
        <h2 class="text-lg font-bold text-ink-900 mb-4">
          О датчике
        </h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div class="flex justify-between sm:block">
            <dt class="text-ink-500">
              Производитель
            </dt>
            <dd class="text-ink-900 font-medium">
              {{ sensor.firmware.manufacturer }}
            </dd>
          </div>
          <div class="flex justify-between sm:block">
            <dt class="text-ink-500">
              Модель
            </dt>
            <dd class="text-ink-900 font-medium">
              {{ sensor.firmware.model }}
            </dd>
          </div>
          <div class="flex justify-between sm:block">
            <dt class="text-ink-500">
              Ревизия
            </dt>
            <dd class="text-ink-900 font-medium">
              {{ sensor.firmware.revision }}
            </dd>
          </div>
          <div class="flex justify-between sm:block">
            <dt class="text-ink-500">
              ПО
            </dt>
            <dd class="text-ink-900 font-medium">
              {{ sensor.firmware.software }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import IconArrowToLeft from "@/components/icons/IconArrowToLeft.vue";
import TemperatureChart from "@/components/devices/TemperatureChart.vue";
import { route } from "@/constants/routes";
import { useSensorDetails } from "@/composables/useSensorDetails";

const routeParams = useRoute();

const deviceId = computed(() => {
  const id = routeParams.params.deviceId;
  return typeof id === "string" ? id : "";
});

const sensorId = computed(() => {
  const id = routeParams.params.sensorId;
  return typeof id === "string" ? id : "";
});

const {
  loading,
  loadError,
  reload,
  sensor,
  temperature,
  temperatureError,
  reloadTemperature,
} = useSensorDetails(deviceId, sensorId);

const CHART_WINDOW_MS = 60 * 60 * 1000;

const chartHistory = computed(() => {
  const history = temperature.value.history;
  if (history.length === 0) return [];
  const cutoff = history[history.length - 1]!.timestamp - CHART_WINDOW_MS;
  return history
    .filter((point) => point.timestamp >= cutoff)
    .map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString("ru"),
      value: point.value,
      timestamp: point.timestamp,
    }));
});
</script>
