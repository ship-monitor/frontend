<template>
  <div class="mb-6">
    <button
      @click="$router.back()"
      class="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1 touch-target"
    >
      &larr; Назад
    </button>
    <div class="flex flex-wrap justify-between items-start gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">{{ name }}</h1>
        <p class="text-xs text-gray-400 font-mono">ID: {{ deviceId }}</p>
        <div v-if="tags && tags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="tag in tags"
            :key="tag"
            class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="showCommandModal = true"
          class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 touch-target"
        >
          Отправить команду
        </button>
        <button
          @click="$emit('ping')"
          :disabled="statusLoading"
          class="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 touch-target"
        >
          {{ statusLoading ? "Проверка..." : "Проверить связь" }}
        </button>
        <span
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800',
          ]"
        >
          {{ isConnected ? "В сети" : "Не в сети" }}
        </span>
      </div>
    </div>

    <div
      v-if="showCommandModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Отправить команду
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Команда</label
            >
            <input
              v-model="command"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Название команды"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-gray-700"
                >Аргументы</label
              >
              <button
                type="button"
                @click="addArg"
                class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Добавить
              </button>
            </div>
            <div
              v-for="(arg, index) in args"
              :key="index"
              class="flex gap-2 mb-2"
            >
              <input
                v-model="arg.key"
                type="text"
                class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ключ"
              />
              <input
                v-model="arg.value"
                type="text"
                class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Значение"
              />
              <button
                type="button"
                @click="removeArg(index)"
                class="px-2 text-gray-400 hover:text-red-500 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <p v-if="args.length === 0" class="text-xs text-gray-400 italic">
              Нет аргументов
            </p>
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Отмена
          </button>
          <button
            @click="submitCommand"
            :disabled="sending || !command.trim()"
            class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ sending ? "Отправка..." : "Отправить" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { sendDeviceCommand } from "@/data";

const props = defineProps<{
  name: string;
  deviceId: string;
  isConnected: boolean;
  statusLoading: boolean;
  tags: string[];
}>();

defineEmits<{
  ping: [];
}>();

const showCommandModal = ref(false);
const command = ref("");
const args = ref<{ key: string; value: string }[]>([]);
const sending = ref(false);
const error = ref("");

const addArg = () => {
  args.value.push({ key: "", value: "" });
};

const removeArg = (index: number) => {
  args.value.splice(index, 1);
};

const closeModal = () => {
  showCommandModal.value = false;
  command.value = "";
  args.value = [];
  error.value = "";
};

const submitCommand = async () => {
  sending.value = true;
  error.value = "";
  try {
    const argsObj: Record<string, string | number> = {};
    for (const arg of args.value) {
      if (arg.key.trim()) {
        const numVal = Number(arg.value);
        argsObj[arg.key.trim()] =
          !isNaN(numVal) && arg.value !== "" ? numVal : arg.value;
      }
    }
    await sendDeviceCommand(props.deviceId, command.value.trim(), argsObj);
    closeModal();
  } catch (e) {
    if (e instanceof Error) {
    error.value = e.message;
    } else {
      error.value = "Ошибка отправки команды";
    }
  } finally {
    sending.value = false;
  }
};
</script>
