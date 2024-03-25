<script setup>
import { RouterLink, RouterView } from "vue-router";
import { ref, onMounted, computed } from "vue";


onMounted(() => {
  sessionStorage.setItem('loggedIn', 'false');
});

console.log("din local storage: ", localStorage.getItem("gotIn"));
</script>

<template>
  <Suspense>
      <router-view />
  </Suspense>
</template>

<style scoped>

</style>
