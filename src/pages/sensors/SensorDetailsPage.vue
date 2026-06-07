<template>
    <div class="max-w-7xl mx-auto p-4 sm:p-6">
        <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>

        <div v-else>
            <!-- Шапка -->
            <div class="mb-6">
                <button @click="$router.back()"
                    class="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1 touch-target">
                    &larr; Назад
                </button>
                <div class="flex flex-wrap justify-between items-start gap-3">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800">{{ sensorName }}</h1>
                        <p class="text-xs text-gray-400 font-mono">ID: {{ deviceId }}</p>
                        <div v-if="settings.tags && settings.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
                            <span v-for="tag in settings.tags" :key="tag"
                                class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click="pingAndUpdateStatus" :disabled="statusLoading"
                            class="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 touch-target">
                            {{ statusLoading ? 'Проверка...' : 'Проверить связь' }}
                        </button>
                        <span :class="[
                            'px-3 py-1 rounded-full text-sm font-medium',
                            deviceIsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        ]">
                            {{ deviceIsConnected ? 'В сети' : 'Не в сети' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Вкладки -->
            <div class="border-b mb-6 overflow-x-auto">
                <div class="flex gap-2 sm:gap-4 min-w-max">
                    <button @click="activeTab = 'temperature'" :class="tabClass('temperature')">Температура</button>
                    <button @click="activeTab = 'commands'" :class="tabClass('commands')">Команды</button>
                    <button @click="activeTab = 'info'" :class="tabClass('info')">Информация</button>
                </div>
            </div>

            <!-- ===== ТЕМПЕРАТУРА ===== -->
            <div v-if="activeTab === 'temperature'" class="space-y-6">
                <div class="bg-white rounded-xl border p-6 text-center">
                    <p class="text-sm text-gray-500 mb-2">Текущая температура</p>
                    <div class="text-6xl font-bold mb-2" :class="tempColor">
                        {{ currentTemp !== null ? currentTemp.toFixed(1) + '°C' : '--' }}
                    </div>
                    <p class="text-xs text-gray-400 mb-4">{{ lastTempTime || 'Нет данных' }}</p>
                    <button @click="refreshTemperature" :disabled="tempLoading"
                        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm touch-target">
                        {{ tempLoading ? 'Запрос...' : 'Запросить температуру' }}
                    </button>
                    <p v-if="tempError" class="text-xs mt-2"
                        :class="tempError.includes('Ошибка') || tempError.includes('не вернуло') ? 'text-red-500' : 'text-gray-500'">
                        {{ tempError }}
                    </p>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button v-for="period in periods" :key="period.value" @click="selectedPeriod = period.value" :class="[
                        'px-4 py-2 text-sm rounded-lg transition-colors touch-target',
                        selectedPeriod === period.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]">
                        {{ period.label }}
                    </button>
                </div>

                <div class="bg-white rounded-xl border p-6">
                    <h2 class="text-lg font-semibold mb-4">График температуры</h2>
                    <div v-if="filteredHistory.length === 0" class="text-center py-12 text-gray-500">
                        Нет данных за выбранный период
                    </div>
                    <div v-else>
                        <canvas ref="chartCanvas" class="w-full h-64 sm:h-96"></canvas>
                    </div>
                </div>
            </div>

            <!-- ===== КОМАНДЫ ===== -->
            <div v-if="activeTab === 'commands'" class="space-y-6">
                <div class="bg-white rounded-xl border p-6">
                    <h2 class="text-lg font-semibold mb-4">Отправка команд</h2>

                    <div v-if="!deviceIsConnected"
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
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
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

                        <button @click="executeCommand" :disabled="!canSendCommand || sendingCommand"
                            class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium transition-colors touch-target">
                            {{ sendingCommand ? 'Отправка...' : 'Отправить команду' }}
                        </button>
                    </div>

                    <div v-if="commandResult" class="mt-4 p-4 rounded-lg"
                        :class="commandResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
                        <p class="text-sm font-medium mb-2"
                            :class="commandResult.success ? 'text-green-800' : 'text-red-800'">
                            {{ commandResult.success ? 'Команда выполнена' : 'Ошибка' }}
                        </p>
                        <p class="text-sm mb-2" :class="commandResult.success ? 'text-green-700' : 'text-red-700'">
                            {{ commandResult.message }}
                        </p>
                        <pre v-if="commandResult.rawResponse"
                            class="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto max-h-60">{{ commandResult.rawResponse }}</pre>
                    </div>
                </div>
            </div>

            <!-- ===== ИНФОРМАЦИЯ ===== -->
            <div v-if="activeTab === 'info'" class="space-y-6">
                <div class="bg-white rounded-xl border p-6">
                    <h2 class="text-lg font-semibold mb-6">Настройки устройства</h2>

                    <div class="space-y-6">
                        <!-- Название -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Название устройства</label>
                            <input v-model="settings.name" type="text" placeholder="Холодильник N1"
                                class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        <!-- Температурные границы -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                                    Нижняя граница (C)
                                </label>
                                <input v-model.number="settings.minThreshold" type="number" step="0.5"
                                    class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                                    Верхняя граница (C)
                                </label>
                                <input v-model.number="settings.maxThreshold" type="number" step="0.5"
                                    class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>

                        <!-- Теги -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Теги</label>
                            <p class="text-xs text-gray-500 mb-2">
                                Используются для поиска и фильтрации устройств на дашборде
                            </p>

                            <!-- Существующие теги -->
                            <div v-if="settings.tags && settings.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
                                <span v-for="tag in settings.tags" :key="tag"
                                    class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-1.5">
                                    {{ tag }}
                                    <button @click="removeTag(tag)"
                                        class="text-blue-400 hover:text-red-500 transition-colors ml-0.5">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            </div>

                            <!-- Добавление тега -->
                            <div class="flex gap-2">
                                <input v-model="newTag" type="text" placeholder="Новый тег"
                                    class="flex-1 px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
                                    @keyup.enter="addTag" />
                                <button @click="addTag" :disabled="!newTag.trim()"
                                    class="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm font-medium touch-target">
                                    Добавить
                                </button>
                            </div>
                        </div>

                        <!-- Телефон -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                                Номер телефона для SMS-уведомлений
                            </label>
                            <input v-model="settings.phone" type="tel" placeholder="+7XXXXXXXXXX"
                                class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        <!-- Частота SMS -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                                Частота SMS-уведомлений
                            </label>
                            <div class="relative">
                                <select v-model="settings.smsFrequency"
                                    class="w-full px-4 py-3 border rounded-lg text-base appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="never">Не отправлять</option>
                                    <option value="signal_loss">Только при потере связи</option>
                                    <option value="threshold">При выходе за границы температуры</option>
                                    <option value="both">При потере связи и выходе за границы</option>
                                </select>
                                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">
                                {{ smsFrequencyHint }}
                            </p>
                        </div>

                        <!-- Время оттайки -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                                Время оттайки (минут)
                            </label>
                            <input v-model.number="settings.defrostTime" type="number" min="1"
                                class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        <!-- Кнопки -->
                        <div class="flex justify-end gap-3 pt-4 border-t">
                            <button @click="loadSettingsFromStorage"
                                class="px-6 py-2.5 border rounded-lg hover:bg-gray-50 text-sm touch-target">
                                Отмена
                            </button>
                            <button @click="saveSettings" :disabled="saving"
                                class="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm touch-target font-medium">
                                {{ saving ? 'Сохранение...' : 'Сохранить' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { sendDeviceCommand, findOrganizationIdByDeviceId } from '@/data'

const route = useRoute()
const deviceId = route.params.id as string
const organizationId = ref((route.query.orgId as string) || '')

const loading = ref(true)
const tempLoading = ref(false)
const statusLoading = ref(false)
const saving = ref(false)
const sendingCommand = ref(false)
const activeTab = ref('temperature')
const deviceIsConnected = ref(false)
const sensorName = ref('')

const currentTemp = ref<number | null>(null)
const lastTempTime = ref('')
const tempError = ref('')
const tempHistory = ref<Array<{ time: string; value: number; timestamp: number }>>([])
const selectedPeriod = ref('24h')

const periods = [
    { label: 'Час', value: '1h', ms: 60 * 60 * 1000 },
    { label: '2 часа', value: '2h', ms: 2 * 60 * 60 * 1000 },
    { label: '3 часа', value: '3h', ms: 3 * 60 * 60 * 1000 },
    { label: '6 часов', value: '6h', ms: 6 * 60 * 60 * 1000 },
    { label: '12 часов', value: '12h', ms: 12 * 60 * 60 * 1000 },
    { label: '1 день', value: '1d', ms: 24 * 60 * 60 * 1000 },
    { label: '2 дня', value: '2d', ms: 48 * 60 * 60 * 1000 },
]

const selectedCommand = ref('')
const commandName = ref('')
const commandArgs = ref('')
const commandResult = ref<{ success: boolean; message: string; data?: any; rawResponse?: string } | null>(null)

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

const settings = ref<{
    name: string
    minThreshold: number
    maxThreshold: number
    phone: string
    smsFrequency: string
    defrostTime: number
    tags: string[]
}>({
    name: '',
    minThreshold: -17,
    maxThreshold: -15,
    phone: '',
    smsFrequency: 'both',
    defrostTime: 30,
    tags: [],
})

const newTag = ref('')

const chartCanvas = ref<HTMLCanvasElement | null>(null)

const canSendCommand = computed(() => {
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

const tempColor = computed(() => {
    if (!deviceIsConnected.value) return 'text-gray-400'
    if (currentTemp.value === null) return 'text-gray-400'
    const t = currentTemp.value
    if (t < settings.value.minThreshold || t > settings.value.maxThreshold) return 'text-red-600'
    if (t < -20) return 'text-blue-600'
    if (t < -10) return 'text-blue-500'
    if (t < 0) return 'text-cyan-500'
    if (t < 10) return 'text-green-500'
    if (t < 25) return 'text-lime-500'
    return 'text-orange-500'
})

const filteredHistory = computed(() => {
    const period = periods.find(p => p.value === selectedPeriod.value)
    if (!period) return tempHistory.value
    const cutoff = Date.now() - period.ms
    return tempHistory.value.filter(item => item.timestamp >= cutoff)
})

const smsFrequencyHint = computed(() => {
    switch (settings.value.smsFrequency) {
        case 'never': return 'SMS-уведомления отключены'
        case 'signal_loss': return 'SMS будет отправлено только если устройство перестанет выходить на связь'
        case 'threshold': return 'SMS будет отправлено при выходе температуры за заданные границы'
        case 'both': return 'SMS будет отправлено при потере связи и при выходе температуры за границы'
        default: return ''
    }
})

function tabClass(tab: string) {
    return [
        'px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap touch-target',
        activeTab.value === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    ]
}

function getDisplayName(): string {
    if (settings.value.name && settings.value.name.trim() !== '') return settings.value.name
    return deviceId.substring(0, 8)
}

const STORAGE_KEY = `device_data_${deviceId}`
const SETTINGS_KEY = `device_settings_${deviceId}`

function loadStoredData() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        try {
            const data = JSON.parse(stored)
            if (data.tempHistory) tempHistory.value = data.tempHistory
            if (data.currentTemp !== undefined) currentTemp.value = data.currentTemp
            if (data.lastTempTime) lastTempTime.value = data.lastTempTime
        } catch { /* */ }
    }
}

function saveStoredData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tempHistory: tempHistory.value.slice(-200),
        currentTemp: currentTemp.value,
        lastTempTime: lastTempTime.value,
    }))
}

