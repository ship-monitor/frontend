<template>
    <div class="space-y-6">
        <div class="bg-white rounded-xl border p-6">
            <h2 class="text-lg font-semibold mb-4">Отправка команд</h2>

            <div v-if="!isConnected"
                class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                Устройство не в сети. Команда может не дойти.
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Команда</label>
                    <div class="relative">
                        <select v-model="selectedCommand" @change="onCommandSelect"
                            class="w-full px-4 py-3 border rounded-lg text-base appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">-- Выберите команду --</option>
                            <option v-for="cmd in commandList" :key="cmd.value" :value="cmd.value">
                                {{ cmd.label }}
                            </option>
                            <option value="__custom__">Своя команда...</option>
                        </select>
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <div v-if="selectedCommand === '__custom__'">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Название команды</label>
                    <input v-model="commandName" type="text" placeholder="Например: reboot, get_logs"
                        class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        Аргументы (JSON, опционально)
                    </label>
                    <textarea v-model="commandArgs" rows="3" placeholder='{"key": "value"}'
                        class="w-full px-4 py-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>

                <div v-if="previewRequest" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p class="text-xs text-gray-500 mb-1.5">Тело запроса:</p>
                    <pre class="text-xs font-mono text-gray-800 overflow-x-auto">{{ previewRequest }}</pre>
                </div>

                <button @click="handleExecute" :disabled="!canSend || sending"
                    class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium transition-colors touch-target">
                    {{ sending ? 'Отправка...' : 'Отправить команду' }}
                </button>
            </div>

            <!-- Результат -->
            <div v-if="result" class="mt-4">
                <div v-if="result.requestError" class="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p class="text-sm font-medium text-red-800 mb-2">Ошибка отправки</p>
                    <p class="text-sm text-red-700">{{ result.requestError }}</p>
                </div>

                <div v-else-if="result.commandError" class="p-4 rounded-lg bg-orange-50 border border-orange-200">
                    <p class="text-sm font-medium text-orange-800 mb-2">Ошибка</p>
                    <p class="text-sm text-orange-700">{{ result.commandError }}</p>
                    <pre v-if="result.rawResponse && result.rawResponse !== 'null'"
                        class="mt-2 text-xs bg-gray-900 text-orange-400 p-3 rounded overflow-x-auto max-h-60">{{ result.rawResponse }}</pre>
                </div>

                <div v-else class="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <p class="text-xs text-gray-500 mb-2">Ответ устройства:</p>
                    <pre
                        class="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto max-h-60">{{ result.rawResponse || 'null' }}</pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
    isConnected: boolean
    sending: boolean
    result: {
        requestError?: string
        commandError?: string
        rawResponse?: string
    } | null
}>()

const emit = defineEmits<{
    execute: [command: string, args: Record<string, any>]
}>()

const commandList = [
    { value: 'ping', label: 'Пинг (проверка связи)' },
    { value: 'get-temperature', label: 'Запросить температуру' },
    { value: 'reboot', label: 'Перезагрузка' },
    { value: 'restart_service', label: 'Рестарт сервиса' },
    { value: 'get_status', label: 'Статус устройства' },
    { value: 'start_defrost', label: 'Запустить оттайку' },
    { value: 'stop_defrost', label: 'Остановить оттайку' },
    { value: 'get_config', label: 'Получить конфигурацию' },
    { value: 'get_logs', label: 'Получить логи' },
]

const selectedCommand = ref('')
const commandName = ref('')
const commandArgs = ref('')

const canSend = computed(() => {
    if (selectedCommand.value === '__custom__') return !!commandName.value.trim()
    return !!selectedCommand.value
})

const currentCommand = computed(() => {
    if (selectedCommand.value === '__custom__') return commandName.value.trim()
    return selectedCommand.value
})

const currentArgs = computed(() => {
    if (!commandArgs.value.trim()) return {}
    try { return JSON.parse(commandArgs.value) }
    catch { return {} }
})

const previewRequest = computed(() => {
    if (!currentCommand.value) return null
    return JSON.stringify({ command: currentCommand.value, args: currentArgs.value }, null, 2)
})

function onCommandSelect() {
    if (selectedCommand.value !== '__custom__' && selectedCommand.value) {
        commandName.value = selectedCommand.value
    } else if (selectedCommand.value === '__custom__') {
        commandName.value = ''
    } else {
        commandName.value = ''
    }
}

function handleExecute() {
    const cmd = currentCommand.value
    if (!cmd) return
    emit('execute', cmd, currentArgs.value)
    selectedCommand.value = ''
    commandName.value = ''
    commandArgs.value = ''
}
</script>