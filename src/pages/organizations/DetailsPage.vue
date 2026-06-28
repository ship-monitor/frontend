<template>
  <div class="max-w-7xl mx-auto">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin text-4xl mb-2">⚡</div>
      <p class="text-gray-500">Загрузка...</p>
    </div>

    <div v-else-if="!organization" class="text-center py-12">
      <p class="text-gray-500">Организация не найдена</p>
    </div>

    <div v-else>
      <div class="mb-6">
        <button
          @click="$router.back()"
          class="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1 touch-target"
        >
          &larr; Назад
        </button>
        <div class="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold">
              {{ organization.name }}
            </h1>
            <p class="text-xs text-gray-400 font-mono">
              ID: {{ organization.id }}
            </p>
          </div>
          <!-- <button
            @click="refreshDevices"
            :disabled="statusLoading"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm touch-target"
          >
            {{ statusLoading ? "Проверка..." : "Проверить связь" }}
          </button> -->
        </div>
      </div>

      <div class="border-b mb-6 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <nav class="flex gap-2 sm:gap-4 min-w-max">
          <button @click="activeTab = 'devices'" :class="tabClass('devices')">
            Устройства ({{ devices.length }})
          </button>
          <button @click="activeTab = 'members'" :class="tabClass('members')">
            Участники ({{ members.length }})
          </button>
        </nav>
      </div>

      <div v-if="activeTab === 'devices'" class="space-y-4">
        <button
          @click="showConnectDeviceModal = true"
          class="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium touch-target"
        >
          + Подключить устройство
        </button>

        <div
          v-if="devices.length === 0"
          class="text-center py-12 bg-gray-50 rounded-xl"
        >
          <p class="text-gray-500">Нет подключенных устройств</p>
        </div>

<div
           v-else
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
         >
           <div
             v-for="device in devices"
             :key="device.id"
             class="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
             :class="device.isConnected ? '' : 'opacity-75'"
             @click="goToDevice(device.id)"
           >
             <div class="flex justify-between items-start mb-3">
               <div class="min-w-0 flex-1 mr-2">
                 <h3 class="font-semibold truncate">
                   {{ getDeviceName(device) }}
                 </h3>
                 <p class="text-xs text-gray-400 font-mono truncate">
                   {{ device.id }}
                 </p>
               </div>
               <span
                 :class="[
                   'px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap shrink-0',
                   device.isConnected
                     ? 'bg-green-100 text-green-800'
                     : 'bg-gray-100 text-gray-600',
                 ]"
               >
                 {{ device.isConnected ? "В сети" : "Не в сети" }}
               </span>
             </div>

<div
               v-if="getDeviceTemp(device) !== null"
               class="text-center py-3 mb-3 bg-gray-50 rounded-lg"
             >
               <span class="text-2xl font-bold text-gray-700">
                 {{ getDeviceTemp(device)!.toFixed(1) }}°C
               </span>
             </div>

             <button
               @click.stop="confirmDisconnect(device)"
               class="w-full px-3 py-2.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors touch-target"
             >
               Отключить
             </button>
           </div>
         </div>
       </div>

      <div v-if="activeTab === 'members'" class="space-y-4">
        <button
          @click="showAddMemberModal = true"
          class="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium touch-target"
        >
          + Пригласить участников
        </button>

        <div
          v-if="members.length === 0"
          class="text-center py-12 text-gray-500"
        >
          Нет участников
        </div>

        <template v-else>
          <div
            class="hidden sm:block bg-white rounded-xl border overflow-hidden"
          >
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    Участник
                  </th>
                  <th
                    class="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    Email
                  </th>
                  <th
                    class="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    Роль
                  </th>
                  <th
                    class="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="member in members"
                  :key="member.userId"
                  class="border-t hover:bg-gray-50"
                >
                  <td class="px-4 py-3">{{ member.name || "—" }}</td>
                  <td class="px-4 py-3 text-gray-600 text-sm">
                    {{ member.email }}
                  </td>
                  <td class="px-4 py-3">
                    <span :class="getRoleBadgeClass(member.role)">
                      {{ getRoleLabel(member.role) }}
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

          <div class="space-y-3 sm:hidden">
            <div
              v-for="member in members"
              :key="member.userId"
              class="bg-white border rounded-xl p-4"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-medium">{{ member.name || "Без имени" }}</p>
                  <p class="text-sm text-gray-500">{{ member.email }}</p>
                </div>
                <span :class="getRoleBadgeClass(member.role)">
                  {{ getRoleLabel(member.role) }}
                </span>
              </div>
              <button
                v-if="member.role !== 'owner'"
                @click="removeMember(member.userId)"
                class="mt-2 w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 touch-target"
              >
                Удалить
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Модалка: Подключение устройства -->
    <Teleport to="body">
      <div
        v-if="showConnectDeviceModal"
        class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        @click.self="showConnectDeviceModal = false"
      >
        <div
          class="bg-white rounded-t-xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-md"
        >
          <h3 class="text-lg font-semibold mb-4">Подключить устройство</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >ID устройства (Node ID)</label
              >
              <input
                v-model="deviceIdToConnect"
                type="text"
                placeholder="UUID устройства"
                class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Название</label
              >
              <input
                v-model="deviceNameToConnect"
                type="text"
                placeholder="Холодильник N1"
                class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div class="mt-6 flex gap-3">
            <button
              @click="showConnectDeviceModal = false"
              class="flex-1 px-4 py-3 text-gray-600 border rounded-lg hover:bg-gray-50 touch-target"
            >
              Отмена
            </button>
            <button
              @click="connectDeviceHandler"
              :disabled="!deviceIdToConnect.trim()"
              class="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 touch-target font-medium"
            >
              Подключить
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модалка: Приглашение -->
    <AddMemberModal
      v-if="organization"
      :show="showAddMemberModal"
      :close="() => (showAddMemberModal = false)"
      :organization-id="organization?.id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getOrganizationById,
  getOrganizationDevices,
  connectDevice,
  getOrganizationMembers,
  removeMembers,
  getDeviceState,
  disconnectDevice,
  type Organization,
  type Device,
  type Member,
} from "@/data";
import { route as routeHelper } from "@/constants/routes";
import AddMemberModal from "@/components/AddMemberModal.vue";

