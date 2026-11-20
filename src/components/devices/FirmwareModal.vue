<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Информация о прошивке"
        @click.self="emit('close')"
        @keydown.esc="emit('close')"
      >
        <div class="absolute inset-0 bg-moonless-night/40 backdrop-blur-[2px]" />
        <div class="app-card relative w-full max-w-md p-6 max-h-[85dvh] overflow-y-auto">
          <div class="flex items-start justify-between gap-4 mb-5">
            <h2 class="text-lg font-bold text-ink-900">
              Прошивка
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

          <section class="mb-5">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
              Устройство · {{ deviceName }}
            </h3>
            <dl
              v-if="deviceFirmware"
              class="text-sm space-y-1.5"
            >
              <div class="flex justify-between gap-4">
                <dt class="text-ink-500">
                  Производитель
                </dt>
                <dd class="text-ink-900 font-medium text-right">
                  {{ deviceFirmware.manufacturer }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-ink-500">
                  Модель
                </dt>
                <dd class="text-ink-900 font-medium text-right">
                  {{ deviceFirmware.model }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-ink-500">
                  Ревизия
                </dt>
                <dd class="text-ink-900 font-medium text-right">
                  {{ deviceFirmware.revision }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-ink-500">
                  ПО
                </dt>
                <dd class="text-ink-900 font-medium text-right">
                  {{ deviceFirmware.software }}
                </dd>
              </div>
            </dl>
            <p
              v-else
              class="text-sm text-ink-400"
            >
              Устройство не передало данные о прошивке.
            </p>
          </section>

          <section v-if="sensors.length > 0">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
              Датчики
            </h3>
            <ul class="text-sm divide-y divide-ink-100">
              <li
                v-for="item in sensors"
                :key="item.id"
                class="py-2.5"
              >
                <p class="font-medium text-ink-900 mb-0.5">
                  {{ item.displayName }}
                </p>
                <p
                  v-if="item.firmware"
                  class="text-ink-500"
                >
                  {{ item.firmware.manufacturer }} · {{ item.firmware.model }}
                  · {{ item.firmware.software }}
                </p>
                <p
                  v-else
                  class="text-ink-400"
                >
                  Нет данных о прошивке
                </p>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import type { Firmware, Sensor } from "@/data";

defineProps<{
  open: boolean;
  deviceName: string;
  deviceFirmware?: Firmware;
  sensors: Sensor[];
}>();

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
