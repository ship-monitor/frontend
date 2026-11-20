<template>
  <RouterLink
    :to="route.sensorDetails(sensor.deviceId, sensor.id)"
    class="py-3 flex items-center justify-between gap-4 rounded-lg -mx-2 px-2 transition-colors hover:bg-ink-50 active:scale-[0.98]"
    :aria-label="`Датчик ${sensor.displayName}`"
  >
    <div class="min-w-0">
      <p class="font-semibold text-ink-900 truncate">
        {{ sensor.displayName }}
      </p>
    </div>
    <IconArrowToLeft class="size-4 text-ink-300 shrink-0 rotate-180" />
  </RouterLink>
</template>

<script setup lang="ts">
import { type Sensor } from "@/data";
import { route } from "@/constants/routes";
import IconArrowToLeft from "@/components/icons/IconArrowToLeft.vue";

defineProps<{ sensor: Sensor }>();
</script>
