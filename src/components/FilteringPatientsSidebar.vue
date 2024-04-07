<script setup>
import CustomButton from './CustomButton.vue';
import {ref} from 'vue';

const nameInput = ref('');
const genderInput = ref('');
const ageInput = ref(0);
const tendencyInput = ref('');
const timeInput = ref('');

// Function to handle form data retrieval
const getFormData = () => {
  const formData = {
    name: nameInput.value,
    sex: genderInput.value,
    age: ageInput.value,
    category: tendencyInput.value,
    lastVisit: timeInput.value
  };

  console.log(formData);
};
</script>

<template>
    <div class="sidepanel-container">
      <h2 class="sidepanel-title">Filtrare pacienți</h2>
  
      <div class="filter-option last-visit-container">
        <label class="filter-label" for="name">Nume</label>
        <input type="text" id="name" name="name" placeholder="nume pacient" class="texting-input" v-model="nameInput">
      </div>

      <div class="filter-option">
        <label class="filter-label" for="sex">Sex</label>
        <div class="radio-group">
          <input type="radio" id="female" value="Feminine" name="sex" v-model="genderInput">
          <label for="female">Feminin</label>
          <input type="radio" id="male" value="Masculine" name="sex" v-model="genderInput">
          <label for="male">Masculin</label>
        </div>
      </div>
  
      <div class="filter-option">
      <label class="filter-label" for="age">Vârstă maximă</label>
      <div class="range-container">
        <!-- actualizare minim si maxim cu valorile din pacientii doctorului -->
        <input type="range" id="age" name="age" v-model="ageInput" min="0" max="120" class="range-slider">
        <span class="range-value">{{ ageInput }}</span>
      </div>
    </div>
  
      <div class="filter-option">
        <label class="filter-label">Categorie</label>
        <div class="radio-group">
          <input type="radio" id="hypo" value="Hipo" name="category" v-model="tendencyInput">
          <label for="hypo">Hipotensiv</label>
          <input type="radio" id="normal" value="Normal" name="category" v-model="tendencyInput">
          <label for="normal">Normal</label>
          <input type="radio" id="hyper" value="Hiper" name="category" v-model="tendencyInput">
          <label for="hyper">Hipertensiv</label>
        </div>
      </div>
  
      <div class="filter-option last-visit-container">
        <label class="filter-label" for="last-visit">Ultima vizită</label>
        <input type="number" id="last-visit" name="last-visit" placeholder="zile in urma" class="texting-input" v-model="timeInput">
      </div>
  
      <CustomButton class="filter-button" @click="getFormData" @key.enter="getFormData">FILTRARE</CustomButton>
    </div>
</template>
  
<style scoped>
  .sidepanel-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      padding: 10px;
  }
  
  .sidepanel-title {
      text-align: center;
      margin-bottom: 20px;
      font-family: Georgia, serif;
      font-size: 25px;
  }
  
  .filter-label {
      color: #b80f20;
      font-size: 15px;
      font-weight: bold;
      font-family: Arial, Helvetica, sans-serif;
  }

  .filter-option {
      display: flex;
      flex-direction: column;
      margin-bottom: 30px;
  }

  .radio-group {
      display: flex;
      justify-content: space-between;
  }
  
  .radio-group input[type="radio"] {
      display: none;
  }
  
  .radio-group label {
      flex: 1;
      text-align: center;
      padding: 10px;
      margin: 2px;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 5px;
  }
  
  .radio-group input[type="radio"]:checked + label {
      background: #b80f20;
      color: #fff;
  }
  
  .filter-option label {
      margin-bottom: 5px;
  }

  .filter-button {
      padding: 15px;
      background: #b80f20;
      color: #fff;
      border: none;
      border-radius: 20px;
      width: 220px;
      margin: auto;
      font-size: 14px;
  }

  .range-slider {
    -webkit-appearance: none; 
    appearance: none;
    width: 100%;
    height: 2px; 
    background: black; 
    outline: none; 
    opacity: 0.7; 
    -webkit-transition: .2s; 
    transition: opacity .2s;
}

.range-slider::-webkit-slider-thumb {
    -webkit-appearance: none; 
    appearance: none;
    width: 18px; 
    height: 18px; 
    background: #b80f20; 
    cursor: pointer; 
    border-radius: 80px;
}

.range-slider::-moz-range-thumb {
    width: 25px; 
    height: 25px; 
    background: black; 
    cursor: pointer; 
}

.range-container {
    display: flex;
    align-items: center;
}

.range-value {
   margin-left: 10px;
}

.last-visit-container {
    display: flex;
    flex-direction: row; 
    align-items: center;
    gap: 10px;
}

.texting-input {
    flex-grow: 1;
    border-radius: 5px;
    height: 15px;
    padding: 5px;
    border: 1px solid rgb(204, 204, 204);
}
  
/* responsive styling */
@media (max-width: 1370px) {
  .sidepanel-container {
      grid-template-columns: repeat(4, 1fr); 
      gap: 5px; 
  }

  .sidepanel-title {
      grid-column: 1 / -1; 
      font-size: 18px; 
  }

  .filter-option {
     grid-column: 1 / -1; 
  }

  .filter-option label {
      font-size: 14px; 
  }

  .radio-group {
      flex-direction: column; 
  }

  .radio-group label {
      padding: 5px; 
      font-size: 14px; 
  }

  .filter-option input[type="range"] {
      width: calc(100% - 10px); 
  }

  .filter-button {
      padding: 10px; 
      font-size: 12px; 
      border-radius: 15px; 
      grid-column: 1 / -1; 
      width: 90px;
  }

  .last-visit-container {
      flex-direction: column;
      align-items: flex-start; 
      gap: 5px;
  }
  
  .texting-input {
     width: 90%;
  }

  .range-slider::-webkit-slider-thumb {
      width: 8px;
      height: 8px;
  }
}

</style>
  