<script setup>
import { RouterLink, RouterView } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";

</script>

<template>
  <Suspense>
      <router-view />
  </Suspense>
</template>

<style scoped>

</style>
