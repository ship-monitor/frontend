<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getOrganizationById, type Organization } from "@/data";

const route = useRoute();
const organization = ref<Organization | null>(null);
onMounted(async () => {
  const org = await getOrganizationById(route.params.id as string);
  organization.value = org;
});
</script>

<template>
  <div v-if="organization">
    <div>Org: {{ organization.name }}</div>
  </div>
</template>
