<script lang="ts" setup>
import { ref } from "vue";
import { inviteMembers } from "@/data";
import ShipTextbox from "./ShipTextbox.vue";

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
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 bg-ink-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        @click.self="close"
      >
        <form
          class="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md shadow-xl"
          @submit.prevent="inviteMembersHandler"
          @reset.prevent="close"
        >
          <h3 class="text-lg font-bold text-ink-900 mb-4">Пригласить участников</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-ink-700 mb-1.5"
                >Email участников (через запятую)</label
              >
              <ShipTextbox
                v-model="inviteEmails"
                type="text"
                inputmode="email"
                placeholder="user1@mail.com, user2@mail.com"
              />
            </div>
          </div>
          <div class="mt-6 flex gap-3">
            <button
              type="reset"
              class="flex-1 px-4 py-3 text-ink-600 border border-ink-200 rounded-xl hover:bg-ink-50 touch-target transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              :disabled="!inviteEmails.trim() || sendingInvite"
              class="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:pointer-events-none touch-target transition-colors font-semibold"
            >
              {{ sendingInvite ? "Отправка..." : "Пригласить" }}
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from form,
.modal-leave-to form {
  transform: translateY(20px);
}
</style>
