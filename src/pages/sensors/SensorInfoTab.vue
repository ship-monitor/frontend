<template>
  <transition name="tab-fade" mode="out-in">
    <div class="space-y-6">
      <div class="bg-white rounded-xl border p-6">
        <h2 class="text-lg font-semibold mb-6">Настройки устройства</h2>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Название устройства</label
            >
            <ShipInput
              v-model="local.name"
              type="text"
              placeholder="Введите новое название"
              class="w-full"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <ShipButton variant="secondary" @click="$emit('cancel')">
              Отмена
            </ShipButton>
            <ShipButton
              variant="primary"
              @click="$emit('save', local)"
              :disabled="saving"
            >
              {{ saving ? "Сохранение..." : "Сохранить" }}
            </ShipButton>
          </div>
        </div>
      </div>
    </div>
  </transition>
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
  phone: string;
  smsFrequency: string;
  defrostTime: number;
  tags: string[];
}

const props = defineProps<{
  settings: SensorSettings;
  saving: boolean;
}>();

const emit = defineEmits<{
  save: [settings: SensorSettings];
  cancel: [];
  update: [device: { id: string; name: string }];
}>();

const local = reactive<SensorSettings>({ ...props.settings });

watch(
  () => props.settings,
  (val) => {
    Object.assign(local, val);
  },
  { deep: true }
);
</script>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}
</style>