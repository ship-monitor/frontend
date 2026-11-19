<template>
  <div class="app-card">
    <div class="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between gap-3">
      <h2 class="text-base font-bold text-ink-900">
        Датчики
      </h2>
      <span
        v-if="!loading && !error && sensors.length > 0"
        class="font-mono text-xs text-ink-400 num"
      >
        {{ sensors.length }}
      </span>
    </div>

    <div class="border-t border-ink-100">
      <div
        v-if="loading"
        class="divide-y divide-ink-100"
        aria-label="Загрузка датчиков"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="px-5 sm:px-6 py-4 flex items-center gap-4"
        >
          <div class="skeleton h-3.5 w-5" />
          <div class="flex-1 space-y-2">
            <div class="skeleton h-3.5 w-36" />
            <div class="skeleton h-3 w-24" />
          </div>
          <div class="skeleton h-3 w-16 hidden sm:block" />
        </div>
      </div>

      <div
        v-else-if="error"
        class="px-5 sm:px-6 py-6"
        role="alert"
      >
        <p class="text-sm font-semibold text-red-700 mb-1">
          Не удалось загрузить датчики
        </p>
        <p class="text-sm text-ink-500">
          {{ error }}
        </p>
      </div>

      <div
        v-else-if="sensors.length === 0"
        class="px-5 sm:px-6 py-8 flex items-start gap-3.5"
      >
        <span class="size-9 shrink-0 rounded-lg bg-ink-100 flex items-center justify-center">
          <svg
            class="size-5 text-ink-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"
            />
          </svg>
        </span>
        <div>
          <p class="text-sm font-semibold text-ink-900 mb-0.5">
            Датчики не подключены
          </p>
          <p class="text-sm text-ink-500">
            Подключите датчики к контроллеру — они появятся в этом списке
            автоматически.
          </p>
        </div>
      </div>

      <ul
        v-else
        class="divide-y divide-ink-100"
      >
        <li
          v-for="(sensor, index) in sensors"
          :key="sensor.id"
        >
          <SensorCard
            :sensor="sensor"
            :index="index + 1"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Sensor } from "@/data";
import SensorCard from "@/components/devices/SensorCard.vue";

defineProps<{
  sensors: Sensor[];
  loading: boolean;
  error?: string;
}>();
</script>