function loadSettingsFromStorage() {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            settings.value = {
                name: parsed.name || '',
                minThreshold: parsed.minThreshold ?? -17,
                maxThreshold: parsed.maxThreshold ?? -15,
                phone: parsed.phone || '',
                smsFrequency: parsed.smsFrequency || 'both',
                defrostTime: parsed.defrostTime ?? 30,
                tags: parsed.tags || [],
            }
        } catch { /* */ }
    }
    sensorName.value = getDisplayName()
}

function saveSettings() {
    saving.value = true
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    sensorName.value = getDisplayName()
    setTimeout(() => { saving.value = false }, 300)
}

// ===== Теги =====
function addTag() {
    const tag = newTag.value.trim()
    if (!tag) return
    if (settings.value.tags.includes(tag)) {
        newTag.value = ''
        return
    }
    settings.value.tags.push(tag)
    newTag.value = ''
    saveSettings()
}

function removeTag(tag: string) {
    settings.value.tags = settings.value.tags.filter(t => t !== tag)
    saveSettings()
}

// ===== Пинг =====
async function pingAndUpdateStatus() {
    if (!organizationId.value) return
    statusLoading.value = true
    try {
        const result = await sendDeviceCommand(organizationId.value, deviceId, 'ping', {})
        deviceIsConnected.value = !result.requestError && !result.commandError
    } catch {
        deviceIsConnected.value = false
    } finally {
        statusLoading.value = false
    }
}

