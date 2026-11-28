<template>
  <section class="app-card overflow-hidden">
    <div class="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
      <h2 class="text-lg font-bold text-ink-900">
        Уведомления
      </h2>
      <router-link
        v-if="items.length > 0"
        :to="route.notifications({ device: deviceId })"
        class="-my-3 -mr-2 inline-flex items-center gap-1 rounded-lg px-2 py-3 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition-colors touch-target active:translate-y-px"
      >
        Все уведомления
        <IconArrowToLeft class="size-4 rotate-180" />
      </router-link>
    </div>

    <div
      v-if="loading"
      class="space-y-5 px-6 pb-5"
    >
      <div
        v-for="i in 3"
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
      v-else-if="loadError"
      class="px-6 pb-6 text-center"
    >
      <p class="mb-3 text-red-600">
        {{ loadError }}
      </p>
      <AppButton
        variant="secondary"
        @click="reload"
      >
        Повторить
      </AppButton>
    </div>

    <p
      v-else-if="items.length === 0"
      class="px-6 pb-6 text-ink-500"
    >
      Уведомлений нет. Когда датчик выйдет за нормы, здесь появится оповещение.
    </p>

    <ul
      v-else
      class="divide-y divide-ink-100 border-t border-ink-100"
    >
      <NotificationRow
        v-for="item in recent"
        :key="item.id"
        :item="item"
        :interactive="item.sensorId !== null && knownSensors.has(item.sensorId)"
        @select="openSensor"
      />
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import IconArrowToLeft from "@/components/icons/IconArrowToLeft.vue";
import AppButton from "@/components/ui/AppButton.vue";
import NotificationRow from "@/components/notifications/NotificationRow.vue";
import { useDeviceNotifications } from "@/composables/useDeviceNotifications";
import { route } from "@/constants/routes";
import type { NotificationItem } from "@/utils/notifications";

const RECENT_LIMIT = 5;

const props = defineProps<{
  deviceId: string;
  sensors: Array<{ id: string; displayName: string }>;
}>();

const router = useRouter();

const { items, loading, loadError, reload } = useDeviceNotifications(
  computed(() => props.deviceId),
  computed(() => props.sensors)
);

const recent = computed(() => items.value.slice(0, RECENT_LIMIT));
const knownSensors = computed(
  () => new Set(props.sensors.map((sensor) => sensor.id))
);

onMounted(() => {
  void reload();
});

function openSensor(item: NotificationItem) {
  if (item.sensorId === null) return;
  void router.push({
    path: route.sensorDetails(props.deviceId, item.sensorId),
  });
}
</script>
