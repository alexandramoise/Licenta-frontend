<script setup>
const props = defineProps({
  id: String,
  label: String,
  isActive: Boolean,
  heightInPx: Number,
  widthInPx: Number
});

</script>

<template>
  <button
    class="custom-button"
    :id="id"
  >
    <slot></slot>
  </button>
</template>

<style scoped>

</style>