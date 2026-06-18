<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl border p-6">
      <h2 class="text-lg font-semibold mb-6">Настройки устройства</h2>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5"
            >Название устройства</label
          >
          <input
            v-model="local.name"
            type="text"
            placeholder="Холодильник N1"
            class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Нижняя граница (C)</label
            >
            <input
              v-model.number="local.minThreshold"
              type="number"
              step="0.5"
              class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Верхняя граница (C)</label
            >
            <input
              v-model.number="local.maxThreshold"
              type="number"
              step="0.5"
              class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5"
            >Теги</label
          >
          <p class="text-xs text-gray-500 mb-2">
            Используются для поиска и фильтрации устройств на дашборде
          </p>

          <div v-if="local.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
            <span
              v-for="tag in local.tags"
              :key="tag"
              class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-1.5"
            >
              {{ tag }}
              <button
                @click="removeTag(tag)"
                class="text-blue-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          </div>

          <div class="flex gap-2">
            <input
              v-model="newTag"
              type="text"
              placeholder="Новый тег"
              class="flex-1 px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
              @keyup.enter="addTag"
            />
            <button
              @click="addTag"
              :disabled="!newTag.trim()"
              class="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm font-medium touch-target"
            >
              Добавить
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5"
            >Номер телефона для SMS</label
          >
          <input
            v-model="local.phone"
            type="tel"
            placeholder="+7XXXXXXXXXX"
            class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5"
            >Частота SMS-уведомлений</label
          >
          <div class="relative">
            <select
              v-model="local.smsFrequency"
              class="w-full px-4 py-3 border rounded-lg text-base appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="never">Не отправлять</option>
              <option value="signal_loss">Только при потере связи</option>
              <option value="threshold">
                При выходе за границы температуры
              </option>
              <option value="both">При потере связи и выходе за границы</option>
            </select>
            <svg
              class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ smsHint }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5"
            >Время оттайки (минут)</label
          >
          <input
            v-model.number="local.defrostTime"
            type="number"
            min="1"
            class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            @click="$emit('cancel')"
            class="px-6 py-2.5 border rounded-lg hover:bg-gray-50 text-sm touch-target"
          >
            Отмена
          </button>
          <button
            @click="$emit('save', local)"
            :disabled="saving"
            class="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm touch-target font-medium"
          >
            {{ saving ? "Сохранение..." : "Сохранить" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";

export interface SensorSettings {
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

defineEmits<{
  save: [settings: SensorSettings];
  cancel: [];
}>();

const local = reactive<SensorSettings>({ ...props.settings });
const newTag = ref("");

watch(
  () => props.settings,
  (val) => {
    Object.assign(local, val);
  },
  { deep: true }
);

const smsHint = computed(() => {
  switch (local.smsFrequency) {
    case "never":
      return "SMS-уведомления отключены";
    case "signal_loss":
      return "SMS будет отправлено только если устройство перестанет выходить на связь";
    case "threshold":
      return "SMS будет отправлено при выходе температуры за заданные границы";
    case "both":
      return "SMS будет отправлено при потере связи и при выходе температуры за границы";
    default:
      return "";
  }
});

function addTag() {
  const tag = newTag.value.trim();
  if (!tag || local.tags.includes(tag)) {
    newTag.value = "";
    return;
  }
  local.tags.push(tag);
  newTag.value = "";
}

function removeTag(tag: string) {
  local.tags = local.tags.filter((t) => t !== tag);
}
</script>
