<template>
  <div class="ship-card p-6">
    <h2 class="text-lg font-bold text-ink-900 mb-1">
      Датчики
    </h2>
    <p class="text-sm text-ink-500 mb-4">
      Датчики, задекларированные устройством
    </p>

    <div
      v-if="loading"
      class="text-sm text-ink-400 py-4 text-center"
    >
      Загрузка...
    </div>

    <div
      v-else-if="error"
      class="text-sm text-red-600 py-2"
    >
      {{ error }}
    </div>

    <p
      v-else-if="sensors.length === 0"
      class="text-sm text-ink-400 py-4 text-center"
    >
      Устройство пока не задекларировало ни одного датчика
    </p>

    <ul
      v-else
      class="divide-y divide-ink-100"
    >
      <li
        v-for="sensor in sensors"
        :key="sensor.id"
        class="py-3 flex items-center justify-between gap-4"
      >
        <div class="min-w-0">
          <p class="font-semibold text-ink-900 truncate">
            {{ sensor.displayName || sensor.name }}
          </p>
          <p class="text-xs text-ink-400 font-mono truncate">
            {{ sensor.id }}
          </p>
          <p
            v-if="sensorErrors[sensor.id]"
            class="text-xs text-red-500 mt-0.5"
          >
            {{ sensorErrors[sensor.id] }}
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <template v-if="editingId === sensor.id">
            <ShipInput
              :id="`sensor-name-${sensor.id}`"
              v-model="draftName"
              class="!w-48"
              placeholder="Название датчика"
            />
            <ShipButton
              :disabled="saving"
              @click="save(sensor)"
            >
              {{ saving ? "Сохранение..." : "ОК" }}
            </ShipButton>
            <ShipButton
              variant="secondary"
              :disabled="saving"
              @click="cancelEdit"
            >
              Отмена
            </ShipButton>
          </template>

          <template v-else>
            <span
              v-if="renamed[sensor.id]"
              class="text-xs text-brand-600"
            >переименован</span>
            <ShipButton
              variant="secondary"
              @click="startEdit(sensor)"
            >
              Переименовать
            </ShipButton>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ShipButton from "@/components/ShipButton.vue";
import ShipInput from "@/components/ShipInput.vue";
import { renameSensor, type Sensor } from "@/data";

const props = defineProps<{
  deviceId: string;
  sensors: Sensor[];
  loading: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  renamed: [sensor: Sensor];
}>();

const editingId = ref<string | null>(null);
const draftName = ref("");
const saving = ref(false);
const sensorErrors = ref<Record<string, string>>({});
const renamed = ref<Record<string, boolean>>({});

const startEdit = (sensor: Sensor) => {
  editingId.value = sensor.id;
  draftName.value = sensor.displayName || sensor.name;
  sensorErrors.value = { ...sensorErrors.value, [sensor.id]: "" };
};

const cancelEdit = () => {
  editingId.value = null;
  draftName.value = "";
};

const save = async (sensor: Sensor) => {
  const name = draftName.value.trim();
  if (!name || name === (sensor.displayName || sensor.name)) {
    cancelEdit();

    return;
  }

  saving.value = true;
  const result = await renameSensor(props.deviceId, sensor.id, name);
  saving.value = false;

  result
    .map((updated) => {
      renamed.value = { ...renamed.value, [sensor.id]: true };
      sensorErrors.value = { ...sensorErrors.value, [sensor.id]: "" };
      emit("renamed", updated);
      cancelEdit();
    })
    .inspectErr((err) => {
      sensorErrors.value = { ...sensorErrors.value, [sensor.id]: err };
    })
    .unwrapOr(undefined);
};
</script>
