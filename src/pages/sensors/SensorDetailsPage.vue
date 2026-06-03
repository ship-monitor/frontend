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
                <h1 class="text-2xl font-bold">{{ sensorName }}</h1>
                <p class="text-xs text-gray-400 font-mono">ID: {{ deviceId }}</p>
            </div>

            <!-- Вкладки -->
            <div class="border-b mb-6">
                <div class="flex gap-4">
                    <button @click="activeTab = 'current'" :class="[
                        'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                        activeTab === 'current' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                    ]">
                        📊 Текущие данные
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
                            Норма: {{ minTemp }}°C ... {{ maxTemp }}°C
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

                        <div class="grid grid-cols-2 gap-4">
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

                        <div class="grid grid-cols-2 gap-4">
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const deviceId = route.params.id as string

// Состояние
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('current')
const sensorName = ref('Датчик')
const currentTemperature = ref<number | null>(null)
const currentTime = ref('')

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

// Вычисляемые свойства
const minTemp = computed(() => settings.value.minTemp)
const maxTemp = computed(() => settings.value.maxTemp)

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
    // Загрузка из localStorage для демо
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
        // Сохраняем в localStorage для демо
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

// Симуляция получения данных
const simulateData = () => {
    setInterval(() => {
        // Генерируем случайную температуру для демо
        currentTemperature.value = -15 + (Math.random() * 4 - 2)
        currentTime.value = new Date().toLocaleString('ru-RU')
    }, 5000)
}

onMounted(() => {
    loadSettings()
    simulateData()
    loading.value = false
})
</script>