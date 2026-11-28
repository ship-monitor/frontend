<template>
  <div class="space-y-5 sm:space-y-6 animate-fade-in">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
        Уведомления
      </h1>
      <p class="text-sm text-ink-500 mt-0.5 min-h-6">
        {{ subtitle }}
      </p>
    </div>

    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <AppChips
        v-model="severity"
        :options="SEVERITY_FILTERS"
        label="Фильтр по уровню"
      />
      <AppSelect
        v-if="deviceOptions.length > 2"
        v-model="deviceId"
        :options="deviceOptions"
        class="sm:w-60"
        aria-label="Фильтр по устройству"
      />
    </div>

    <div
      v-if="loadError && notifications.length === 0"
      class="app-card p-8 text-center animate-scale-in"
    >
      <p class="text-lg font-semibold text-ink-900 mb-1">
        Не удалось загрузить уведомления
      </p>
      <p class="text-sm text-red-600 mb-4">
        {{ loadError }}
      </p>
      <AppButton @click="refresh">
        Повторить
      </AppButton>
    </div>

    <div
      v-else-if="loading"
      class="app-card overflow-hidden"
      role="status"
      aria-label="Загрузка уведомлений"
    >
      <div
        v-for="i in 5"
        :key="i"
        class="flex items-start gap-3 px-4 py-3"
      >
        <div class="skeleton mt-[0.4375rem] size-2.5 shrink-0 rounded-full" />
        <div class="min-w-0 flex-1">
          <div class="skeleton mb-3 h-4 w-44 max-w-full" />
          <div class="skeleton h-3 w-28" />
        </div>
      </div>
    </div>

    <div
      v-else-if="!hasDevices"
      class="app-card p-8 sm:p-12 text-center animate-scale-in"
    >
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-400"
      >
        <IconBell class="w-8 h-8" />
      </div>
      <p class="text-lg font-semibold text-ink-900 mb-1">
        Нет подключенных устройств
      </p>
      <p class="text-sm text-ink-500 mb-5">
        Подключите устройство, чтобы получать оповещения от его датчиков
      </p>
      <router-link
        :to="ROUTES.CONNECT_DEVICE"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
      >
        Подключить устройство
      </router-link>
    </div>

    <div
      v-else-if="notifications.length === 0"
      class="app-card p-8 sm:p-12 text-center animate-scale-in"
    >
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-400"
      >
        <IconBell class="w-8 h-8" />
      </div>
      <p class="text-lg font-semibold text-ink-900 mb-1">
        Уведомлений нет
      </p>
      <p class="text-sm text-ink-500">
        Когда датчик выйдет за нормы, здесь появится оповещение
      </p>
    </div>

    <div
      v-else-if="visible.length === 0"
      class="app-card p-8 text-center animate-scale-in"
    >
      <template v-if="searching">
        <AppSpinner class="w-6 h-6 mx-auto mb-3 text-brand-500" />
        <p
          class="text-sm text-ink-500"
          role="status"
        >
          Ищем среди более старых уведомлений…
        </p>
      </template>
      <template v-else>
        <p
          v-if="stale"
          class="mb-3 text-sm text-red-600"
          role="alert"
        >
          Не удалось обновить уведомления
        </p>
        <p class="text-sm text-ink-500">
          {{
            hasMore
              ? "Среди загруженных уведомлений совпадений нет"
              : "Ничего не найдено по выбранным фильтрам"
          }}
        </p>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
          <AppButton
            variant="secondary"
            :disabled="refreshing"
            @click="refresh"
          >
            {{ refreshing ? "Обновление..." : "Обновить" }}
          </AppButton>
          <button
            type="button"
            class="text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors touch-target"
            @click="resetFilters"
          >
            Сбросить фильтры
          </button>
        </div>
      </template>
    </div>

    <div
      v-else
      class="app-card overflow-hidden"
    >
      <p
        v-if="stale"
        class="flex flex-wrap items-center justify-between gap-2 bg-red-50 px-4 py-3 text-red-700 ring-1 ring-inset ring-red-200"
        role="alert"
      >
        Не удалось обновить уведомления
        <button
          type="button"
          class="font-semibold underline touch-target"
          @click="refresh"
        >
          Повторить
        </button>
      </p>
      <ul class="divide-y divide-ink-100">
        <NotificationRow
          v-for="item in visible"
          :key="item.id"
          :item="item"
          :show-device="showDeviceName"
          @select="openDevice"
        />
      </ul>

      <div
        v-if="searching || canShowMore || loadMoreError"
        class="border-t border-ink-100 px-4 py-4"
      >
        <p
          v-if="searching"
          class="flex items-center justify-center gap-2 text-sm text-ink-500"
          role="status"
        >
          <AppSpinner class="size-4 text-brand-500" />
          Ищем среди более старых уведомлений…
        </p>
        <template v-else>
          <AppButton
            v-if="canShowMore"
            variant="secondary"
            class="w-full"
            :disabled="loadingMore"
            @click="showMore"
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
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import IconBell from "@/components/icons/IconBell.vue";
import NotificationRow from "@/components/notifications/NotificationRow.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppChips from "@/components/ui/AppChips.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppSpinner from "@/components/ui/AppSpinner.vue";
import { useNotificationsPage } from "@/composables/useNotificationsPage";
import { ROUTES, route } from "@/constants/routes";
import { SEVERITY_FILTERS, type NotificationItem } from "@/utils/notifications";

const router = useRouter();
const routeParams = useRoute();

const {
  feed,
  severity,
  deviceId,
  visible,
  canShowMore,
  refreshing,
  deviceOptions,
  subtitle,
  showDeviceName,
  refresh,
  showMore,
  resetFilters,
} = useNotificationsPage({
  query: () => routeParams.query,
  replace: (query) => {
    void router.replace(route.notifications(query));
  },
});

const {
  notifications,
  loading,
  loadError,
  hasDevices,
  hasMore,
  loadingMore,
  loadMoreError,
  searching,
} = feed;

const stale = computed(
  () => loadError.value !== "" && notifications.value.length > 0
);

onMounted(() => {
  void refresh();
});

function openDevice(item: NotificationItem) {
  void router.push({ path: route.deviceDetails(item.deviceId) });
}
</script>
