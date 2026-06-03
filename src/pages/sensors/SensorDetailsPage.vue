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
                    ← Назад к мониторингу
                </button>
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                        <h1 class="text-2xl font-bold">{{ sensorConfig?.name || 'Датчик' }}</h1>
                        <p class="text-xs text-gray-400 font-mono">ID: {{ deviceId }}</p>
                    </div>
                    <div class="flex gap-2">
                        <span :class="[
                            'px-3 py-1 rounded-full text-sm font-medium',
                            currentData?.isDefrostMode ? 'bg-yellow-100 text-yellow-800' :
                                currentData?.isAlert ? 'bg-red-100 text-red-800' :
                                    isWithinRange ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        ]">
                            {{ getStatusText() }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Вкладки -->
            <div class="border-b mb-6 overflow-x-auto">
                <nav class="flex gap-2 sm:gap-4 min-w-max">
                    <button @click="activeTab = 'current'" :class="[
                        'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                        activeTab === 'current' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    ]">
                        📊 Текущие данные
                    </button>
                    <button @click="activeTab = 'history'" :class="[
                        'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                        activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    ]">
                        📈 История
                    </button>
                    <button @click="activeTab = 'settings'" :class="[
                        'px-4 py-2 font-medium text-sm transition-colors border-b-2',
                        activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    ]">
                        ⚙️ Настройки
                    </button>
                </nav>
            </div>

            <!-- Текущие данные -->
            <div v-if="activeTab === 'current'">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Основные показатели -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-xl border p-6">
                            <h2 class="text-lg font-semibold mb-4">Текущие показания</h2>

                            <div class="text-center py-8">
                                <div class="text-6xl font-bold mb-3" :class="getTemperatureClass(currentData?.value)">
                                    {{ currentData?.value?.toFixed(1) || '--' }}°C
                                </div>
                                <div class="text-sm text-gray-500">
                                    Норма: {{ sensorConfig?.minThreshold }}°C ... {{ sensorConfig?.maxThreshold }}°C
                                </div>
                                <div class="text-xs text-gray-400 mt-2">
                                    {{ formatDateTime(currentData?.timestamp) }}
                                </div>
                            </div>

                            <!-- Статус -->
                            <div class="mt-4 p-4 rounded-lg" :class="getStatusBgClass()">
                                <div class="flex items-center gap-2">
                                    <span class="text-xl">{{ getStatusIcon() }}</span>
                                    <div>
                                        <p class="font-medium">{{ getStatusMessage() }}</p>
                                        <p v-if="currentData?.isDefrostMode" class="text-sm mt-1">
                                            Оттайка активна. Ожидаем возврата в норму через {{ getDefrostRemainingTime()
                                            }} мин.
                                        </p>
                                        <p v-if="currentData?.isAlert" class="text-sm mt-1 text-red-600 font-medium">
                                            ВНИМАНИЕ! После оттайки температура не вернулась в норму. Требуется проверка
                                            холодильной системы!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Теги -->
                    <div class="bg-white rounded-xl border p-6">
                        <h2 class="text-lg font-semibold mb-4">🏷️ Теги</h2>

                        <div class="flex flex-wrap gap-2 mb-4">
                            <span v-for="tag in sensorConfig?.tags" :key="tag"
                                class="px-3 py-1.5 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                                {{ tag }}
                                <button @click="removeTag(tag)" class="text-gray-400 hover:text-red-500">
                                    ✕
                                </button>
                            </span>
                        </div>

                        <div class="flex gap-2">
                            <input v-model="newTag" type="text" placeholder="Новый тег"
                                class="flex-1 px-3 py-2 border rounded-lg text-sm" @keyup.enter="addTag" />
                            <button @click="addTag" :disabled="!newTag.trim()"
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- История -->
            <div v-if="activeTab === 'history'">
                <div class="bg-white rounded-xl border p-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 class="text-lg font-semibold">История измерений</h2>

                        <div class="flex gap-2">
                            <input type="date" v-model="dateFrom" class="px-3 py-2 border rounded-lg text-sm" />
                            <span class="self-center">—</span>
                            <input type="date" v-model="dateTo" class="px-3 py-2 border rounded-lg text-sm" />
                            <button @click="loadHistory" :disabled="loadingHistory"
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                {{ loadingHistory ? '...' : 'Загрузить' }}
                            </button>
                            <button @click="exportData" :disabled="exporting"
                                class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                                {{ exporting ? '...' : '📄 DOCX' }}
                            </button>
                        </div>
                    </div>

                    <div v-if="historyData?.data.length === 0" class="text-center py-12 text-gray-500">
                        Нет данных за выбранный период
                    </div>

                    <div v-else class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Время</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Температура</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in historyData?.data" :key="item.id" class="border-t">
                                    <td class="px-4 py-3 text-sm">{{ formatDateTime(item.timestamp) }}</td>
                                    <td class="px-4 py-3">
                                        <span :class="getTemperatureClass(item.value)" class="font-medium">
                                            {{ item.value.toFixed(1) }}°C
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span v-if="item.isDefrostMode" class="text-yellow-600 text-sm">Оттайка</span>
                                        <span v-else-if="item.isAlert" class="text-red-600 text-sm">Авария</span>
                                        <span v-else class="text-green-600 text-sm">Норма</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Настройки -->
            <div v-if="activeTab === 'settings'">
                <div class="bg-white rounded-xl border p-6">
                    <h2 class="text-lg font-semibold mb-6">Настройки датчика</h2>

                    <form @submit.prevent="saveSettings" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Название датчика
                            </label>
                            <input v-model="editConfig.name" type="text"
                                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Нижняя граница (°C)
                                </label>
                                <input v-model.number="editConfig.minThreshold" type="number" step="0.5"
                                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Верхняя граница (°C)
                                </label>
                                <input v-model.number="editConfig.maxThreshold" type="number" step="0.5"
                                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Номер телефона для SMS
                            </label>
                            <input v-model="editConfig.phoneNumber" type="tel" placeholder="+7XXXXXXXXXX"
                                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                            <p class="text-xs text-gray-500 mt-1">
                                На этот номер будут приходить уведомления о нарушениях температурного режима
                            </p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Время оттайки (минут)
                                </label>
                                <input v-model.number="editConfig.defrostTime" type="number" min="1" step="5"
                                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                <p class="text-xs text-gray-500 mt-1">
                                    Максимальное время на возврат в норму после оттайки
                                </p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Температура оттайки (°C)
                                </label>
                                <input v-model.number="editConfig.defrostTemperature" type="number" step="0.5"
                                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                <p class="text-xs text-gray-500 mt-1">
                                    Типичная температура во время оттайки
                                </p>
                            </div>
                        </div>

                        <div class="flex justify-end gap-3 pt-4">
                            <button type="button" @click="resetSettings"
                                class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                                Отмена
                            </button>
                            <button type="submit" :disabled="saving"
                                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                {{ saving ? 'Сохранение...' : 'Сохранить' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
    getSensorConfig,
    updateSensorConfig,
    getSensorHistory,
    getSensorCurrentData,
    addSensorTag,
    removeSensorTag,
    exportSensorData,
    type SensorConfig,
    type SensorData,
    type SensorHistory
} from '@/api/sensors';

const route = useRoute();
const deviceId = route.params.id as string;

// Состояние
const loading = ref(true);
const loadingHistory = ref(false);
const saving = ref(false);
const exporting = ref(false);
const activeTab = ref<'current' | 'history' | 'settings'>('current');

const sensorConfig = ref<SensorConfig | null>(null);
const currentData = ref<SensorData | null>(null);
const historyData = ref<SensorHistory | null>(null);

const editConfig = ref<Partial<SensorConfig>>({});
const newTag = ref('');
const dateFrom = ref('');
const dateTo = ref('');

// Вычисляемые
const isWithinRange = computed(() => {
    if (!currentData.value || !sensorConfig.value) return true;
    const val = currentData.value.value;
    return val >= sensorConfig.value.minThreshold && val <= sensorConfig.value.maxThreshold;
});

// Методы
const getStatusText = () => {
    if (!currentData.value) return 'Нет данных';
    if (currentData.value.isAlert) return 'АВАРИЯ';
    if (currentData.value.isDefrostMode) return 'ОТТАЙКА';
    return isWithinRange.value ? 'НОРМА' : 'НАРУШЕНИЕ';
};

const getStatusIcon = () => {
    if (!currentData.value) return '⚪';
    if (currentData.value.isAlert) return '🔴';
    if (currentData.value.isDefrostMode) return '🟡';
    return isWithinRange.value ? '🟢' : '🟠';
};

const getStatusMessage = () => {
    if (!currentData.value) return 'Нет данных';
    if (currentData.value.isAlert) return 'Авария! После оттайки температура не вернулась в норму. Требуется проверка системы!';
    if (currentData.value.isDefrostMode) return 'Режим оттайки активен';
    return isWithinRange.value ? 'Температура в норме' : 'Температура вышла за пределы нормы!';
};

const getStatusBgClass = () => {
    if (!currentData.value) return 'bg-gray-50';
    if (currentData.value.isAlert) return 'bg-red-50';
    if (currentData.value.isDefrostMode) return 'bg-yellow-50';
    return isWithinRange.value ? 'bg-green-50' : 'bg-orange-50';
};

const getTemperatureClass = (value?: number) => {
    if (!value) return 'text-gray-400';
    if (value < -20) return 'text-blue-600';
    if (value < -10) return 'text-blue-500';
    if (value < 0) return 'text-cyan-500';
    if (value < 10) return 'text-green-500';
    return 'text-orange-500';
};

const getDefrostRemainingTime = () => {
    if (!currentData.value?.timestamp || !sensorConfig.value?.defrostTime) return 0;
    const elapsed = (Date.now() - new Date(currentData.value.timestamp).getTime()) / 1000 / 60;
    return Math.max(0, Math.round(sensorConfig.value.defrostTime - elapsed));
};

const formatDateTime = (timestamp?: string) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString('ru-RU');
};

