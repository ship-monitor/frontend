<template>
  <div
    ref="root"
    class="relative"
  >
    <button
      ref="trigger"
      type="button"
      class="inline-flex items-center justify-center size-11 rounded-full text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition-colors active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 cursor-pointer"
      :aria-expanded="open"
      aria-haspopup="menu"
      aria-label="Действия"
      @click="toggle"
    >
      <svg
        class="size-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="5"
          r="1.9"
        />
        <circle
          cx="12"
          cy="12"
          r="1.9"
        />
        <circle
          cx="12"
          cy="19"
          r="1.9"
        />
      </svg>
    </button>

    <Transition name="menu">
      <div
        v-if="open"
        role="menu"
        class="absolute right-0 top-[calc(100%+6px)] z-50 min-w-56 rounded-2xl border border-ink-200 bg-white py-2 shadow-[0_16px_32px_-12px_rgb(2_8_34/0.2)] origin-top-right"
      >
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          role="menuitem"
          class="block w-full text-left px-5 py-3 text-base font-medium transition-colors active:translate-y-px cursor-pointer"
          :class="
            item.danger
              ? 'text-red-600 hover:bg-red-50'
              : 'text-ink-700 hover:bg-ink-50'
          "
          @click="choose(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

export type AppMenuItem = {
  key: string;
  label: string;
  danger?: boolean;
};

defineProps<{
  items: AppMenuItem[];
}>();

const emit = defineEmits<{ select: [key: string] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
  trigger.value?.focus();
}

function choose(item: AppMenuItem) {
  open.value = false;
  emit("select", item.key);
}

function onPointerdown(event: PointerEvent) {
  if (!open.value) return;
  if (root.value && !root.value.contains(event.target as Node)) {
    open.value = false;
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) {
    close();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", onPointerdown);
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onPointerdown);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .menu-enter-active,
  .menu-leave-active {
    transition: none;
  }
}
</style>
