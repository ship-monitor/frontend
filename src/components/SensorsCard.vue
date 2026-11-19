<template>
  <div class="ship-card p-6">
    <h2 class="text-lg font-bold text-ink-900 mb-4">
      Датчики
    </h2>

    <div
      v-if="loading"
      class="text-sm text-ink-400 py-4 text-center"
    >
      Загрузка...
    </div>

    <div
      v-else-if="error"
      class="text-sm text-red-600 py-2"
    >
      {{ error }}
    </div>

    <p
      v-else-if="sensors.length === 0"
      class="text-sm text-ink-400 py-4 text-center"
    >
      Нет подключённых датчиков
    </p>

    <ul
      v-else
      class="grid grid-cols-2"
    >
      <li
        v-for="sensor in sensors"
        :key="sensor.id"
      >
        <SensorCard :sensor="sensor" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { type Sensor } from "@/data";
import SensorCard from "@/components/SensorCard.vue";

defineProps<{
  sensors: Sensor[];
  loading: boolean;
  error?: string;
}>();
</script>