// ===== Температура =====
async function refreshTemperature() {
    if (!organizationId.value) return
    tempLoading.value = true
    tempError.value = ''

    const result = await sendDeviceCommand(organizationId.value, deviceId, 'get-temperature', {})

    if (result.requestError) {
        tempError.value = `Ошибка связи: ${result.requestError}`
        deviceIsConnected.value = false
        tempLoading.value = false
        return
    }

    if (result.commandError) {
        tempError.value = `Устройство вернуло ошибку: ${result.commandError}`
        tempLoading.value = false
        return
    }

    deviceIsConnected.value = true

    const temp = result.data?.temperature ?? result.data?.value ?? result.data?.temp
    if (temp !== undefined && temp !== null) {
        const numTemp = typeof temp === 'number' ? temp : parseFloat(temp)
        if (!isNaN(numTemp)) {
            const now = Date.now()
            currentTemp.value = numTemp
            lastTempTime.value = new Date().toLocaleString('ru-RU')
            tempError.value = ''
            tempHistory.value.push({ time: new Date().toLocaleString('ru-RU'), value: numTemp, timestamp: now })
            saveStoredData()
            await nextTick()
            drawChart()
        } else {
            tempError.value = 'Некорректное значение температуры'
        }
    } else if (result.data && Object.keys(result.data).length > 0) {
        tempError.value = `Ответ без температуры: ${JSON.stringify(result.data)}`
    } else {
        tempError.value = 'Устройство не вернуло данные о температуре'
    }

    tempLoading.value = false
}

