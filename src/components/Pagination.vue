<template>
    <div class="pagination-container">
      <span class="arrow double-left" @click="goToPage(1)" :class="{ 'hidden': currentPage === 1 }">&lt;&lt;</span>
      <span class="arrow single-left" @click="goToPage(currentPage - 1)" :class="{ 'hidden': currentPage <= 2 }">&lt;</span>
      
      <span class="current-page">
        <div class="current-page-container">
          <span class="page-number">{{ currentPage }}</span>
        </div>
        <div class="page-dropdown">
          <div class="dropdown-container">
            <select v-model="selectedPage" @change="goToSelectedPage">
              <option v-for="pageNumber in totalPages" :key="pageNumber" :value="pageNumber">{{ pageNumber }}</option>
            </select>
          </div>
        </div>
      </span>
      
      <span class="arrow single-right" @click="goToPage(currentPage + 1)" :class="{ 'hidden': currentPage >= totalPages - 1 }">&gt;</span>
      <span class="arrow double-right" @click="goToPage(totalPages)" :class="{ 'hidden': currentPage === totalPages }">&gt;&gt;</span>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref, watch } from "vue";
  
  const props = defineProps(["currentPage", "totalPages"]);
  const emit = defineEmits(["changePage"]);
  
  const selectedPage = ref(props.currentPage);
  
  function goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= props.totalPages) {
      selectedPage.value = pageNumber;
      emit("changePage", pageNumber);
    }
  }
  
  function goToSelectedPage() {
    goToPage(selectedPage.value);
  }
  </script>
  
  <style>
  .current-page-container {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    font-size: 14px;
  }
  
  .current-page {
    display: inline-block;
    margin: 0 5px;
    padding: 5px 10px;
    border: 1px solid #000;
    border-radius: 999px;
    background-color: #000;
    color: #fff;
    position: relative;
    cursor: pointer;
  }
  
  .current-page select {
    border: none;
    background-color: transparent;
    color: #000;
    cursor: pointer;
    appearance: none;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  
  .arrow {
    display: inline-block;
    margin: 0 5px;
    padding: 5px 10px;
    border: 1px solid #000;
    border-radius: 999px;
    background-color: transparent;
    cursor: pointer;
  }
  
  .arrow.hidden {
    display: none;
  }
  
  .arrow:hover {
    background-color: #000;
    color: #fff;
  }
  </style>
  