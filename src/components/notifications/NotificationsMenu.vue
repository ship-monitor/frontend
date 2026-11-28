<template>
  <div
    v-if="variant === 'popover'"
    ref="root"
    class="relative"
  >
    <button
      ref="trigger"
      type="button"
      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-ink-300 hover:text-white hover:bg-ink-800 transition-colors touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      :class="{ 'bg-ink-800 text-white': open || onNotificationsPage }"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click="toggle"
    >
      <IconBell class="size-5" />
      <span class="text-base font-medium">
        Уведомления
      </span>
    </button>

    <Transition name="menu">
      <section
        v-if="open"
        class="absolute bottom-0 left-full z-50 ml-7 w-[22rem] max-h-[min(34rem,calc(100dvh-14rem))] overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_16px_32px_-12px_rgb(2_8_34/0.2)] origin-bottom-left"
        aria-label="Уведомления"
      >
        <NotificationsPanel
          v-bind="feed"
          class="max-h-[inherit]"
          @close="close"
          @reload="load"
          @load-more="loadMore"
          @select="openDevice"
        />
      </section>
    </Transition>
  </div>

  <template v-else>
    <button
      ref="trigger"
      type="button"
      class="flex flex-col items-center gap-0.5 px-1 py-1 text-ink-400 hover:text-brand-600 transition-colors touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      :class="{ '!text-brand-600': open || onNotificationsPage }"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click="toggle"
    >
      <IconBell class="size-6" />
      <span class="text-xs font-medium whitespace-nowrap">
        Уведомления
      </span>
    </button>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="open"
          ref="dialog"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Уведомления"
        >
          <div
            class="absolute inset-0 bg-moonless-night/40 backdrop-blur-[2px]"
            @click="dismiss"
          />
          <div
            class="app-card relative flex w-full max-w-md flex-col max-h-[85dvh] overflow-hidden shadow-[0_24px_48px_-16px_rgb(2_8_34/0.3)]"
          >
            <div class="overscroll-contain overflow-y-auto">
              <NotificationsPanel
                v-bind="feed"
                @close="close"
                @reload="load"
                @load-more="loadMore"
                @select="openDevice"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </template>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import IconBell from "@/components/icons/IconBell.vue";
import NotificationsPanel from "@/components/notifications/NotificationsPanel.vue";
import { useNotifications } from "@/composables/useNotifications";
import { ROUTES, route } from "@/constants/routes";

withDefaults(
  defineProps<{
    variant?: "popover" | "modal";
  }>(),
  { variant: "popover" }
);

const router = useRouter();
const currentRoute = useRoute();
const onNotificationsPage = computed(
  () => currentRoute.path === ROUTES.NOTIFICATIONS
);
const {
  notifications,
  loading,
  loadError,
  hasDevices,
  hasMore,
  loadingMore,
  loadMoreError,
  load,
  loadMore,
} = useNotifications();

const feed = reactive({
  notifications,
  loading,
  loadError,
  hasDevices,
  hasMore,
  loadingMore,
  loadMoreError,
});

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const dialog = ref<HTMLElement | null>(null);

let removeNavigationHook: (() => void) | undefined;

function dismiss() {
  open.value = false;
}

function close() {
  open.value = false;
  trigger.value?.focus();
}

async function toggle() {
  if (open.value) {
    close();
    return;
  }

  open.value = true;
  void load();
  await nextTick();
  dialog.value?.querySelector<HTMLElement>("button, a")?.focus();
}

function openDevice(deviceId: string) {
  close();
  void router.push({ path: route.deviceDetails(deviceId) });
}

function onPointerdown(event: PointerEvent) {
  if (!open.value || !root.value) return;
  if (!root.value.contains(event.target as Node)) dismiss();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) close();
}

onMounted(() => {
  document.addEventListener("pointerdown", onPointerdown);
  document.addEventListener("keydown", onKeydown);
  removeNavigationHook = router.afterEach(dismiss);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onPointerdown);
  document.removeEventListener("keydown", onKeydown);
  removeNavigationHook?.();
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
  transform: scale(0.95) translateY(4px);
}

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
  .menu-enter-active,
  .menu-leave-active,
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
}
</style>
