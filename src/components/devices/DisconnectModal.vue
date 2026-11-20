<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Отключение устройства"
      >
        <div
          class="absolute inset-0 bg-moonless-night/40 backdrop-blur-[2px]"
          @click="!disconnecting && emit('close')"
        />
        <div class="app-card relative w-full max-w-md p-6 max-h-[85dvh] overflow-y-auto shadow-[0_24px_48px_-16px_rgb(2_8_34/0.3)]">
          <div class="flex items-start justify-between gap-4 mb-5">
            <h2 class="text-lg font-bold text-ink-900">
              Отключить устройство?
            </h2>
            <button
              type="button"
              class="-mr-2 -mt-1 p-2 text-ink-400 hover:text-ink-700 rounded-lg transition-colors active:translate-y-px"
              aria-label="Закрыть"
              :disabled="disconnecting"
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

          <p class="text-sm text-ink-500 mb-6">
            Устройство «{{ name }}» будет отвязано от аккаунта. Датчики
            перестанут отслеживаться, данные на сервере сохранятся.
          </p>

          <div class="flex justify-end gap-3">
            <AppButton
              variant="secondary"
              :disabled="disconnecting"
              @click="emit('close')"
            >
              Отмена
            </AppButton>
            <AppButton
              variant="danger"
              :disabled="disconnecting"
              @click="emit('confirm')"
            >
              {{ disconnecting ? "Отключение..." : "Отключить" }}
            </AppButton>
          </div>

          <p
            v-if="error"
            role="alert"
            class="text-sm text-red-600 mt-4 text-right"
          >
            {{ error }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import AppButton from "@/components/ui/AppButton.vue";

defineProps<{
  open: boolean;
  name: string;
  disconnecting?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

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
