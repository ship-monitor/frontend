<template>
  <div class="px-5 sm:px-6 py-4 flex items-center gap-4">
    <span class="font-mono text-xs text-ink-300 num w-6 shrink-0 tabular-nums">
      {{ String(index).padStart(2, "0") }}
    </span>
    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium text-ink-900 truncate">
        {{ sensor.displayName }}
      </p>
      <p class="font-mono text-xs text-ink-400 truncate">
        {{ sensor.name }}
      </p>
    </div>
    <span
      v-if="sensor.firmware"
      class="hidden sm:block font-mono text-xs text-ink-400 truncate max-w-40"
    >
      {{ sensor.firmware.model }} rev. {{ sensor.firmware.revision }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { type Sensor } from "@/data";

defineProps<{
  sensor: Sensor;
  index: number;
}>();
</script>
