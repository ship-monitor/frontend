<template>
  <div class="mb-6">
    <button
      class="text-sm text-ink-500 hover:text-ink-700 mb-3 flex items-center gap-1 touch-target transition-colors"
      @click="$router.back()"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Назад
    </button>
    <div class="flex flex-wrap justify-between items-start gap-3">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          {{ name }}
        </h1>
        <p class="text-xs text-ink-400 font-mono mt-0.5">
          ID: {{ deviceId }}
        </p>
        <div
          v-if="tags && tags.length > 0"
          class="flex flex-wrap gap-1.5 mt-2.5"
        >
          <span
            v-for="tag in tags"
            :key="tag"
            class="ship-badge ship-badge-success"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 text-sm bg-ink-900 text-white rounded-xl hover:bg-ink-800 touch-target transition-colors font-medium"
          @click="openModal"
        >
          Команда
        </button>
        <button
          :disabled="statusLoading"
          class="px-3 py-2 text-sm bg-ink-100 text-ink-600 rounded-xl hover:bg-ink-200 touch-target transition-colors font-medium"
          @click="$emit('ping')"
        >
          {{ statusLoading ? "Проверка..." : "Связь" }}
        </button>
        <span
          :class="[
            'ship-badge',
            statusUnknown
              ? 'ship-badge-muted'
              : isConnected
                ? 'ship-badge-success'
                : 'ship-badge-danger',
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              statusUnknown
                ? 'bg-ink-400'
                : isConnected
                  ? 'bg-brand-500'
                  : 'bg-red-400',
            ]"
          />
          {{
            statusUnknown
              ? "Статус неизвестен"
              : isConnected
                ? "В сети"
                : "Не в сети"
          }}
        </span>
      </div>
    </div>

    <!-- Модалка команды -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCommandModal"
          class="fixed inset-0 bg-ink-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          @click.self="closeModal"
          @keydown.escape="closeModal"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-dialog-title"
            class="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h2
              id="command-dialog-title"
              class="text-lg font-bold text-ink-900 mb-4"
            >
              Отправить команду
            </h2>

            <div class="space-y-4">
              <div>
                <label
                  class="block text-sm font-medium text-ink-700 mb-1.5"
                  for="command-input"
                >Команда</label>
                <input
                  id="command-input"
                  ref="commandInput"
                  v-model="command"
                  type="text"
                  class="ship-field"
                  placeholder="Название команды"
                >
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="block text-sm font-medium text-ink-700">Аргументы</span>
                  <button
                    type="button"
                    class="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    @click="addArg"
                  >
                    + Добавить
                  </button>
                </div>
                <div
                  v-for="(arg, index) in args"
                  :key="index"
                  class="flex gap-2 mb-2"
                >
                  <label
                    class="sr-only"
                    :for="`arg-key-${index}`"
                  >Ключ аргумента {{ index + 1 }}</label>
                  <input
                    :id="`arg-key-${index}`"
                    v-model="arg.key"
                    type="text"
                    class="ship-field py-2 text-sm"
                    placeholder="Ключ"
                  >
                  <label
                    class="sr-only"
                    :for="`arg-value-${index}`"
                  >Значение аргумента {{ index + 1 }}</label>
                  <input
                    :id="`arg-value-${index}`"
                    v-model="arg.value"
                    type="text"
                    class="ship-field py-2 text-sm"
                    placeholder="Значение"
                  >
                  <button
                    type="button"
                    class="px-2 text-ink-400 hover:text-red-500 text-lg leading-none shrink-0"
                    :aria-label="`Удалить аргумент ${index + 1}`"
                    @click="removeArg(index)"
                  >
                    &times;
                  </button>
                </div>
                <p
                  v-if="args.length === 0"
                  class="text-xs text-ink-400 italic"
                >
                  Нет аргументов
                </p>
              </div>

              <p
                v-if="error"
                role="alert"
                class="text-sm text-red-600"
              >
                {{ error }}
              </p>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                class="px-4 py-2.5 text-sm text-ink-600 border border-ink-200 rounded-xl hover:bg-ink-50 transition-colors font-medium"
                @click="closeModal"
              >
                Отмена
              </button>
              <button
                :disabled="sending || !command.trim()"
                class="px-4 py-2.5 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:pointer-events-none transition-colors font-semibold"
                @click="submitCommand"
              >
                {{ sending ? "Отправка..." : "Отправить" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { sendDeviceCommand } from "@/data";

const props = defineProps<{
  name: string;
  deviceId: string;
  isConnected: boolean;
  statusUnknown?: boolean;
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
const commandInput = ref<HTMLInputElement | null>(null);

const openModal = async () => {
  showCommandModal.value = true;
  await nextTick();
  commandInput.value?.focus();
};

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
  const argsObj: Record<string, string | number> = {};
  for (const arg of args.value) {
    if (arg.key.trim()) {
      const numVal = Number(arg.value);
      argsObj[arg.key.trim()] =
        !isNaN(numVal) && arg.value !== "" ? numVal : arg.value;
    }
  }

  const result = await sendDeviceCommand(
    props.deviceId,
    command.value.trim(),
    argsObj
  );
  result.map(closeModal).inspectErr((err) => {
    error.value = err;
  });
  sending.value = false;
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: translateY(20px);
}
</style>
