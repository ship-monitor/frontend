<template>
    <div class="p-8 max-w-5xl mx-auto">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Мои организации</h1>
            <button @click="openCreateModal"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                + Создать организацию
            </button>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="text-center py-8">
            <p class="text-gray-500">Загрузка...</p>
        </div>

        <!-- Пустой список -->
        <div v-else-if="organizations.length === 0" class="text-center py-8">
            <p class="text-gray-500">У вас пока нет организаций</p>
        </div>

        <!-- Список организаций -->
        <div v-else class="grid gap-4">
            <div v-for="org in organizations" :key="org.id"
                class="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">{{ org.name }}</h3>
                    <p class="text-sm text-gray-500">ID: {{ org.id }}</p>
                </div>
                <div class="flex gap-2">
                    <button @click="openMembersModal(org)"
                        class="text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-300 hover:border-green-500">
                        Участники
                    </button>
                    <button @click="openEditModal(org)"
                        class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500">
                        Изменить
                    </button>
                    <button @click="confirmDelete(org)"
                        class="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:border-red-500">
                        Удалить
                    </button>
                </div>
            </div>
        </div>

        <!-- Модальное окно создания/редактирования -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="closeModal">
            <div class="bg-white rounded-lg p-6 w-96">
                <h2 class="text-xl font-bold mb-4">
                    {{ editingOrg ? 'Изменить организацию' : 'Создать организацию' }}
                </h2>
                <input v-model="orgName" placeholder="Название организации" class="border rounded px-3 py-2 w-full mb-4"
                    @keyup.enter="handleSave" />
                <p v-if="errorMessage" class="text-red-500 text-sm mb-4">{{ errorMessage }}</p>
                <div class="flex justify-end gap-2">
                    <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Отмена
                    </button>
                    <button @click="handleSave"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        :disabled="!orgName.trim() || saving">
                        {{ saving ? 'Сохранение...' : (editingOrg ? 'Сохранить' : 'Создать') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Модальное окно участников -->
        <div v-if="showMembersModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="showMembersModal = false">
            <div class="bg-white rounded-lg p-6 w-[32rem] max-h-[80vh] overflow-y-auto">
                <h2 class="text-xl font-bold mb-4">
                    Участники: {{ selectedOrg?.name }}
                </h2>

                <!-- Загрузка участников -->
                <div v-if="membersLoading" class="text-center py-4">
                    <p class="text-gray-500">Загрузка участников...</p>
                </div>

                <!-- Список участников -->
                <div v-else-if="members.length > 0" class="space-y-2 mb-4">
                    <div v-for="member in members" :key="member.userId"
                        class="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <p class="font-medium">{{ member.name || 'Пользователь' }}</p>
                            <p class="text-sm text-gray-500">{{ member.email || member.userId }}</p>
                        </div>
                        <button @click="handleRemoveMember(member.userId)"
                            class="text-red-500 hover:text-red-700 text-sm px-2 py-1 border border-red-300 rounded hover:border-red-500"
                            :disabled="removingMember === member.userId">
                            {{ removingMember === member.userId ? 'Удаление...' : 'Удалить' }}
                        </button>
                    </div>
                </div>
                <div v-else class="text-center py-4">
                    <p class="text-gray-500">Нет участников</p>
                </div>

                <!-- Добавление участника -->
                <div class="border-t pt-4 mt-4">
                    <h3 class="font-semibold mb-2">Пригласить по email</h3>
                    <div class="flex gap-2">
                        <input v-model="inviteEmail" placeholder="email@example.com"
                            class="border rounded px-3 py-2 flex-1" @keyup.enter="handleInviteMember" />
                        <button @click="handleInviteMember"
                            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                            :disabled="!inviteEmail.trim() || inviting">
                            {{ inviting ? '...' : 'Пригласить' }}
                        </button>
                    </div>
                    <p v-if="membersError" class="text-red-500 text-sm mt-2">{{ membersError }}</p>
                    <p v-if="membersSuccess" class="text-green-500 text-sm mt-2">{{ membersSuccess }}</p>
                </div>

                <div class="flex justify-end mt-4">
                    <button @click="showMembersModal = false" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>

        <!-- Модальное окно удаления -->
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="showDeleteModal = false">
            <div class="bg-white rounded-lg p-6 w-96">
                <h2 class="text-xl font-bold mb-4">Удалить организацию?</h2>
                <p class="text-gray-600 mb-4">
                    Вы уверены, что хотите удалить "{{ orgToDelete?.name }}"?
                </p>
                <p v-if="errorMessage" class="text-red-500 text-sm mb-4">{{ errorMessage }}</p>
                <div class="flex justify-end gap-2">
                    <button @click="showDeleteModal = false" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Отмена
                    </button>
                    <button @click="handleDelete"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                        :disabled="deleting">
                        {{ deleting ? 'Удаление...' : 'Удалить' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
    getUsersOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationMembers,
    inviteMembers,
    removeMembers,
    type Organization,
    type Member,
} from "@/data";

const organizations = ref<Organization[]>([]);
const loading = ref(true);
const errorMessage = ref("");

// Модальные окна
const showModal = ref(false);
const showDeleteModal = ref(false);
const showMembersModal = ref(false);

// Состояния загрузки
const saving = ref(false);
const deleting = ref(false);
const membersLoading = ref(false);
const inviting = ref(false);
const removingMember = ref<string | null>(null);

// Данные форм
const orgName = ref("");
const editingOrg = ref<Organization | null>(null);
const orgToDelete = ref<Organization | null>(null);

// Участники
const selectedOrg = ref<Organization | null>(null);
const members = ref<Member[]>([]);
const inviteEmail = ref("");
const membersError = ref("");
const membersSuccess = ref("");

onMounted(() => {
    loadOrganizations();
});

const loadOrganizations = async () => {
    try {
        loading.value = true;
        const orgs = await getUsersOrganizations();
        organizations.value = orgs;
    } catch (error: any) {
        console.error("Ошибка загрузки:", error);
        organizations.value = [];
        alert("Не удалось загрузить организации");
    } finally {
        loading.value = false;
    }
};

const openCreateModal = () => {
    editingOrg.value = null;
    orgName.value = "";
    errorMessage.value = "";
    showModal.value = true;
};

const openEditModal = (org: Organization) => {
    editingOrg.value = org;
    orgName.value = org.name;
    errorMessage.value = "";
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    editingOrg.value = null;
    orgName.value = "";
    errorMessage.value = "";
};

const handleSave = async () => {
    if (!orgName.value.trim()) return;

    try {
        saving.value = true;
        errorMessage.value = "";

        if (editingOrg.value) {
            await updateOrganization(editingOrg.value.id, orgName.value);
        } else {
            await createOrganization(orgName.value);
        }

        await loadOrganizations();
        closeModal();
    } catch (error: any) {
        console.error("Ошибка сохранения:", error);
        errorMessage.value = error.response?.data?.message || "Ошибка при сохранении";
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (org: Organization) => {
    orgToDelete.value = org;
    errorMessage.value = "";
    showDeleteModal.value = true;
};

const handleDelete = async () => {
    if (!orgToDelete.value) return;

    try {
        deleting.value = true;
        errorMessage.value = "";
        await deleteOrganization(orgToDelete.value.id);
        await loadOrganizations();
        showDeleteModal.value = false;
    } catch (error: any) {
        console.error("Ошибка удаления:", error);
        errorMessage.value = error.response?.data?.message || "Ошибка при удалении";
    } finally {
        deleting.value = false;
    }
};

const openMembersModal = async (org: Organization) => {
    selectedOrg.value = org;
    showMembersModal.value = true;
    inviteEmail.value = "";
    membersError.value = "";
    membersSuccess.value = "";
    await loadMembers();
};

const loadMembers = async () => {
    if (!selectedOrg.value) return;

    try {
        membersLoading.value = true;
        members.value = await getOrganizationMembers(selectedOrg.value.id);
    } catch (error: any) {
        console.error("Ошибка загрузки участников:", error);
        membersError.value = "Не удалось загрузить участников";
        members.value = [];
    } finally {
        membersLoading.value = false;
    }
};

const handleInviteMember = async () => {
    if (!selectedOrg.value || !inviteEmail.value.trim()) return;

    try {
        inviting.value = true;
        membersError.value = "";
        membersSuccess.value = "";

        await inviteMembers(selectedOrg.value.id, [inviteEmail.value]);

        membersSuccess.value = `Приглашение отправлено на ${inviteEmail.value}`;
        inviteEmail.value = "";
        await loadMembers();
    } catch (error: any) {
        console.error("Ошибка приглашения:", error);
        membersError.value = error.response?.data?.message || "Ошибка при приглашении";
    } finally {
        inviting.value = false;
    }
};

const handleRemoveMember = async (userId: string) => {
    if (!selectedOrg.value) return;

    if (!confirm("Вы уверены, что хотите удалить этого участника?")) return;

    try {
        removingMember.value = userId;
        membersError.value = "";

        await removeMembers(selectedOrg.value.id, [userId]);
        await loadMembers();
    } catch (error: any) {
        console.error("Ошибка удаления участника:", error);
        membersError.value = error.response?.data?.message || "Ошибка при удалении участника";
    } finally {
        removingMember.value = null;
    }
};
</script>