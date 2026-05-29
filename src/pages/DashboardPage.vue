<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Мониторинг</h1>
    
    <!-- Группы камер -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-4">Все группы</h2>
      
      <div v-if="loading" class="text-gray-500">Загрузка...</div>
      
      <div v-else-if="sensors.length === 0" class="bg-white rounded-lg border p-8 text-center text-gray-500">
        <p class="text-lg mb-2">Нет подключенных датчиков</p>
        <p class="text-sm">Добавьте устройства через раздел "Организации"</p>
        <router-link to="/organizations" class="mt-4 inline-block text-blue-500 hover:text-blue-700">
          Перейти к организациям →
        </router-link>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Карточки камер как на скриншоте -->
        <div 
          v-for="sensor in sensors" 
          :key="sensor.id"
          class="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="font-semibold text-gray-800">{{ sensor.name }}</h3>
            <span 
              :class="[
                'px-2 py-1 text-xs rounded-full',
                sensor.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ sensor.status === 'online' ? 'online' : 'offline' }}
            </span>
          </div>
          
          <div class="text-center py-4">
            <div class="text-4xl font-bold mb-2" :class="getTemperatureClass(sensor.value)">
              {{ sensor.value !== undefined ? sensor.value.toFixed(1) + '°C' : '--' }}
            </div>
            <div class="text-sm text-gray-500">
              {{ sensor.minThreshold ?? '--' }}°C ... {{ sensor.maxThreshold ?? '--' }}°C
            </div>
          </div>
          
          <div class="text-center">
            <span class="text-xs text-gray-400">{{ sensor.organizationName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsersOrganizations, getOrganizationDevices, type Device } from '@/data';

interface SensorDisplay {
  id: string;
  name: string;
  value?: number;
  minThreshold?: number;
  maxThreshold?: number;
  status: 'online' | 'offline';
  organizationName: string;
}

const sensors = ref<SensorDisplay[]>([]);
const loading = ref(true);

const getTemperatureClass = (value?: number) => {
  if (!value) return 'text-gray-400';
  if (value < -20) return 'text-blue-600';
  if (value < -10) return 'text-blue-500';
  if (value < 0) return 'text-cyan-500';
  if (value < 10) return 'text-green-500';
  return 'text-orange-500';
};

const loadSensors = async () => {
  try {
    // Получаем все организации пользователя
    const orgs = await getUsersOrganizations();
    
    // Для каждой организации получаем устройства
    const allSensors: SensorDisplay[] = [];
    
    for (const org of orgs) {
      try {
        const devices = await getOrganizationDevices(org.id);
        
        devices.forEach(device => {
          allSensors.push({
            id: device.id,
            name: device.name || 'Без названия',
            status: device.connected ? 'online' : 'offline',
            organizationName: org.name,
            // TODO: Получать реальные показания с датчиков
            value: undefined,
            minThreshold: undefined,
            maxThreshold: undefined,
          });
        });
      } catch (err) {
        console.error(`Failed to load devices for org ${org.id}:`, err);
      }
    }
    
    sensors.value = allSensors;
  } catch (error) {
    console.error('Failed to load sensors:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadSensors);
</script>
