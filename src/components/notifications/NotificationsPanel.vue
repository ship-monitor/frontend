<template>
  <div class="flex min-h-0 flex-col">
    <div class="flex shrink-0 items-center justify-between gap-2 px-4 pt-4 pb-3">
      <h2 class="text-lg font-bold text-ink-900">
        Уведомления
      </h2>
      <div class="flex items-center">
        <router-link
          v-if="notifications.length > 0"
          :to="route.notifications()"
          class="-my-2 inline-flex items-center rounded-lg px-2 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition-colors touch-target active:translate-y-px"
          @click="emit('close')"
        >
          Все уведомления
        </router-link>
        <button
          type="button"
          class="-mr-2 -mt-1 p-2 text-ink-400 hover:text-ink-700 rounded-lg transition-colors active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
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
    </div>

    <div
      v-if="loading"
      class="px-4 py-3"
      role="status"
      aria-label="Загрузка уведомлений"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-start gap-3 py-3"
      >
        <div class="skeleton mt-[0.4375rem] size-2.5 shrink-0 rounded-full" />
        <div class="min-w-0 flex-1">
          <div class="skeleton mb-3 h-4 w-44 max-w-full" />
          <div class="skeleton h-3 w-28" />
        </div>
      </div>
    </div>

    <div
      v-else-if="showError"
      class="px-4 py-8 text-center"
    >
      <p class="mb-1 font-semibold text-ink-900">
        Не удалось загрузить уведомления
      </p>
      <p class="mb-5 text-red-600">
        {{ loadError }}
      </p>
      <AppButton @click="emit('reload')">
        Повторить
      </AppButton>
    </div>

    <div
      v-else-if="notifications.length === 0"
      class="px-4 py-8 text-center"
    >
      <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
        <IconBell class="size-8" />
      </div>
      <template v-if="hasDevices">
        <p class="mb-1 font-semibold text-ink-900">
          Уведомлений нет
        </p>
        <p class="text-ink-500">
          Когда датчик выйдет за нормы, здесь появится оповещение
        </p>
      </template>
      <template v-else>
        <p class="mb-1 font-semibold text-ink-900">
          Нет подключенных устройств
        </p>
        <p class="mb-5 text-ink-500">
          Подключите устройство, чтобы получать оповещения от его датчиков
        </p>
        <router-link
          :to="ROUTES.CONNECT_DEVICE"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
          @click="emit('close')"
        >
          Подключить устройство
        </router-link>
      </template>
    </div>

    <template v-else>
      <div class="min-h-0 overflow-y-auto">
        <p
          v-if="showStale"
          class="mx-4 mb-2 rounded-xl bg-red-50 px-4 py-3 text-red-700 ring-1 ring-inset ring-red-200"
          role="alert"
        >
          Не удалось обновить уведомления
          <button
            type="button"
            class="ml-2 font-semibold underline"
            @click="emit('reload')"
          >
            Повторить
          </button>
        </p>

        <ul class="divide-y divide-ink-100">
          <NotificationRow
            v-for="item in notifications"
            :key="item.id"
            :item="item"
            show-device
            @select="openDevice"
          />
        </ul>

        <div
          v-if="hasMore || loadMoreError"
          class="border-t border-ink-100 px-4 py-4"
        >
          <AppButton
            v-if="hasMore"
            variant="secondary"
            class="w-full"
            :disabled="loadingMore"
            @click="emit('load-more')"
          >
            {{ loadingMore ? "Загрузка..." : "Показать ещё" }}
          </AppButton>
          <p
            v-if="loadMoreError"
            class="mt-2 text-center text-red-600"
            role="alert"
          >
            {{ loadMoreError }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppButton from "@/components/ui/AppButton.vue";
import IconBell from "@/components/icons/IconBell.vue";
import NotificationRow from "@/components/notifications/NotificationRow.vue";
import { ROUTES, route } from "@/constants/routes";
import type { NotificationItem } from "@/utils/notifications";

const props = defineProps<{
  notifications: NotificationItem[];
  loading: boolean;
  loadError: string;
  hasDevices: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: string;
}>();

const emit = defineEmits<{
  close: [];
  reload: [];
  "load-more": [];
  select: [deviceId: string];
}>();

const failed = computed(() => props.loadError !== "");
const showError = computed(
  () => failed.value && props.notifications.length === 0
);
const showStale = computed(
  () => failed.value && props.notifications.length > 0
);

const openDevice = (item: NotificationItem) => emit("select", item.deviceId);
</script>
