<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin text-4xl">⚡</div>
      <p class="text-gray-500 mt-2">Загрузка...</p>
    </div>

    <div v-else-if="!organization" class="text-center py-8">
      <p class="text-gray-500">Организация не найдена</p>
    </div>

    <div v-else>
      <!-- Шапка -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold">{{ organization.name }}</h1>
        <p class="text-sm text-gray-500">ID: {{ organization.id }}</p>
      </div>

      <!-- Вкладки -->
      <div class="border-b mb-6">
        <nav class="flex gap-4 -mb-px">
          <button
            @click="activeTab = 'devices'"
            :class="['px-4 py-2 font-medium transition-colors border-b-2',
              activeTab === 'devices' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
          >
            📡 Устройства ({{ devices.length }})
          </button>
          <button
            @click="activeTab = 'members'"
            :class="['px-4 py-2 font-medium transition-colors border-b-2',
              activeTab === 'members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
          >
            👥 Участники ({{ members.length }})
          </button>
        </nav>
      </div>

      <!-- Устройства -->
      <div v-if="activeTab === 'devices'" class="space-y-4">
        <button
          @click="showConnectDeviceModal = true"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Подключить устройство
        </button>

        <div v-if="devices.length === 0" class="text-center py-12 bg-gray-50 rounded">
          <p class="text-gray-500">Нет подключенных устройств</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="device in devices"
            :key="device.id"
            class="border rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">{{ device.name || 'Без названия' }}</h3>
                <p class="text-sm text-gray-500">{{ device.id }}</p>
              </div>
              <span :class="['px-2 py-1 text-xs rounded-full',
                device.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                {{ device.connected ? 'Онлайн' : 'Офлайн' }}
              </span>
            </div>
            <div class="mt-4">
              <button
                @click="confirmDisconnect(device)"
                class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Отключить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Участники -->
      <div v-if="activeTab === 'members'" class="space-y-4">
        <button
          @click="showAddMemberModal = true"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Добавить участников
        </button>

        <div v-if="members.length === 0" class="text-center py-8 text-gray-500">
          Нет участников
        </div>

        <div v-else class="bg-white rounded-lg border">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Участник</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Роль</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in members" :key="member.userId" class="border-t hover:bg-gray-50">
                <td class="px-4 py-3">{{ member.name || '—' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ member.email }}</td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-1 text-xs rounded-full',
                    member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'administrator' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800']">
                    {{ member.role === 'owner' ? 'Владелец' : member.role === 'administrator' ? 'Админ' : 'Участник' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button
                    v-if="member.role !== 'owner'"
                    @click="removeMember(member.userId)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Модалка: Подключение устройства -->
    <div
      v-if="showConnectDeviceModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showConnectDeviceModal = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Подключить устройство</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ID устройства (Node ID)
            </label>
            <input
              v-model="deviceIdToConnect"
              type="text"
              placeholder="Например: node-123 или UUID"
              class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Название (опционально)
            </label>
            <input
              v-model="deviceNameToConnect"
              type="text"
              placeholder="Например: Холодильник №1"
              class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showConnectDeviceModal = false"
            class="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            @click="connectDeviceHandler"
            :disabled="!deviceIdToConnect.trim()"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Подключить
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка: Добавление участников -->
    <div
      v-if="showAddMemberModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAddMemberModal = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Пригласить участников</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email участников (через запятую)
            </label>
            <input
              v-model="inviteEmails"
              type="text"
              placeholder="user1@example.com, user2@example.com"
              class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showAddMemberModal = false"
            class="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            @click="inviteMembersHandler"
            :disabled="!inviteEmails.trim() || sendingInvite"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {{ sendingInvite ? 'Отправка...' : 'Пригласить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  getOrganizationById,
  getOrganizationDevices,
  connectDevice,
  disconnectDevice,
  getOrganizationMembers,
  inviteMembers,
  removeMembers,
  type Organization,
  type Device,
  type Member,
} from '@/data';

const route = useRoute();

const organization = ref<Organization | null>(null);
const devices = ref<Device[]>([]);
const members = ref<Member[]>([]);
const loading = ref(true);
const activeTab = ref<'devices' | 'members'>('devices');

const showConnectDeviceModal = ref(false);
const showAddMemberModal = ref(false);
const deviceIdToConnect = ref('');
const deviceNameToConnect = ref('');
const inviteEmails = ref('');
const sendingInvite = ref(false);

const loadData = async () => {
  try {
    const orgId = route.params.id as string;
    const [org, devicesData, membersData] = await Promise.all([
      getOrganizationById(orgId),
      getOrganizationDevices(orgId),
      getOrganizationMembers(orgId),
    ]);
    
    organization.value = org;
    devices.value = devicesData;
    members.value = membersData;
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    loading.value = false;
  }
};

const connectDeviceHandler = async () => {
  if (!deviceIdToConnect.value.trim() || !organization.value) return;
  
  try {
    await connectDevice(
      organization.value.id,
      deviceIdToConnect.value.trim(),
      deviceNameToConnect.value.trim() || undefined
    );
    showConnectDeviceModal.value = false;
    deviceIdToConnect.value = '';
    deviceNameToConnect.value = '';
    await loadData();
  } catch (error) {
    console.error('Failed to connect device:', error);
    alert('Ошибка подключения устройства: ' + (error as any).message);
  }
};

const confirmDisconnect = async (device: Device) => {
  if (!confirm(`Отключить устройство "${device.name || device.id}"?`)) return;
  
  try {
    await disconnectDevice(organization.value!.id, device.id);
    await loadData();
  } catch (error) {
    console.error('Failed to disconnect device:', error);
  }
};

const inviteMembersHandler = async () => {
  if (!inviteEmails.value.trim() || !organization.value) return;
  
  sendingInvite.value = true;
  try {
    await inviteMembers(organization.value.id, inviteEmails.value);
    showAddMemberModal.value = false;
    inviteEmails.value = '';
    alert('Приглашения отправлены');
  } catch (error) {
    console.error('Failed to invite members:', error);
  } finally {
    sendingInvite.value = false;
  }
};

const removeMember = async (userId: string) => {
  if (!confirm('Удалить участника?')) return;
  
  try {
    await removeMembers(organization.value!.id, [userId]);
    await loadData();
  } catch (error) {
    console.error('Failed to remove member:', error);
  }
};

onMounted(loadData);
</script>
