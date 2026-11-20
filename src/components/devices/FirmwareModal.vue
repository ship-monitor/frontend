<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Информация о прошивке"
      >
        <div
          class="absolute inset-0 bg-moonless-night/40 backdrop-blur-[2px]"
          @click="emit('close')"
        />
        <div class="app-card relative w-full max-w-md p-6 max-h-[85dvh] overflow-y-auto shadow-[0_24px_48px_-16px_rgb(2_8_34/0.3)]">
          <div class="flex items-start justify-between gap-4 mb-5">
            <h2 class="text-lg font-bold text-ink-900">
              {{ title }}
            </h2>
            <button
              type="button"
              class="-mr-2 -mt-1 p-2 text-ink-400 hover:text-ink-700 rounded-lg transition-colors active:translate-y-px"
              aria-label="Закрыть"
              @click="emit('close')"
            >
              <svg
                class="size-4"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <dl
            v-if="firmware"
            class="text-sm space-y-2"
          >
            <div class="flex justify-between gap-4">
              <dt class="text-ink-500">
                Производитель
              </dt>
              <dd class="text-ink-900 font-medium text-right">
                {{ firmware.manufacturer }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-ink-500">
                Модель
              </dt>
              <dd class="text-ink-900 font-medium text-right">
                {{ firmware.model }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-ink-500">
                Ревизия
              </dt>
              <dd class="text-ink-900 font-medium text-right">
                {{ firmware.revision }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-ink-500">
                ПО
              </dt>
              <dd class="text-ink-900 font-medium text-right">
                {{ firmware.software }}
              </dd>
            </div>
          </dl>
          <p
            v-else
            class="text-sm text-ink-400"
          >
            {{ emptyText }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import type { Firmware } from "@/data";

withDefaults(
  defineProps<{
    open: boolean;
    firmware?: Firmware;
    title?: string;
    emptyText?: string;
  }>(),
  {
    firmware: undefined,
    title: "Прошивка устройства",
    emptyText: "Устройство не передало данные о прошивке.",
  }
);

const emit = defineEmits<{ close: [] }>();

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from :deep(.app-card),
.modal-leave-to :deep(.app-card) {
  transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
}
</style>
