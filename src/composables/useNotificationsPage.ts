import { computed, ref, watch } from "vue";
import { useNotifications } from "@/composables/useNotifications";
import type { NotificationsRouteQuery } from "@/constants/routes";
import {
  filterNotifications,
  parseSeverityFilter,
  type NotificationSeverityFilter,
} from "@/utils/notifications";

const PAGE_SIZE = 100;
const SEARCH_DEPTH = 5;
const VISIBLE_STEP = 50;

export type NotificationsPageQuery = {
  device?: unknown;
  severity?: unknown;
};

export type NotificationsPageSource = {
  query: () => NotificationsPageQuery;
  replace: (query: NotificationsRouteQuery) => void;
};

const deviceFilter = (value: unknown): string =>
  typeof value === "string" ? value : "";

export function useNotificationsPage(source: NotificationsPageSource) {
  const feed = useNotifications({ pageSize: PAGE_SIZE });

  const initial = source.query();
  const severity = ref<NotificationSeverityFilter>(
    parseSeverityFilter(initial.severity)
  );
  const deviceId = ref(deviceFilter(initial.device));
  const visibleCount = ref(VISIBLE_STEP);
  const refreshing = ref(false);

  const filtered = computed(() =>
    filterNotifications(feed.notifications.value, {
      severity: severity.value,
      deviceId: deviceId.value,
    })
  );
  const visible = computed(() => filtered.value.slice(0, visibleCount.value));
  const hasHidden = computed(() => filtered.value.length > visibleCount.value);
  const canShowMore = computed(() => hasHidden.value || feed.hasMore.value);
  const filtersActive = computed(
    () => severity.value !== "all" || deviceId.value !== ""
  );
  const deviceOptions = computed(() => [
    { value: "", label: "Все устройства" },
    ...feed.devices.value.map((device) => ({
      value: device.id,
      label: device.name,
    })),
  ]);
  const deviceTitle = computed(() => {
    const device = feed.devices.value.find(
      (item) => item.id === deviceId.value
    );
    return device ? device.name : deviceId.value.substring(0, 8);
  });
  const onlyDevice = computed(() => {
    const [single] = feed.devices.value;
    return feed.devices.value.length === 1 && single ? single : null;
  });
  const subtitle = computed(() => {
    if (feed.loading.value && feed.devices.value.length === 0) return "";
    if (deviceId.value !== "") return `Устройство «${deviceTitle.value}»`;
    return onlyDevice.value
      ? `Устройство «${onlyDevice.value.name}»`
      : "По всем устройствам";
  });
  const showDeviceName = computed(
    () =>
      deviceId.value === "" &&
      !onlyDevice.value &&
      feed.devices.value.length > 0
  );

  async function seek() {
    if (
      feed.loading.value ||
      feed.loadError.value ||
      !filtersActive.value ||
      filtered.value.length > 0 ||
      !feed.hasMore.value
    ) {
      return;
    }
    await feed.loadMoreUntil(() => filtered.value.length > 0, SEARCH_DEPTH);
  }

  async function showMore() {
    if (hasHidden.value) {
      visibleCount.value += VISIBLE_STEP;
      return;
    }
    await feed.loadMoreUntil(() => hasHidden.value, SEARCH_DEPTH);
    if (hasHidden.value) visibleCount.value += VISIBLE_STEP;
  }

  async function refresh() {
    if (refreshing.value) return;
    refreshing.value = true;
    visibleCount.value = VISIBLE_STEP;
    try {
      await feed.load();
      if (feed.loadError.value) return;
      await seek();
    } finally {
      refreshing.value = false;
    }
  }

  function resetFilters() {
    severity.value = "all";
    deviceId.value = "";
  }

  watch(source.query, (query) => {
    const nextSeverity = parseSeverityFilter(query.severity);
    const nextDevice = deviceFilter(query.device);
    if (nextSeverity !== severity.value) severity.value = nextSeverity;
    if (nextDevice !== deviceId.value) deviceId.value = nextDevice;
  });

  watch([severity, deviceId], ([level, device]) => {
    const current = source.query();
    if (
      parseSeverityFilter(current.severity) === level &&
      deviceFilter(current.device) === device
    ) {
      return;
    }
    source.replace({
      ...(device ? { device } : {}),
      ...(level !== "all" ? { severity: level } : {}),
    });
  });

  watch([severity, deviceId], () => {
    visibleCount.value = VISIBLE_STEP;
    void seek();
  });

  return {
    feed,
    severity,
    deviceId,
    visible,
    canShowMore,
    filtersActive,
    refreshing,
    deviceOptions,
    subtitle,
    showDeviceName,
    refresh,
    showMore,
    resetFilters,
  };
}
