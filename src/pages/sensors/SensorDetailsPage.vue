<template>
    <div class="max-w-7xl mx-auto p-4 sm:p-6">
        <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>

        <div v-else>
            <SensorHeader :name="sensorName" :device-id="deviceId" :is-connected="deviceIsConnected"
                :status-loading="statusLoading" :tags="settings.tags" @ping="pingAndUpdateStatus" />

            <SensorTabs v-model="activeTab" :tabs="tabs" @select="activeTab = $event" />

            <SensorTemperatureTab v-if="activeTab === 'temperature'" :current-temp="currentTemp"
                :last-temp-time="lastTempTime" :error="tempError" :loading="tempLoading"
                :selected-period="selectedPeriod" :history="tempHistory"
                :thresholds="{ min: settings.minThreshold, max: settings.maxThreshold }"
                :is-connected="deviceIsConnected" @refresh="refreshTemperature"
                @update:period="selectedPeriod = $event" />

            <SensorCommandsTab v-if="activeTab === 'commands'" :is-connected="deviceIsConnected"
                :sending="sendingCommand" :result="commandResult" @execute="executeCommand" />

            <SensorInfoTab v-if="activeTab === 'info'" :settings="settings" :saving="saving" @save="saveSettings"
                @cancel="loadSettingsFromStorage" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { sendDeviceCommand, findOrganizationIdByDeviceId } from '@/data'
import SensorHeader from './SensorHeader.vue'
import SensorTabs from './SensorTabs.vue'
import SensorTemperatureTab from './SensorTemperatureTab.vue'
import SensorCommandsTab from './SensorCommandsTab.vue'
import SensorInfoTab, { type SensorSettings } from './SensorInfoTab.vue'

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

const commandResult = ref<{
    requestError?: string
    commandError?: string
    rawResponse?: string
} | null>(null)

const settings = ref<SensorSettings>({
    name: '',
    minThreshold: -17,
    maxThreshold: -15,
    phone: '',
    smsFrequency: 'both',
    defrostTime: 30,
    tags: [],
})

const tabs = [
    { value: 'temperature', label: 'Температура' },
    { value: 'commands', label: 'Команды' },
    { value: 'info', label: 'Информация' },
]

const STORAGE_KEY = `device_data_${deviceId}`
const SETTINGS_KEY = `device_settings_${deviceId}`

function getDisplayName(): string {
    if (settings.value.name && settings.value.name.trim() !== '') return settings.value.name
    return deviceId.substring(0, 8)
}

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
            settings.value = { ...settings.value, ...parsed }
        } catch { /* */ }
    }
    sensorName.value = getDisplayName()
}

function saveSettings(s: SensorSettings) {
    saving.value = true
    settings.value = s
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    sensorName.value = getDisplayName()
    setTimeout(() => { saving.value = false }, 300)
}

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

    const data = result.data as Record<string, any> | null | undefined
    const temp = data?.temperature ?? data?.value ?? data?.temp
    if (temp !== undefined && temp !== null) {
        const numTemp = typeof temp === 'number' ? temp : parseFloat(temp)
        if (!isNaN(numTemp)) {
            currentTemp.value = numTemp
            lastTempTime.value = new Date().toLocaleString('ru-RU')
            tempError.value = ''
            tempHistory.value.push({
                time: new Date().toLocaleString('ru-RU'),
                value: numTemp,
                timestamp: Date.now()
            })
            saveStoredData()
        } else {
            tempError.value = 'Некорректное значение температуры'
        }
    } else if (data && Object.keys(data).length > 0) {
        tempError.value = `Ответ без температуры: ${JSON.stringify(data)}`
    } else {
        tempError.value = 'Устройство не вернуло данные о температуре'
    }

    tempLoading.value = false
}

async function executeCommand(cmd: string, args: Record<string, any>) {
    if (!organizationId.value) {
        commandResult.value = { requestError: 'Устройство не привязано к организации' }
        return
    }

    sendingCommand.value = true
    commandResult.value = null

    const result = await sendDeviceCommand(organizationId.value, deviceId, cmd, args)

    if (result.requestError) {
        commandResult.value = { requestError: result.requestError }
        deviceIsConnected.value = false
    } else if (result.commandError) {
        commandResult.value = {
            commandError: result.commandError,
            rawResponse: JSON.stringify(result.data, null, 2)
        }
        deviceIsConnected.value = true
    } else if (result.data !== null && result.data !== undefined && typeof result.data === 'object' && Object.keys(result.data).length > 0) {
        commandResult.value = { rawResponse: JSON.stringify(result.data, null, 2) }
        deviceIsConnected.value = true

        if (cmd === 'get-temperature') {
            const data = result.data as Record<string, any>
            const temp = data.temperature ?? data.value ?? data.temp
            if (temp !== undefined && temp !== null) {
                const numTemp = typeof temp === 'number' ? temp : parseFloat(temp)
                if (!isNaN(numTemp)) {
                    currentTemp.value = numTemp
                    lastTempTime.value = new Date().toLocaleString('ru-RU')
                    tempError.value = ''
                    tempHistory.value.push({
                        time: new Date().toLocaleString('ru-RU'),
                        value: numTemp,
                        timestamp: Date.now()
                    })
                    saveStoredData()
                }
            }
        }
    } else {
        commandResult.value = {
            commandError: 'Команда не поддерживается устройством или не вернула данных'
        }
        deviceIsConnected.value = true
    }

    sendingCommand.value = false
}

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

onMounted(loadDeviceData)
</script>