const loadData = async () => {
    try {
        const [config, current] = await Promise.all([
            getSensorConfig(deviceId),
            getSensorCurrentData(deviceId)
        ]);
        sensorConfig.value = config;
        currentData.value = current;
        editConfig.value = { ...config };

        // Установка дат по умолчанию (последние 24 часа)
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        dateFrom.value = yesterday.toISOString().split('T')[0];
        dateTo.value = now.toISOString().split('T')[0];
    } catch (error) {
        console.error('Failed to load sensor data:', error);
    } finally {
        loading.value = false;
    }
};

const loadHistory = async () => {
    if (!dateFrom.value || !dateTo.value) return;

    loadingHistory.value = true;
    try {
        historyData.value = await getSensorHistory(
            deviceId,
            dateFrom.value,
            dateTo.value
        );
    } catch (error) {
        console.error('Failed to load history:', error);
    } finally {
        loadingHistory.value = false;
    }
};

const saveSettings = async () => {
    saving.value = true;
    try {
        await updateSensorConfig(deviceId, editConfig.value);
        await loadData();
        alert('Настройки сохранены');
    } catch (error) {
        console.error('Failed to save settings:', error);
        alert('Ошибка сохранения настроек');
    } finally {
        saving.value = false;
    }
};

const resetSettings = () => {
    if (sensorConfig.value) {
        editConfig.value = { ...sensorConfig.value };
    }
};

const addTag = async () => {
    if (!newTag.value.trim()) return;
    try {
        await addSensorTag(deviceId, newTag.value.trim());
        await loadData();
        newTag.value = '';
    } catch (error) {
        console.error('Failed to add tag:', error);
        alert('Ошибка добавления тега');
    }
};

const removeTag = async (tag: string) => {
    try {
        await removeSensorTag(deviceId, tag);
        await loadData();
    } catch (error) {
        console.error('Failed to remove tag:', error);
        alert('Ошибка удаления тега');
    }
};

const exportData = async () => {
    if (!dateFrom.value || !dateTo.value) return;

    exporting.value = true;
    try {
        const blob = await exportSensorData(deviceId, dateFrom.value, dateTo.value, 'docx');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sensor_data_${deviceId}_${dateFrom.value}_${dateTo.value}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to export data:', error);
        alert('Ошибка экспорта данных');
    } finally {
        exporting.value = false;
    }
};

// Обновление текущих данных через WebSocket
watch(
    () => useWebSocket,
    (wsData) => {
        if (wsData?.deviceId === deviceId) {
            currentData.value = wsData;
        }
    }
);

onMounted(() => {
    loadData();
});
</script>