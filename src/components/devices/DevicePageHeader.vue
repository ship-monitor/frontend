<template>
  <div class="mb-6">
    <button
      class="text-sm text-ink-500 hover:text-ink-700 mb-3 flex items-center gap-1 touch-target transition-colors"
      @click="$router.back()"
    >
      <IconArrowToLeft class="size-4" />
      Назад
    </button>
    <div class="flex flex-wrap justify-between items-start gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight truncate">
          {{ name }}
        </h1>
        <p class="mt-1.5 font-mono text-xs text-ink-400 num">
          ID: {{ deviceId }}
        </p>
      </div>
      <div class="flex flex-col items-start sm:items-end gap-2">
        <span
          :class="['app-badge app-badge-' + status.badge]"
          role="status"
        >
          <span
            :class="['size-1.5 rounded-full', status.dot]"
            aria-hidden="true"
          />
          {{ status.label }}
        </span>
        <span
          v-if="batteryLevel !== null || powerConnected !== null"
          class="inline-flex items-center gap-3 text-xs text-ink-500"
        >
          <span
            v-if="powerConnected !== null"
            class="inline-flex items-center gap-1"
            :class="powerConnected ? '' : 'text-amber-600'"
          >
            <icon-plug class="size-3.5" />
            {{ powerConnected ? "Питание от сети" : "Питание от батареи" }}
          </span>
          <span
            v-if="batteryLevel !== null"
            class="inline-flex items-center gap-1"
          >
            <icon-battery class="size-3.5" />
            <span class="font-mono num">{{ Math.round(batteryLevel ?? 0) }}%</span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import IconBattery from "@/components/icons/IconBattery.vue";
import IconArrowToLeft from "@/components/icons/IconArrowToLeft.vue";
import IconPlug from "@/components/icons/IconPlug.vue";

const props = defineProps<{
  name: string;
  deviceId: string;
  isConnected: boolean;
  statusUnknown?: boolean;
  batteryLevel?: number | null;
  powerConnected?: boolean | null;
}>();

const status = computed(() => {
  if (props.statusUnknown) {
    return { label: "Статус неизвестен", badge: "muted", dot: "bg-ink-400" };
  }
  return props.isConnected
    ? { label: "В сети", badge: "success", dot: "bg-ok-500" }
    : { label: "Не в сети", badge: "danger", dot: "bg-red-400" };
});
</script>
