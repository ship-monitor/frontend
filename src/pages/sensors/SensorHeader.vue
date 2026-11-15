<template>
  <div class="mb-6">
    <button
      class="text-sm text-ink-500 hover:text-ink-700 mb-3 flex items-center gap-1 touch-target transition-colors"
      @click="$router.back()"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Назад
    </button>
    <div class="flex flex-wrap justify-between items-start gap-3">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          {{ name }}
        </h1>
        <p class="text-xs text-ink-400 font-mono mt-0.5">
          ID: {{ deviceId }}
        </p>
        <div
          v-if="tags && tags.length > 0"
          class="flex flex-wrap gap-1.5 mt-2.5"
        >
          <span
            v-for="tag in tags"
            :key="tag"
            class="ship-badge ship-badge-success"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      <span
        class="inline-flex items-center gap-1.5 text-xs text-ink-500"
        role="status"
      >
        <span
          :class="[
            'w-1.5 h-1.5 rounded-full',
            statusUnknown
              ? 'bg-ink-400'
              : isConnected
                ? 'bg-brand-500'
                : 'bg-red-400',
          ]"
        />
        {{
          statusUnknown
            ? "Статус неизвестен"
            : isConnected
              ? "В сети"
              : "Не в сети"
        }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  deviceId: string;
  isConnected: boolean;
  statusUnknown?: boolean;
  tags: string[];
}>();
</script>
