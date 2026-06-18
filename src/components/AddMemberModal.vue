<script lang="ts" setup>
import { ref } from "vue";
import { inviteMembers } from "@/data";

const props = defineProps<{
  show: boolean;
  close: () => void;
  organizationId: string;
}>();

const inviteEmails = ref<string>("");
const sendingInvite = ref<boolean>(false);

const inviteMembersHandler = async () => {
  sendingInvite.value = true;
  try {
    await inviteMembers(props.organizationId, inviteEmails.value);
    props.close();
    inviteEmails.value = "";
    alert("Приглашения отправлены");
  } catch (error) {
    alert("Ошибка: " + ((error as { message: string }).message || ""));
  } finally {
    sendingInvite.value = false;
  }
};
</script>
<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      @click.self="close"
    >
      <form
        class="bg-white rounded-t-xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-md"
        @submit.prevent="inviteMembersHandler"
        @reset.prevent="close"
      >
        <h3 class="text-lg font-semibold mb-4">Пригласить участников</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Email участников (через запятую)</label
            >
            <input
              v-model="inviteEmails"
              type="text"
              inputmode="email"
              placeholder="user1@mail.com, user2@mail.com"
              class="w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div class="mt-6 flex gap-3">
          <button
            type="reset"
            class="flex-1 px-4 py-3 text-gray-600 border rounded-lg hover:bg-gray-50 touch-target"
          >
            Отмена
          </button>
          <button
            type="submit"
            :disabled="!inviteEmails.trim() || sendingInvite"
            class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 touch-target font-medium"
          >
            {{ sendingInvite ? "Отправка..." : "Пригласить" }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
