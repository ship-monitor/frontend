<script setup lang="ts">
definePageMeta({
  layout: "landing",
  middleware: [() => navigateTo("/", { redirectCode: 302 })],
});
</script>

<template>
  <div />
</template>
