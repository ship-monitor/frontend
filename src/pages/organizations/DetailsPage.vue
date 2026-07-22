<template>
  <div class="max-w-7xl mx-auto space-y-5 animate-fade-in">
    <!-- Загрузка -->
    <div v-if="loading" class="text-center py-12">
      <svg class="w-8 h-8 mx-auto text-brand-500 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-ink-400">Загрузка...</p>
    </div>

    <div v-else-if="!organization" class="text-center py-12">
      <p class="text-ink-500">Организация не найдена</p>
    </div>

    <div v-else class="space-y-5">
      <!-- Хедер -->
      <div>
        <button
          @click="$router.back()"
          class="text-sm text-ink-500 hover:text-ink-700 mb-2 flex items-center gap-1 touch-target transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
            {{ organization.name }}
          </h1>
          <p class="text-xs text-ink-400 font-mono mt-0.5">
            ID: {{ organization.id }}
          </p>
        </div>
      </div>

      <!-- Табы -->
      <div class="border-b border-ink-200 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <nav class="flex gap-2 sm:gap-4 min-w-max">
          <button @click="activeTab = 'devices'" :class="tabClass('devices')">
            Устройства ({{ devices.length }})
          </button>
          <button @click="activeTab = 'members'" :class="tabClass('members')">
            Участники ({{ members.length }})
          </button>
        </nav>
      </div>

      <!-- Таб: Устройства -->
      <div v-if="activeTab === 'devices'" class="space-y-4">
        <button
          @click="showConnectDeviceModal = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 active:scale-[0.98] font-semibold text-sm touch-target transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Подключить устройство
        </button>

        <div
          v-if="devices.length === 0"
          class="ship-card p-8 text-center"
        >
          <p class="text-ink-500">Нет подключенных устройств</p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          <div
            v-for="dev in devices"
            :key="dev.id"
            class="flex flex-col gap-2 justify-between"
          >
            <DeviceCard :device-id="dev.id" />
            <button
              @click.stop="confirmDisconnect(dev)"
              class="w-full px-3 py-2.5 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:bg-red-200 transition-colors touch-target font-medium"
            >
              Отключить
            </button>
          </div>
        </div>
      </div>

      <!-- Таб: Участники -->
      <div v-if="activeTab === 'members'" class="space-y-4">
        <button
          @click="showAddMemberModal = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 active:scale-[0.98] font-semibold text-sm touch-target transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Пригласить участников
        </button>

        <div
          v-if="members.length === 0"
          class="ship-card p-8 text-center"
        >
          <p class="text-ink-500">Нет участников</p>
        </div>

        <template v-else>
          <!-- Десктоп таблица -->
          <div
            class="hidden sm:block ship-card overflow-hidden"
          >
            <table class="w-full">
              <thead class="bg-ink-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Участник
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Роль
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="member in members"
                  :key="member.userId"
                  class="border-t border-ink-100 hover:bg-ink-50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm font-medium text-ink-800">{{ member.name || "—" }}</td>
                  <td class="px-4 py-3 text-ink-600 text-sm">
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
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Мобильные карточки -->
          <div class="space-y-3 sm:hidden">
            <div
              v-for="member in members"
              :key="member.userId"
              class="ship-card p-4"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <p class="font-medium text-ink-900">{{ member.name || "Без имени" }}</p>
                  <p class="text-sm text-ink-500">{{ member.email }}</p>
                </div>
                <span :class="getRoleBadgeClass(member.role)">
                  {{ getRoleLabel(member.role) }}
                </span>
              </div>
              <button
                v-if="member.role !== 'owner'"
                @click="removeMember(member.userId)"
                class="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 touch-target font-medium transition-colors"
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
      <Transition name="modal">
        <div
          v-if="showConnectDeviceModal"
          class="fixed inset-0 bg-ink-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          @click.self="showConnectDeviceModal = false"
        >
          <div
            class="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md shadow-xl"
          >
            <h3 class="text-lg font-bold text-ink-900 mb-4">Подключить устройство</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-1.5"
                  >ID устройства (Node ID)</label
                >
                <input
                  v-model="deviceIdToConnect"
                  type="text"
                  placeholder="UUID устройства"
                  class="ship-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-1.5"
                  >Название</label
                >
                <input
                  v-model="deviceNameToConnect"
                  type="text"
                  placeholder="Холодильник N1"
                  class="ship-field"
                />
              </div>
            </div>
            <div class="mt-6 flex gap-3">
              <button
                @click="showConnectDeviceModal = false"
                class="flex-1 px-4 py-3 text-ink-600 border border-ink-200 rounded-xl hover:bg-ink-50 touch-target transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                @click="connectDeviceHandler"
                :disabled="!deviceIdToConnect.trim()"
                class="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:pointer-events-none touch-target transition-colors font-semibold"
              >
                Подключить
              </button>
            </div>
          </div>
        </div>
      </Transition>
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
import { useRoute } from "vue-router";
import {
  getOrganizationById,
  getOrganizationDevices,
  connectDevice,
  getOrganizationMembers,
  removeMembers,
  disconnectDevice,
  type Organization,
  type Device,
  type Member,
} from "@/data";
import AddMemberModal from "@/components/AddMemberModal.vue";
import { isOnline } from "@/utils/utils";
import DeviceCard from "@/components/DeviceCard.vue";

const routeParams = useRoute();

const organization = ref<Organization | null>(null);
const devices = ref<Device[]>([]);
const members = ref<Member[]>([]);
const loading = ref(true);
const activeTab = ref<"devices" | "members">("devices");

const showConnectDeviceModal = ref(false);
const showAddMemberModal = ref(false);
const deviceIdToConnect = ref("");
const deviceNameToConnect = ref("");

function tabClass(tab: string) {
  return [
    "px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap touch-target",
    activeTab.value === tab
      ? "border-brand-500 text-brand-600"
      : "border-transparent text-ink-500 hover:text-ink-700",
  ];
}

const getRoleBadgeClass = (role?: string) => {
  if (role === "owner") return "ship-badge bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200";
  if (role === "administrator") return "ship-badge ship-badge-success";
  return "ship-badge ship-badge-muted";
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

async function pingDevice(deviceId: string): Promise<boolean> {
  return await isOnline(deviceId);
}

const loadData = async () => {
  const orgId = routeParams.params.id as string;
  const org = (await getOrganizationById(orgId)).unwrapOr(null);
  const devicesData = (await getOrganizationDevices(orgId)).unwrapOr([]);
  const membersData = (await getOrganizationMembers(orgId)).unwrapOr([]);

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
  loading.value = false;
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
