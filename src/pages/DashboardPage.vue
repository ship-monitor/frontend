<template>
  <div class="space-y-5 sm:space-y-6 animate-fade-in">
    <!-- Заголовок -->
    <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
      Мониторинг
    </h1>

    <!-- Поиск и фильтры -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <label
          class="sr-only"
          for="dashboard-search"
        >
          Поиск по названию или ID устройства
        </label>
        <input
          id="dashboard-search"
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по названию..."
          class="app-field pl-10"
        >
        <svg
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <label
        class="sr-only"
        for="dashboard-status-filter"
      >
        Фильтр по статусу
      </label>
      <select
        id="dashboard-status-filter"
        v-model="statusFilter"
        class="app-field sm:w-44 cursor-pointer"
      >
        <option value="all">
          Все статусы
        </option>
        <option value="online">
          В сети
        </option>
        <option value="offline">
          Не в сети
        </option>
        <option value="error">
          Ошибка
        </option>
      </select>
    </div>

    <!-- Ошибка загрузки -->
    <div
      v-if="devicesStore.loadError"
      class="app-card p-8 text-center animate-scale-in"
    >
      <p class="text-lg font-semibold text-ink-900 mb-1">
        Не удалось загрузить устройства
      </p>
      <p class="text-sm text-red-600 mb-4">
        {{ devicesStore.loadError }}
      </p>
      <button
        class="px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
        @click="devicesStore.load()"
      >
        Повторить
      </button>
    </div>

    <!-- Загрузка (skeleton) -->
    <div
      v-else-if="devicesStore.loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="app-card p-5"
      >
        <div class="skeleton h-5 w-32 mb-3" />
        <div class="skeleton h-3 w-20 mb-6" />
        <div class="skeleton h-12 w-24 mx-auto" />
      </div>
    </div>

    <!-- Пусто -->
    <div
      v-else-if="
        filteredDevices.length === 0 && !searchQuery && statusFilter === 'all'
      "
      class="app-card p-8 sm:p-12 text-center animate-scale-in"
    >
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ink-100 flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-ink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      </div>
      <p class="text-lg font-semibold text-ink-900 mb-1">
        Нет подключенных устройств
      </p>
      <p class="text-sm text-ink-500 mb-5">
        Подключите устройство, чтобы начать мониторинг
      </p>
      <router-link
        :to="ROUTES.CONNECT_DEVICE"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
      >
        Подключить устройство
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </router-link>
    </div>

    <!-- Ничего не найдено -->
    <div
      v-else-if="filteredDevices.length === 0"
      class="app-card p-8 text-center text-ink-500 animate-scale-in"
    >
      <p class="text-sm">
        Ничего не найдено
      </p>
      <button
        class="mt-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
        @click="
          searchQuery = '';
          statusFilter = 'all';
        "
      >
        Сбросить фильтры
      </button>
    </div>

    <!-- Сетка устройств -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      <device-card
        v-for="device in filteredDevices"
        :key="device.id"
        :device="device"
        :sensors="devicesStore.sensorsByDevice[device.id]"
        :sensors-loading="!devicesStore.sensorsLoaded"
        @reload-sensors="devicesStore.loadSensors()"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onActivated, watch } from "vue";
import { ROUTES } from "@/constants/routes";
import { useDevicesStore } from "@/stores/devicesStore";
import DeviceCard from "@/components/devices/DeviceCard.vue";

const devicesStore = useDevicesStore();

const searchQuery = ref("");
const statusFilter = ref("all");

const filteredDevices = computed(() => {
  let result = devicesStore.devices;

  if (statusFilter.value === "online") {
    result = result.filter((d) => d.status === "online");
  } else if (statusFilter.value === "offline") {
    result = result.filter(
      (d) => d.status === "offline" || d.status === "error"
    );
  } else if (statusFilter.value === "error") {
    result = result.filter((d) => d.status === "error");
  }

  const query = searchQuery.value.toLowerCase().trim();
  if (query) {
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.id.toLowerCase().includes(query)
    );
  }

  return result;
});

onMounted(async () => {
  await devicesStore.load();
  void devicesStore.loadSensors();
  devicesStore.startAutoRefresh();
});

onActivated(async () => {
  await devicesStore.load();
  void devicesStore.loadSensors();
  devicesStore.startAutoRefresh();
});

onUnmounted(() => {
  devicesStore.stopAutoRefresh();
});

// Появился новый хаб — догружаем его датчики.
watch(
  () => devicesStore.devices.map((device) => device.id).join(","),
  () => {
    if (devicesStore.sensorsLoaded) {
      void devicesStore.loadSensors();
    }
  }
);
</script>
