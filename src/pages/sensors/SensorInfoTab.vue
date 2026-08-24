<template>
  <div class="space-y-6">
    <div class="ship-card p-6">
      <h2 class="text-lg font-bold text-ink-900 mb-6">
        Настройки устройства
      </h2>

      <div class="space-y-6">
        <div>
          <label
            class="block text-sm font-medium text-ink-700 mb-1.5"
            for="sensor-name"
          >Название устройства</label>
          <ShipInput
            id="sensor-name"
            v-model="local.name"
            type="text"
            placeholder="Введите новое название"
            class="w-full"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-ink-100">
          <ShipButton
            variant="secondary"
            @click="cancel"
          >
            Отмена
          </ShipButton>
          <ShipButton
            variant="primary"
            :disabled="saving"
            @click="$emit('save', local)"
          >
            {{ saving ? "Сохранение..." : "Сохранить" }}
          </ShipButton>
        </div>

        <p
          v-if="error"
          role="alert"
          class="text-sm text-red-600 text-right"
        >
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import ShipInput from "@/components/ShipInput.vue";
import ShipButton from "@/components/ShipButton.vue";

export interface SensorSettings {
  id: string;
  name: string;
  minThreshold: number;
  maxThreshold: number;
  tags: string[];
}

const props = defineProps<{
  settings: SensorSettings;
  saving: boolean;
  error?: string;
}>();

defineEmits<{
  save: [settings: SensorSettings];
}>();

const local = reactive<SensorSettings>({ ...props.settings });

watch(
  () => props.settings,
  (val) => {
    Object.assign(local, val);
  },
  { deep: true }
);

const cancel = () => {
  Object.assign(local, props.settings);
};
</script>
