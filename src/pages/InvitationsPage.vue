<template>
    <div class="p-8 max-w-5xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Мои приглашения</h1>

        <!-- Загрузка -->
        <div v-if="loading" class="text-center py-8">
            <p class="text-gray-500">Загрузка...</p>
        </div>

        <!-- Пусто -->
        <div v-else-if="invitations.length === 0" class="text-center py-8">
            <p class="text-gray-500">У вас нет активных приглашений</p>
        </div>

        <!-- Список приглашений -->
        <div v-else class="space-y-4">
            <div v-for="inv in invitations" :key="inv.organizationId"
                class="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">
                        {{ inv.organizationName || 'Организация' }}
                    </h3>
                    <p class="text-sm text-gray-500">
                        ID: {{ inv.organizationId }}
                    </p>
                    <p class="text-sm text-gray-500">
                        Приглашение от: {{ new Date(inv.creationDate).toLocaleDateString() }}
                    </p>
                </div>
                <div class="flex gap-2">
                    <button @click="handleAccept(inv.organizationId)"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                        :disabled="processing === inv.organizationId">
                        {{ processing === inv.organizationId ? '...' : 'Принять' }}
                    </button>
                    <button @click="handleReject(inv.organizationId)"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                        :disabled="processing === inv.organizationId">
                        {{ processing === inv.organizationId ? '...' : 'Отклонить' }}
                    </button>
                </div>
            </div>
        </div>

        <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-green-500 mt-4">{{ successMessage }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getInvitations, acceptInvitation, rejectInvitation, type Invitation } from "@/data";

const invitations = ref<Invitation[]>([]);
const loading = ref(true);
const processing = ref<string | null>(null);
const errorMessage = ref("");
const successMessage = ref("");

onMounted(() => {
    loadInvitations();
});

const loadInvitations = async () => {
    try {
        loading.value = true;
        invitations.value = await getInvitations();
    } catch (error: any) {
        console.error("Ошибка загрузки приглашений:", error);
        invitations.value = [];
    } finally {
        loading.value = false;
    }
};

const handleAccept = async (organizationId: string) => {
    try {
        processing.value = organizationId;
        errorMessage.value = "";
        successMessage.value = "";

        await acceptInvitation(organizationId);
        successMessage.value = "Приглашение принято!";
        await loadInvitations();
    } catch (error: any) {
        console.error("Ошибка принятия:", error);
        errorMessage.value = error.response?.data?.message || "Ошибка при принятии приглашения";
    } finally {
        processing.value = null;
    }
};

const handleReject = async (organizationId: string) => {
    if (!confirm("Вы уверены, что хотите отклонить приглашение?")) return;

    try {
        processing.value = organizationId;
        errorMessage.value = "";

        await rejectInvitation(organizationId);
        successMessage.value = "Приглашение отклонено";
        await loadInvitations();
    } catch (error: any) {
        console.error("Ошибка отклонения:", error);
        errorMessage.value = error.response?.data?.message || "Ошибка при отклонении";
    } finally {
        processing.value = null;
    }
};
</script>