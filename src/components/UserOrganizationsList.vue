<template>
  <div class="">
    <h2>Мои организации</h2>
    <ul v-if="organizations">
      <li v-for="organization in organizations" :key="organization.id">
        {{ organization.name }}
        {{ organization.createdAt }}
      </li>
    </ul>
    <p v-else>Вы не состоите в организации.</p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from "vue";
import { getUsersOrganizations, type Organization } from "@/data";
import { ref } from "vue";

const organizations = ref<Organization[] | null>(null);

onMounted(async () => {
  console.log("UserOrganizationsList mounted");
  const orgs = await getUsersOrganizations();
  organizations.value = orgs;
});
</script>
