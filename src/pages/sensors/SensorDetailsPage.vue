<template>
    <div class="max-w-7xl mx-auto p-4 sm:p-6">
        <div v-if="loading" class="text-center py-12">
            <div class="animate-spin text-4xl mb-2">⚡</div>
            <p class="text-gray-500">Загрузка...</p>
        </div>

        <div v-else>
            <!-- Шапка -->
            <div class="mb-6">
                <button @click="$router.back()"
                    class="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
                    ← Назад
                </button>
                <div class="flex flex-wrap justify-between items-start gap-3">
                    <div>
                        <h1 class="text-2xl font-bold">{{ sensorName }}</h1>
                        <p class="text-xs text-gray-400 font-mono">ID: {{ deviceId }}</p>
                        <p class="text-xs text-green-600 font-mono mt-1">Организация: {{ organizationId }}</p>
                    </div>
                    <div class="flex gap-2">
                        <span :class="[
                            'px-3 py-1 rounded-full text-sm font-medium',
                            wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        ]">
                            {{ wsConnected ? '🟢 Online' : '🔴 Offline' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Вкладки -->
            <div class="border-b mb-6 overflow-x-auto">
                <div class="flex gap-2 sm:gap-4 min-w-max">
                    <button @click="activeTab = 'current'" :class="[
                        'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                        activeTab === 'current' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                    ]">
                        📊 Текущие данные
                    </button>
                    <button @click="activeTab = 'chart'" :class="[
                        'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                        activeTab === 'chart' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                    ]">
                        📈 График температуры
                    </button>
                    <button @click="activeTab = 'commands'" :class="[
                        'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                        activeTab === 'commands' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                    ]">
                        🎮 Команды
                    </button>
                    <button @click="activeTab = 'settings'" :class="[
                        'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                        activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                    ]">
                        ⚙️ Настройки
                    </button>
                </div>
            </div>

            <!-- Текущие данные -->
            <div v-if="activeTab === 'current'">
                <div class="bg-white rounded-xl border p-6">
                    <div class="text-center py-8">
                        <div class="text-6xl font-bold mb-3" :class="temperatureClass">
                            {{ currentTemperature !== null ? currentTemperature.toFixed(1) + '°C' : '--' }}
                        </div>
                        <div class="text-sm text-gray-500">
                            Норма: {{ settings.minTemp }}°C ... {{ settings.maxTemp }}°C
                        </div>
                        <div class="text-xs text-gray-400 mt-2">
                            {{ currentTime }}
                        </div>
                    </div>

                    <div class="mt-4 p-4 rounded-lg" :class="statusBgClass">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">{{ statusIcon }}</span>
                            <p class="font-medium">{{ statusMessage }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- График температуры -->
            <div v-if="activeTab === 'chart'">
                <div class="bg-white rounded-xl border p-6">
                    <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
                        <h2 class="text-lg font-semibold">История температуры</h2>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="period in periods" :key="period.value" @click="selectPeriod(period.value)"
                                :class="[
                                    'px-3 py-1.5 text-sm rounded-lg transition-colors',
                                    selectedPeriod === period.value
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                ]">
                                {{ period.label }}
                            </button>
                        </div>
                    </div>

                    <div v-if="loadingHistory" class="text-center py-12">
                        <div class="animate-spin text-3xl mb-2">⚡</div>
                        <p class="text-gray-500">Загрузка данных...</p>
                    </div>

                    <div v-else-if="historyData.length === 0" class="text-center py-12 text-gray-500">
                        Нет данных за выбранный период
                    </div>

                    <div v-else>
                        <canvas ref="chartCanvas" class="w-full h-64 sm:h-96"></canvas>

                        <div class="overflow-x-auto mt-4">
                            <table class="w-full text-sm">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-3 py-2 text-left">Время</th>
                                        <th class="px-3 py-2 text-left">Температура</th>
                                        <th class="px-3 py-2 text-left">Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in historyData.slice(-10).reverse()" :key="item.time"
                                        class="border-t">
                                        <td class="px-3 py-2 text-xs">{{ formatTime(item.time) }}</td>
                                        <td class="px-3 py-2" :class="getTempColor(item.value)">
                                            {{ item.value.toFixed(1) }}°C
                                        </td>
                                        <td class="px-3 py-2">
                                            <span
                                                :class="item.value >= settings.minTemp && item.value <= settings.maxTemp ? 'text-green-600' : 'text-red-600'">
                                                {{ item.value >= settings.minTemp && item.value <= settings.maxTemp
                                                    ? '✓ Норма' : '⚠️ Нарушение' }} </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Команды -->
            <div v-if="activeTab === 'commands'">
                <div class="bg-white rounded-xl border p-6">
                    <h2 class="text-lg font-semibold mb-4">Управление устройством</h2>

                    <div v-if="!wsConnected" class="mb-4 p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                        ⚠️ Устройство не в сети. Команды будут отправлены при восстановлении соединения.
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Название команды
                            </label>
                            <input v-model="commandName" type="text" placeholder="например: reboot, restart, get_status"
                                class="w-full px-4 py-2 border rounded-lg" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Аргументы (JSON)
                            </label>
                            <textarea v-model="commandArgs" rows="3" placeholder='{"key": "value"}'
                                class="w-full px-4 py-2 border rounded-lg font-mono text-sm"></textarea>
                            <p class="text-xs text-gray-500 mt-1">
                                Аргументы в формате JSON (опционально)
                            </p>
                        </div>

                        <button @click="executeCommand" :disabled="!commandName.trim() || sendingCommand"
                            class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium">
                            {{ sendingCommand ? 'Отправка...' : 'Отправить команду' }}
                        </button>
                    </div>

                    <div v-if="commandResult" class="mt-4 p-3 rounded-lg"
                        :class="commandResult.success ? 'bg-green-50' : 'bg-red-50'">
                        <p class="text-sm font-medium"
                            :class="commandResult.success ? 'text-green-800' : 'text-red-800'">
                            {{ commandResult.success ? '✅ Успешно' : '❌ Ошибка' }}
                        </p>
                        <p class="text-sm mt-1" :class="commandResult.success ? 'text-green-700' : 'text-red-700'">
                            {{ commandResult.message }}
                        </p>
                        <pre v-if="commandResult.data"
                            class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">{{ JSON.stringify(commandResult.data, null, 2) }}</pre>
                    </div>
                </div>
            </div>

            <!-- Настройки -->
            <div v-if="activeTab === 'settings'">
                <div class="bg-white rounded-xl border p-6">
                    <h2 class="text-lg font-semibold mb-6">Настройки датчика</h2>

                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Название датчика
                            </label>
                            <input v-model="settings.name" type="text" class="w-full px-4 py-2 border rounded-lg" />
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Нижняя граница (°C)
                                </label>
                                <input v-model.number="settings.minTemp" type="number" step="0.5"
                                    class="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Верхняя граница (°C)
                                </label>
                                <input v-model.number="settings.maxTemp" type="number" step="0.5"
                                    class="w-full px-4 py-2 border rounded-lg" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Номер телефона для SMS
                            </label>
                            <input v-model="settings.phone" type="tel" placeholder="+7XXXXXXXXXX"
                                class="w-full px-4 py-2 border rounded-lg" />
                            <p class="text-xs text-gray-500 mt-1">
                                На этот номер будут приходить уведомления
                            </p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Время оттайки (мин)
                                </label>
                                <input v-model.number="settings.defrostTime" type="number" min="1"
                                    class="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Температура оттайки (°C)
                                </label>
                                <input v-model.number="settings.defrostTemp" type="number" step="0.5"
                                    class="w-full px-4 py-2 border rounded-lg" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Теги
                            </label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <span v-for="tag in settings.tags" :key="tag"
                                    class="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1">
                                    {{ tag }}
                                    <button @click="removeTag(tag)" class="text-red-500">×</button>
                                </span>
                            </div>
                            <div class="flex gap-2">
                                <input v-model="newTag" type="text" placeholder="Новый тег"
                                    class="flex-1 px-4 py-2 border rounded-lg" @keyup.enter="addTag" />
                                <button @click="addTag"
                                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    Добавить
                                </button>
                            </div>
                        </div>

                        <div class="flex justify-end gap-3 pt-4">
                            <button @click="loadSettings" class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                                Отмена
                            </button>
                            <button @click="saveSettings" :disabled="saving"
                                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'
import { sendDeviceCommand, getUsersOrganizations, getOrganizationDevices } from '@/data'

const route = useRoute()
const deviceId = route.params.id as string
// Получаем organizationId из query параметра или localStorage
const organizationId = ref((route.query.orgId as string) || localStorage.getItem(`device_org_${deviceId}`) || '')

console.log('📡 Device ID:', deviceId)
console.log('🏢 Organization ID from query/localStorage:', organizationId.value)

// Состояние
const loading = ref(true)
const loadingHistory = ref(false)
const saving = ref(false)
const sendingCommand = ref(false)
const activeTab = ref('current')
const sensorName = ref('Датчик')
const currentTemperature = ref<number | null>(null)
const currentTime = ref('')
const commandResult = ref<{ success: boolean; message: string; data?: any } | null>(null)
const commandName = ref('')
const commandArgs = ref('')

// График
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const selectedPeriod = ref('24h')
const periods = [
    { label: '1 час', value: '1h', hours: 1 },
    { label: '6 часов', value: '6h', hours: 6 },
    { label: '12 часов', value: '12h', hours: 12 },
    { label: '24 часа', value: '24h', hours: 24 },
    { label: '2 дня', value: '2d', hours: 48 },
    { label: '3 дня', value: '3d', hours: 72 },
    { label: 'Неделя', value: '7d', hours: 168 }
]
const historyData = ref<Array<{ time: string; value: number }>>([])

// Настройки
const settings = ref({
    name: '',
    minTemp: -17,
    maxTemp: -15,
    phone: '',
    defrostTime: 30,
    defrostTemp: -9,
    tags: [] as string[]
})
const newTag = ref('')

// WebSocket
const token = localStorage.getItem("token")?.replace(/^"|$/g, "") || ""
const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws"

const { isConnected: wsConnected, subscribe, sendCommand: wsSendCommand } = useWebSocket({
    url: wsUrl,
    token,
    onMessage: (message) => {
        if (message.type === "sensor_data" && message.deviceId === deviceId && message.data) {
            const newValue = message.data.value ?? null
            if (newValue !== null) {
                currentTemperature.value = newValue
                currentTime.value = new Date().toLocaleString('ru-RU')
                addToHistory(newValue)
            }
        }
    },
})

// Вычисляемые свойства
const isWithinRange = computed(() => {
    if (currentTemperature.value === null) return true
    return currentTemperature.value >= settings.value.minTemp && currentTemperature.value <= settings.value.maxTemp
})

const temperatureClass = computed(() => {
    if (currentTemperature.value === null) return 'text-gray-400'
    if (currentTemperature.value < -20) return 'text-blue-600'
    if (currentTemperature.value < -10) return 'text-blue-500'
    if (currentTemperature.value < 0) return 'text-cyan-500'
    if (currentTemperature.value < 10) return 'text-green-500'
    return 'text-orange-500'
})

const statusIcon = computed(() => {
    if (currentTemperature.value === null) return '⚪'
    return isWithinRange.value ? '🟢' : '🔴'
})

const statusMessage = computed(() => {
    if (currentTemperature.value === null) return 'Нет данных'
    return isWithinRange.value ? '✅ Температура в норме' : '⚠️ Температура вышла за пределы нормы!'
})

const statusBgClass = computed(() => {
    if (currentTemperature.value === null) return 'bg-gray-50'
    return isWithinRange.value ? 'bg-green-50' : 'bg-orange-50'
})

// Методы
const addToHistory = (value: number) => {
    const now = new Date()
    historyData.value.push({
        time: now.toISOString(),
        value: value
    })

    const periodHours = periods.find(p => p.value === selectedPeriod.value)?.hours || 24
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - periodHours)

    historyData.value = historyData.value.filter(item => new Date(item.time) > cutoffTime)
    drawChart()
}

const selectPeriod = (period: string) => {
    selectedPeriod.value = period
    const periodHours = periods.find(p => p.value === period)?.hours || 24
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - periodHours)

    historyData.value = historyData.value.filter(item => new Date(item.time) > cutoffTime)
    drawChart()
}

const drawChart = () => {
    if (!chartCanvas.value || historyData.value.length === 0) return

    const canvas = chartCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = canvas.parentElement
    if (container) {
        canvas.width = container.clientWidth - 32
        canvas.height = 300
    }

    const width = canvas.width
    const height = canvas.height
    const padding = 40

    ctx.clearRect(0, 0, width, height)

    if (historyData.value.length < 2) {
        ctx.fillStyle = '#999'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Недостаточно данных', width / 2, height / 2)
        return
    }

    const values = historyData.value.map(d => d.value)
    const minVal = Math.min(...values, settings.value.minTemp)
    const maxVal = Math.max(...values, settings.value.maxTemp)
    const range = maxVal - minVal || 1

    const stepX = (width - padding * 2) / (historyData.value.length - 1)

    ctx.strokeStyle = '#eee'
    ctx.fillStyle = '#999'
    ctx.font = '10px sans-serif'

    for (let i = 0; i <= 4; i++) {
        const y = padding + (height - padding * 2) * (i / 4)
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()

        const temp = maxVal - (range * i / 4)
        ctx.fillText(temp.toFixed(1) + '°C', 5, y + 3)
    }

    const normYMin = padding + (height - padding * 2) * ((maxVal - settings.value.maxTemp) / range)
    const normYMax = padding + (height - padding * 2) * ((maxVal - settings.value.minTemp) / range)

    ctx.fillStyle = 'rgba(0, 200, 0, 0.1)'
    ctx.fillRect(padding, normYMin, width - padding * 2, normYMax - normYMin)

    ctx.beginPath()
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = 2

    historyData.value.forEach((item, i) => {
        const x = padding + i * stepX
        const y = padding + (height - padding * 2) * ((maxVal - item.value) / range)

        if (i === 0) {
            ctx.moveTo(x, y)
        } else {
            ctx.lineTo(x, y)
        }
    })
    ctx.stroke()

    historyData.value.forEach((item, i) => {
        const x = padding + i * stepX
        const y = padding + (height - padding * 2) * ((maxVal - item.value) / range)

        ctx.fillStyle = item.value >= settings.value.minTemp && item.value <= settings.value.maxTemp ? '#00cc00' : '#ff4444'
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
    })
}

const formatTime = (isoTime: string) => {
    const date = new Date(isoTime)
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getTempColor = (value: number) => {
    if (value < settings.value.minTemp || value > settings.value.maxTemp) return 'text-red-600 font-medium'
    return 'text-green-600'
}

// Автоматическое получение organizationId если его нет
const loadOrganizationIdIfNeeded = async () => {
    if (organizationId.value) return true

    console.log('🔍 Organization ID not found, trying to find it...')
    try {
        const orgs = await getUsersOrganizations()
        for (const org of orgs) {
            const devices = await getOrganizationDevices(org.id)
            const found = devices.some(d => d.id === deviceId)
            if (found) {
                organizationId.value = org.id
                localStorage.setItem(`device_org_${deviceId}`, org.id)
                console.log(`✅ Found organization ${org.id} for device ${deviceId}`)
                return true
            }
        }
        console.error('❌ Device not found in any organization')
        return false
    } catch (error) {
        console.error('Failed to find organization:', error)
        return false
    }
}

const executeCommand = async () => {
    if (!commandName.value.trim()) return

    if (!organizationId.value) {
        commandResult.value = {
            success: false,
            message: 'Ошибка: ID организации не найден. Пожалуйста, вернитесь на главную и зайдите заново.'
        }
        return
    }

    sendingCommand.value = true
    commandResult.value = null

    let args = {}
    if (commandArgs.value.trim()) {
        try {
            args = JSON.parse(commandArgs.value)
        } catch (e) {
            commandResult.value = {
                success: false,
                message: 'Ошибка: неверный формат JSON в аргументах'
            }
            sendingCommand.value = false
            return
        }
    }

    try {
        const result = await sendDeviceCommand(organizationId.value, deviceId, commandName.value.trim(), args)

        if (result.requestError) {
            commandResult.value = {
                success: false,
                message: `Ошибка: ${result.requestError}`
            }
        } else if (result.commandError) {
            commandResult.value = {
                success: false,
                message: `Ошибка команды: ${result.commandError}`
            }
        } else {
            commandResult.value = {
                success: true,
                message: `Команда "${commandName.value}" успешно отправлена`,
                data: result.data
            }

            if (wsConnected.value) {
                wsSendCommand({ deviceId, action: commandName.value, payload: args })
            }
        }
    } catch (error: any) {
        commandResult.value = {
            success: false,
            message: `Ошибка: ${error.message}`
        }
    } finally {
        sendingCommand.value = false
    }
}

// Настройки
const addTag = () => {
    if (newTag.value.trim()) {
        settings.value.tags.push(newTag.value.trim())
        newTag.value = ''
    }
}

const removeTag = (tag: string) => {
    settings.value.tags = settings.value.tags.filter(t => t !== tag)
}

const loadSettings = () => {
    const saved = localStorage.getItem(`sensor_${deviceId}`)
    if (saved) {
        try {
            settings.value = JSON.parse(saved)
            sensorName.value = settings.value.name || 'Датчик'
        } catch (e) {
            console.error('Error loading settings', e)
        }
    }
}

const saveSettings = async () => {
    saving.value = true
    try {
        localStorage.setItem(`sensor_${deviceId}`, JSON.stringify(settings.value))
        sensorName.value = settings.value.name || 'Датчик'
        alert('Настройки сохранены')
    } catch (error) {
        console.error('Failed to save:', error)
        alert('Ошибка сохранения')
    } finally {
        saving.value = false
    }
}

// Следим за изменением данных для перерисовки графика
watch(historyData, () => {
    drawChart()
}, { deep: true })

watch(() => settings.value.minTemp, () => drawChart())
watch(() => settings.value.maxTemp, () => drawChart())

// Эмуляция данных (для демо, удалить при реальной работе)
const simulateData = () => {
    const interval = setInterval(() => {
        if (currentTemperature.value !== null) {
            const variation = (Math.random() - 0.5) * 1.5
            let newTemp = currentTemperature.value + variation
            newTemp = Math.max(-25, Math.min(-5, newTemp))
            currentTemperature.value = newTemp
            currentTime.value = new Date().toLocaleString('ru-RU')
            addToHistory(newTemp)
        }
    }, 10000)
    return interval
}

let simInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
    // Сначала пытаемся найти organizationId если его нет
    const hasOrgId = await loadOrganizationIdIfNeeded()

    if (!hasOrgId) {
        alert('Ошибка: не удалось определить организацию для этого устройства. Пожалуйста, убедитесь, что устройство подключено к организации.')
        loading.value = false
        return
    }

    loadSettings()
    subscribe(deviceId)

    currentTemperature.value = -15.5
    currentTime.value = new Date().toLocaleString('ru-RU')

    for (let i = 24; i >= 0; i--) {
        const time = new Date()
        time.setHours(time.getHours() - i)
        const value = -16 + (Math.random() * 4 - 2)
        historyData.value.push({ time: time.toISOString(), value })
    }

    simInterval = simulateData()
    loading.value = false
})

onUnmounted(() => {
    if (simInterval) clearInterval(simInterval)
})
</script>