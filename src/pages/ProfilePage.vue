<template>
    <div class="p-8 max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Мой профиль</h1>

        <div class="bg-white rounded-lg shadow p-6 space-y-6">
            <!-- Информация о пользователе -->
            <div>
                <h2 class="text-xl font-semibold mb-4">Информация</h2>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm text-gray-600">Имя</label>
                        <p class="text-lg">{{ user?.name || 'Не указано' }}</p>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600">Email</label>
                        <p class="text-lg">{{ user?.email }}</p>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600">ID</label>
                        <p class="text-sm text-gray-500 font-mono">{{ user?.id }}</p>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600">Email подтвержден</label>
                        <p>
                            <span :class="user?.emailVerified ? 'text-green-600' : 'text-red-600'"
                                class="font-semibold">
                                {{ user?.emailVerified ? 'Да' : 'Нет' }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Изменение email -->
            <div class="border-t pt-6">
                <h3 class="text-lg font-semibold mb-4">Изменить email</h3>
                <div class="flex gap-2">
                    <input v-model="newEmail" placeholder="Новый email" class="border rounded px-3 py-2 flex-1"
                        @keyup.enter="handleUpdateEmail" />
                    <button @click="handleUpdateEmail"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        :disabled="!newEmail.trim() || updatingEmail">
                        {{ updatingEmail ? '...' : 'Обновить' }}
                    </button>
                </div>
                <p v-if="emailError" class="text-red-500 text-sm mt-2">{{ emailError }}</p>
                <p v-if="emailSuccess" class="text-green-500 text-sm mt-2">{{ emailSuccess }}</p>
            </div>

            <!-- Изменение пароля -->
            <div class="border-t pt-6">
                <h3 class="text-lg font-semibold mb-4">Изменить пароль</h3>
                <div class="space-y-3">
                    <input v-model="newPassword" type="password" placeholder="Новый пароль"
                        class="border rounded px-3 py-2 w-full" />
                    <button @click="handleUpdatePassword"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        :disabled="!newPassword.trim() || updatingPassword">
                        {{ updatingPassword ? '...' : 'Обновить пароль' }}
                    </button>
                </div>
                <p v-if="passwordError" class="text-red-500 text-sm mt-2">{{ passwordError }}</p>
                <p v-if="passwordSuccess" class="text-green-500 text-sm mt-2">{{ passwordSuccess }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api";

interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    blocked: boolean;
}

const user = ref<User | null>(null);

// Email
const newEmail = ref("");
const updatingEmail = ref(false);
const emailError = ref("");
const emailSuccess = ref("");

// Password
const newPassword = ref("");
const updatingPassword = ref(false);
const passwordError = ref("");
const passwordSuccess = ref("");

onMounted(() => {
    loadUser();
});

const loadUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            user.value = JSON.parse(userStr);
        } catch {
            console.error("Ошибка парсинга user из localStorage");
        }
    }
};

const handleUpdateEmail = async () => {
    if (!newEmail.value.trim() || !user.value) return;

    try {
        updatingEmail.value = true;
        emailError.value = "";
        emailSuccess.value = "";

        // ✅ Правильный эндпоинт: /api/users/:id/set-email
        await api.post(`/api/users/${user.value.id}/set-email`, {
            email: newEmail.value,
        });

        emailSuccess.value = "Email обновлен!";
        user.value.email = newEmail.value;
        localStorage.setItem("user", JSON.stringify(user.value));
        newEmail.value = "";
    } catch (error: any) {
        console.error("Ошибка обновления email:", error);
        emailError.value = error.response?.data?.message || "Ошибка при обновлении email";
    } finally {
        updatingEmail.value = false;
    }
};

const handleUpdatePassword = async () => {
    if (!newPassword.value.trim() || !user.value) return;

    try {
        updatingPassword.value = true;
        passwordError.value = "";
        passwordSuccess.value = "";

        // ✅ Правильный эндпоинт: /api/users/:id/set-password
        await api.post(`/api/users/${user.value.id}/set-password`, {
            email: newPassword.value,
        });

        passwordSuccess.value = "Пароль обновлен!";
        newPassword.value = "";
    } catch (error: any) {
        console.error("Ошибка обновления пароля:", error);
        passwordError.value = error.response?.data?.message || "Ошибка при обновлении пароля";
    } finally {
        updatingPassword.value = false;
    }
};
</script>