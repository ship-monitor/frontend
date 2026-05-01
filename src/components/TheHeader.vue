<template>
  <header class="flex justify-between p-2 items-center border-b border-black bg-white">
    <!-- Логотип и навигация -->
    <div class="flex items-center gap-6">
      <img
        loading="lazy"
        :src="BIG_LOGO"
        :alt="COMPANY_NAME"
        :title="COMPANY_NAME"
        class="w-40 cursor-pointer"
        @click="router.push('/')"
      />
      <nav class="flex gap-4">
        <router-link to="/" class="text-gray-600 hover:text-blue-600 transition-colors font-medium">
          Организации
        </router-link>
        <router-link to="/invitations" class="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
          Приглашения
          <span v-if="invitationCount > 0" class="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {{ invitationCount }}
          </span>
        </router-link>
      </nav>
    </div>

    <!-- Кнопка выхода -->
    <div>
      <button
        title="Выйти"
        @click="handleLogout"
        class="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-red-50"
      >
        <span>Выйти</span>
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BIG_LOGO from "@/assets/big-logo.png";
import { useRouter } from "vue-router";
import { getInvitations } from "@/data";

const COMPANY_NAME = "ШиП Монитор";
const router = useRouter();
const invitationCount = ref(0);

const loadInvitationCount = async () => {
  try {
    const invitations = await getInvitations();
    invitationCount.value = invitations.length;
  } catch (error) {
    // Игнорируем ошибки загрузки
  }
};

onMounted(loadInvitationCount);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  router.push("/auth");
};
</script>