// ===== Команды =====
function onCommandSelect() {
    if (selectedCommand.value !== '__custom__' && selectedCommand.value) {
        commandName.value = selectedCommand.value
    } else if (selectedCommand.value === '__custom__') {
        commandName.value = ''
    } else {
        commandName.value = ''
    }
}

async function executeCommand() {
    if (!organizationId.value) {
        commandResult.value = { success: false, message: 'Устройство не привязано к организации' }
        return
    }

    const cmd = currentCommand.value
    if (!cmd) return

    sendingCommand.value = true
    commandResult.value = null

    const args = currentArgs.value
    const result = await sendDeviceCommand(organizationId.value, deviceId, cmd, args)

    if (result.requestError) {
        commandResult.value = {
            success: false,
            message: `Ошибка отправки: ${result.requestError}`,
            rawResponse: JSON.stringify({ requestError: result.requestError }, null, 2)
        }
        deviceIsConnected.value = false
    } else if (result.commandError) {
        commandResult.value = {
            success: false,
            message: `Устройство вернуло ошибку: ${result.commandError}`,
            rawResponse: JSON.stringify({ commandError: result.commandError, data: result.data }, null, 2)
        }
        deviceIsConnected.value = true
    } else if (result.data && Object.keys(result.data).length > 0) {
        commandResult.value = {
            success: true,
            message: `Команда "${cmd}" выполнена, получен ответ`,
            data: result.data,
            rawResponse: JSON.stringify(result.data, null, 2)
        }
        deviceIsConnected.value = true

        if (cmd === 'get-temperature') {
            const temp = result.data.temperature ?? result.data.value ?? result.data.temp
            if (temp !== undefined && temp !== null) {
                const numTemp = typeof temp === 'number' ? temp : parseFloat(temp)
                if (!isNaN(numTemp)) {
                    currentTemp.value = numTemp
                    lastTempTime.value = new Date().toLocaleString('ru-RU')
                    tempError.value = ''
                    tempHistory.value.push({ time: new Date().toLocaleString('ru-RU'), value: numTemp, timestamp: Date.now() })
                    saveStoredData()
                }
            }
        }

        if (cmd === 'ping') {
            commandResult.value.message = 'Устройство в сети, пинг успешен'
        }
    } else {
        commandResult.value = {
            success: true,
            message: `Команда "${cmd}" отправлена. Устройство не вернуло данных.`,
            rawResponse: '{}'
        }
        deviceIsConnected.value = true
    }

    sendingCommand.value = false
}

