<script setup>
    import { ref, defineEmits } from 'vue';
    import CustomInput from './CustomInput.vue';
    import CustomButton from './CustomButton.vue';
    import CustomModal from './CustomModal.vue';
    
    const emit = defineEmits(['filterDates']);
    
    const fromDate = ref(null);
    const toDate = ref(null);
    
    const filterModalShow = ref(false);
    const filterModalTitle = ref('');
    const filterModalMessage = ref('');
    
    function emitFilterEvent() {
      const fromDateValue = new Date(fromDate.value);
      const toDateValue = new Date(toDate.value);
      const currentDate = new Date();
    
      if (toDate.value !== null && toDate.value !== '' && fromDate.value > toDate.value) {
        filterModalShow.value = true;
        filterModalTitle.value = "Problema";
        filterModalMessage.value = "Interval invalid";
        return;
      }
    
      if (fromDateValue > currentDate || toDateValue > currentDate) {
        filterModalShow.value = true;
        filterModalTitle.value = "Problema";
        filterModalMessage.value = "Datele nu pot fi în viitor";
        return;
      }
    
      emit('filterDates', { fromDate: fromDate.value, toDate: toDate.value });
    }
    
    function closeDialog() {
      filterModalShow.value = false;
    }

</script>

<template>
    <div class="date-inputs">
      <div class="input-group">
        <label for="fromDate">Inceput</label>
        <CustomInput 
          v-model="fromDate"
          :type="'date'"
          name="fromDate"
          class="custom-input"
        />
      </div>
      <div class="input-group">
        <label for="toDate">Final</label>
        <CustomInput 
          v-model="toDate"
          :type="'date'"
          name="toDate"
          class="custom-input"
        />
      </div>
      <CustomButton class="filter-button" @click="emitFilterEvent"> Filtrare </CustomButton>
      <CustomModal
        :open="filterModalShow"
        :forConfirmation="false"
        :title="filterModalTitle"
        :message="filterModalMessage"
        @close="closeDialog"
      />
    </div>
  </template>
  

<style scoped>
.date-inputs {
    display: grid;
    grid-template-columns: 30% 30% 40%;
    gap: 10px; 
}

.input-group {
    display: flex;
    flex-direction: column;
}

.input-group label {
    margin-bottom: 5px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    font-weight: bold;
}

.filter-button {
    background-color: white;
    color: rgb(163, 2, 2);
    height: 40px;
    width: 60%;
    margin-top: 15px;
    font-weight: bold;
    border: 1px solid rgb(163, 2, 2);
    border-radius: 10px;
    font-size: 13px;
    cursor: pointer;
}

.filter-button:hover {
    background-color: rgb(255, 247, 247);
    font-size: 14px;
}
</style>