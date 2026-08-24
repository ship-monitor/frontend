<template>
  <div class="border-b border-ink-200 mb-6 overflow-x-auto">
    <div
      class="flex gap-2 sm:gap-4 min-w-max"
      role="tablist"
      aria-label="Разделы устройства"
      @keydown="onKeydown"
    >
      <button
        v-for="(tab, index) in tabs"
        :id="`sensor-tab-${tab.value}`"
        :key="tab.value"
        :ref="(el) => setTabRef(el, index)"
        role="tab"
        :aria-selected="modelValue === tab.value"
        aria-controls="sensor-tabpanel"
        :tabindex="modelValue === tab.value ? 0 : -1"
        :class="[
          'px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap touch-target',
          modelValue === tab.value
            ? 'border-brand-500 text-brand-600'
            : 'border-transparent text-ink-500 hover:text-ink-700',
        ]"
        @click="$emit('select', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";

const props = defineProps<{
  modelValue: string;
  tabs: Array<{ value: string; label: string }>;
}>();

const emit = defineEmits<{
  select: [value: string];
}>();

const tabRefs: HTMLButtonElement[] = [];

const setTabRef = (
  el: Element | ComponentPublicInstance | null,
  index: number
) => {
  if (el instanceof HTMLButtonElement) {
    tabRefs[index] = el;
  }
};

const selectTab = (index: number, focus = true) => {
  const tab = props.tabs[index];
  if (!tab) return;
  if (focus) tabRefs[index]?.focus();
  emit("select", tab.value);
};

const onKeydown = (event: KeyboardEvent) => {
  const current = props.tabs.findIndex((t) => t.value === props.modelValue);
  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      selectTab((current + 1) % props.tabs.length);
      break;
    case "ArrowLeft":
      event.preventDefault();
      selectTab(
        (current - 1 + props.tabs.length) % props.tabs.length
      );
      break;
    case "Home":
      event.preventDefault();
      selectTab(0);
      break;
    case "End":
      event.preventDefault();
      selectTab(props.tabs.length - 1);
      break;
  }
};
</script>