// ===== График =====
function drawChart() {
    if (!chartCanvas.value || filteredHistory.value.length === 0) return
    const canvas = chartCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = canvas.parentElement
    if (container) {
        canvas.width = container.clientWidth - 32
        canvas.height = 300
    }

    const { width, height } = canvas
    const padding = 40
    ctx.clearRect(0, 0, width, height)

    if (filteredHistory.value.length < 2) {
        ctx.fillStyle = '#999'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Недостаточно данных', width / 2, height / 2)
        return
    }

    const values = filteredHistory.value.map(d => d.value)
    const minVal = Math.min(...values) - 2
    const maxVal = Math.max(...values) + 2
    const range = maxVal - minVal || 1
    const stepX = (width - padding * 2) / (filteredHistory.value.length - 1)

    ctx.strokeStyle = '#e5e7eb'
    ctx.fillStyle = '#9ca3af'
    ctx.font = '11px sans-serif'
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height - padding * 2) * (i / 4)
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
        ctx.fillText((maxVal - range * i / 4).toFixed(1) + 'C', 5, y + 3)
    }

    ctx.beginPath()
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    filteredHistory.value.forEach((item, i) => {
        const x = padding + i * stepX
        const y = padding + (height - padding * 2) * ((maxVal - item.value) / range)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    filteredHistory.value.forEach((item, i) => {
        const x = padding + i * stepX
        const y = padding + (height - padding * 2) * ((maxVal - item.value) / range)
        ctx.fillStyle = '#3b82f6'
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
    })
}

watch(selectedPeriod, async () => { await nextTick(); drawChart() })
watch(activeTab, async (tab) => { if (tab === 'temperature') { await nextTick(); drawChart() } })

async function loadDeviceData() {
    if (!organizationId.value) {
        const found = await findOrganizationIdByDeviceId(deviceId)
        if (found) {
            organizationId.value = found
            localStorage.setItem(`device_org_${deviceId}`, found)
        }
    }

    if (!organizationId.value) {
        loading.value = false
        return
    }

    loadStoredData()
    loadSettingsFromStorage()

    await pingAndUpdateStatus()

    loading.value = false
}

onMounted(async () => {
    await loadDeviceData()
    await nextTick()
    drawChart()
})
</script>