<template>
  <section class="border-t border-ink-200 pt-5">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
      <h2 class="text-lg font-bold text-ink-900">
        <button
          type="button"
          class="inline-flex items-center gap-2 cursor-pointer rounded-lg transition-colors"
          :aria-expanded="open"
          @click="open = !open"
        >
          Датчики
          <svg
            class="size-5 text-ink-400 transition-transform duration-200"
            :class="open ? 'rotate-180' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </h2>

      <div
        v-if="open && devices.length > 1"
        class="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1"
        role="tablist"
        aria-label="Выбор хаба"
      >
        <button
          v-for="hub in devices"
          :key="hub.id"
          type="button"
          role="tab"
          :aria-selected="hub.id === selectedHubId"
          class="px-4 py-2 rounded-full border text-xs font-medium whitespace-nowrap transition-colors active:translate-y-px cursor-pointer"
          :class="
            hub.id === selectedHubId
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-ink-600 border-ink-200 hover:border-ink-300'
          "
          @click="selectedHubId = hub.id"
        >
          {{ hub.name }}
        </button>
      </div>
    </div>

    <div
      v-if="open"
      class="animate-fade-in"
    >
      <div
        v-if="loading"
        class="space-y-3 py-3"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="skeleton h-8 w-full max-w-md"
        />
      </div>

      <div
        v-else-if="hubError"
        class="flex flex-col items-center gap-3 py-6 text-center"
      >
        <p class="text-sm text-red-600">
          Не удалось загрузить датчики
        </p>
        <AppButton
          variant="secondary"
          @click="emit('reload')"
        >
          Повторить
        </AppButton>
      </div>

      <p
        v-else-if="sensors.length === 0"
        class="text-sm text-ink-400 py-4"
      >
        Нет подключённых датчиков
      </p>

      <ul
        v-else
        class="divide-y divide-ink-100"
      >
        <li
          v-for="sensor in sensors"
          :key="sensor.id"
        >
          <SensorCard :sensor="sensor" />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Sensor } from "@/data";
import type { DeviceSummary } from "@/stores/devicesStore";
import SensorCard from "@/components/devices/SensorCard.vue";
import AppButton from "@/components/ui/AppButton.vue";

const props = defineProps<{
  devices: DeviceSummary[];
  sensorsByDevice: Record<string, Sensor[]>;
  loading: boolean;
}>();

const emit = defineEmits<{ reload: [] }>();

const open = ref(true);
const selectedHubId = ref("");

watch(
  () => props.devices,
  (devices) => {
    if (devices.length === 0) {
      selectedHubId.value = "";
      return;
    }
    if (!devices.some((device) => device.id === selectedHubId.value)) {
      selectedHubId.value = devices[0]!.id;
    }
  },
  { immediate: true }
);

const sensors = computed(() =>
  selectedHubId.value ? (props.sensorsByDevice[selectedHubId.value] ?? []) : []
);

const hubError = computed(
  () =>
    !props.loading &&
    selectedHubId.value !== "" &&
    !(selectedHubId.value in props.sensorsByDevice)
);
</script>
