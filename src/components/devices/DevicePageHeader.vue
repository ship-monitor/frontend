<template>
  <div class="mb-6">
    <RouterLink
      :to="route.dashboard()"
      class="text-sm text-ink-500 hover:text-ink-700 mb-3 inline-flex items-center gap-1 touch-target transition-colors"
    >
      <IconArrowToLeft class="size-4" />
      Назад
    </RouterLink>
    <div class="flex flex-wrap justify-between items-center gap-3">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          {{ name }}
        </h1>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        <div class="flex flex-col items-end">
          <span
            v-if="!statusUnknown && !isConnected"
            class="inline-flex items-center gap-1.5 text-xs text-ink-500"
            role="status"
          >
            <span class="w-2 h-2 rounded-full bg-red-400" />
            Не в сети
          </span>
          <span
            v-if="powerConnected === false"
            class="inline-flex items-center gap-3 text-xs text-ink-400"
          >
            <span class="inline-flex items-center gap-1 text-amber-600">
              <icon-plug class="size-4" />
              От батареи
            </span>
            <span
              v-if="batteryLevel !== null"
              class="inline-flex items-center gap-1"
            >
              <icon-battery class="size-4" />
              {{ Math.round(batteryLevel ?? 0) }}%
            </span>
          </span>
        </div>
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconBattery from "@/components/icons/IconBattery.vue";
import IconArrowToLeft from "@/components/icons/IconArrowToLeft.vue";
import IconPlug from "@/components/icons/IconPlug.vue";
import { route } from "@/constants/routes";

defineProps<{
  name: string;
  deviceId: string;
  isConnected: boolean;
  statusUnknown?: boolean;
  batteryLevel?: number | null;
  powerConnected?: boolean | null;
}>();
</script>