const router = useRouter();
const routeParams = useRoute();

const organization = ref<Organization | null>(null);
const devices = ref<Device[]>([]);
const members = ref<Member[]>([]);
const loading = ref(true);
const statusLoading = ref(false);
const activeTab = ref<"devices" | "members">("devices");

const showConnectDeviceModal = ref(false);
const showAddMemberModal = ref(false);
const deviceIdToConnect = ref("");
const deviceNameToConnect = ref("");

function tabClass(tab: string) {
  return [
    "px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap touch-target",
    activeTab.value === tab
      ? "border-blue-500 text-blue-600"
      : "border-transparent text-gray-500 hover:text-gray-700",
  ];
}

const getRoleBadgeClass = (role?: string) => {
  const base = "px-2.5 py-1 text-xs rounded-full font-medium";
  if (role === "owner") return `${base} bg-purple-100 text-purple-800`;
  if (role === "administrator") return `${base} bg-blue-100 text-blue-800`;
  return `${base} bg-gray-100 text-gray-800`;
};

const getRoleLabel = (role?: string) => {
  if (role === "owner") return "Владелец";
  if (role === "administrator") return "Админ";
  return "Участник";
};

const getDeviceName = (device: Device): string => {
  const savedSettings = localStorage.getItem(`device_settings_${device.id}`);
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      if (settings.name && settings.name.trim() !== "") return settings.name;
    } catch {
      /* */
    }
  }
  if (device.name && device.name !== "Unknown Device") return device.name;
  return device.id?.substring(0, 8) || "Без названия";
};

const getDeviceTemp = (device: Device): number | null => {
  if (device.temperature !== undefined && device.temperature !== null)
    return device.temperature;
  const stored = localStorage.getItem(`device_data_${device.id}`);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.currentTemp !== undefined && data.currentTemp !== null)
        return data.currentTemp;
    } catch {
      /* */
    }
  }
  return null;
};

function goToDevice(deviceId: string) {
  router.push(routeHelper.sensorDetails(deviceId) + "?orgId=" + organization.value!.id);
}

async function pingDevice(deviceId: string): Promise<boolean> {
  try {
    const isOnline = await getDeviceState(deviceId, "network");
    return isOnline === true;
  } catch {
    return false;
  }
}

async function refreshDevices() {
  if (!organization.value) return;
  statusLoading.value = true;

  const updated = await Promise.all(
    devices.value.map(async (device) => {
      const isConnected = await pingDevice(device.id);
      return { ...device, isConnected };
    })
  );
  devices.value = updated;
  statusLoading.value = false;
}

const loadData = async () => {
  try {
    const orgId = routeParams.params.id as string;
    const [org, devicesData, membersData] = await Promise.all([
      getOrganizationById(orgId),
      getOrganizationDevices(orgId),
      getOrganizationMembers(orgId),
    ]);
    organization.value = org;
    members.value = membersData;

    // Пингуем все устройства для реального статуса
    const devicesWithStatus = await Promise.all(
      devicesData.map(async (device) => {
        const isConnected = await pingDevice(device.id);
        return { ...device, isConnected };
      })
    );
    devices.value = devicesWithStatus;
  } catch (error) {
    console.error("Failed to load data:", error);
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
    deviceIdToConnect.value = "";
    deviceNameToConnect.value = "";
    await loadData();
  } catch (error) {
    alert(
      "Ошибка подключения устройства: " +
        ((error as { message: string }).message || "")
    );
  }
};

const confirmDisconnect = async (device: Device) => {
  const deviceName = getDeviceName(device);
  if (!confirm(`Отключить устройство "${deviceName}"?`)) return;
  try {
    await disconnectDevice(device.id);
    await loadData();
  } catch (error) {
    console.error("Failed to disconnect device:", error);
  }
};

const removeMember = async (userId: string) => {
  if (!confirm("Удалить участника?")) return;
  try {
    await removeMembers(organization.value!.id, [userId]);
    await loadData();
  } catch (error) {
    console.error("Failed to remove member:", error);
  }
};

onMounted(loadData);
</script>
