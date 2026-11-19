<template>
  <div class="py-3 flex items-center justify-between gap-4">
    <div class="min-w-0">
      <p class="font-semibold text-ink-900 truncate">
        {{ sensor.displayName }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Sensor } from "@/data";

defineProps<{ sensor: Sensor }>();
</script>
