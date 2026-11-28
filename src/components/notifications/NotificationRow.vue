<template>
  <li>
    <component
      :is="interactive ? 'button' : 'div'"
      v-bind="interactive ? { type: 'button' } : {}"
      class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
      :class="
        interactive
          ? 'hover:bg-ink-50 active:bg-ink-100 active:translate-y-px cursor-pointer'
          : ''
      "
      @click="onSelect"
    >
      <span
        class="mt-[0.4375rem] size-2.5 shrink-0 rounded-full"
        :class="SEVERITY_DOT_CLASS[item.severity]"
        aria-hidden="true"
      />
      <span class="min-w-0 flex-1">
        <span class="flex items-baseline justify-between gap-2">
          <span class="font-semibold text-ink-900 text-balance">
            <span class="sr-only"> {{ severityName(item.severity) }}. </span>
            {{ item.title }}
          </span>
          <span
            v-if="item.value"
            class="shrink-0 font-bold tabular-nums"
            :class="SEVERITY_VALUE_CLASS[item.severity]"
          >{{ item.value }}</span>
        </span>
        <span class="flex items-baseline justify-between gap-3">
          <span class="truncate text-ink-500">
            {{ place }}
          </span>
          <time
            class="shrink-0 tabular-nums text-ink-400"
            :datetime="new Date(item.occurredAt).toISOString()"
          >{{ formatNotificationTime(item.occurredAt) }}</time>
        </span>
      </span>
    </component>
  </li>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  formatNotificationTime,
  notificationPlace,
  SEVERITY_DOT_CLASS,
  SEVERITY_VALUE_CLASS,
  severityName,
  type NotificationItem,
} from "@/utils/notifications";

const props = withDefaults(
  defineProps<{
    item: NotificationItem;
    showDevice?: boolean;
    interactive?: boolean;
  }>(),
  { showDevice: false, interactive: true }
);

const emit = defineEmits<{ select: [item: NotificationItem] }>();

const place = computed(() => notificationPlace(props.item, props.showDevice));

const onSelect = () => {
  if (props.interactive) emit("select", props.item);
};
</script>
