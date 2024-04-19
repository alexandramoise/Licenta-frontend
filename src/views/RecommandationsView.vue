<script setup>
import { onMounted, ref, watch } from 'vue';
import { getPatientByEmail } from '@/services/patient_service';
import { getAllRecommandations, getRecommandationsByType, getRecommandationsByHashtag, getRecommandationsByHashtagAndType } from '@/services/recommandation_service.js' 

import CustomNavbar from '@/components/CustomNavbar.vue';
import Pagination from '@/components/Pagination.vue';

const userType = sessionStorage.getItem("gotIn");
const isDoctor = ref(userType == "doctor");

const tags = ref(['Sport', 'Alimentatie', 'Stres']);
const types = ref(['Hipertensiune','Normal','Hipotensiune']); // Replace with actual types
const selectedTag = ref('');
const selectedType = ref('');
const recommendations = ref([]);

const pageSize = 3;
const totalPages = ref(0);
const currentPage = ref(1);

// const userEmail = sessionStorage.getItem("email");
let userEmail = "alexandramoise1@gmail.com";
let patientType;
if(!isDoctor.value) {
    let data = await getPatientByEmail(userEmail);
    patientType = data.tendency;
    console.log("Tip pacient: ", patientType);
} else {
    console.log("Afisez toate recomandarile");
}

function changePage(newPage) {
    currentPage.value = newPage;
}

const typeTranslations = {
  'Hipotensiune': 'Hypotension',
  'Normal': 'Normal',
  'Hipertensiune': 'Hypertension'
};

// ... (rest of your script setup remains unchanged)

async function fetchRecommendations() {
  let data;
  if (isDoctor.value) {
    // Logic for doctor: can filter by tag, type, or both
    if (selectedTag.value && selectedType.value) {
      data = await getRecommandationsByHashtagAndType(selectedType.value, selectedTag.value, pageSize, currentPage.value - 1);
    } else if (selectedTag.value) {
      data = await getRecommandationsByHashtag(selectedTag.value, pageSize, currentPage.value - 1);
    } else if (selectedType.value) {
      data = await getRecommandationsByType(selectedType.value, pageSize, currentPage.value - 1);
    } else {
      data = await getAllRecommandations(pageSize, currentPage.value - 1);
    }
  } else {
    // Logic for patient: only show recommendations for their type
    if (selectedTag.value) {
      // Filter recommendations by the selected tag and patient's type
      data = await getRecommandationsByHashtagAndType(patientType, selectedTag.value, pageSize, currentPage.value - 1);
    } else {
      // Show all recommendations for the patient's type
      data = await getRecommandationsByType(patientType, pageSize, currentPage.value - 1);
    }
  }

  if (data && data.content) {
    recommendations.value = data.content.map((r) => ({
      ...r
    }));
    totalPages.value = Math.ceil(data.totalElements / pageSize);
  } else {
    recommendations.value = [];
    totalPages.value = 0;
  }
}

// ... (rest of your script remains unchanged)


onMounted(() => {
    console.log(selectedTag.value);
    fetchRecommendations();
});

watch(currentPage, fetchRecommendations);

watch([selectedTag, selectedType], () => {
  currentPage.value = 1;
  fetchRecommendations();
});

function clearFilters() {
  selectedTag.value = null;
  selectedType.value = '';
  fetchRecommendations();
}

</script>

<template>
    <div class="page-container">
    <CustomNavbar />

    <div class="content">
      <div class="header">
        <h1 class="title">Recomandari</h1>
        <button v-if="isDoctor" class="add-button">Adauga recomandare</button>
      </div>

      <div class="filter-bar">
        
        <div class="radio-group">
            <template v-for="tag in tags" :key="`radio-${tag}`">
            <input
                :id="tag"
                type="radio"
                :value="tag"
                name="tag"
                v-model="selectedTag"
            />
            <label :for="tag">{{ `#${tag}` }}</label>
            </template>
        </div>

        <select v-if="isDoctor" v-model="selectedType" class="type-selector" @change="fetchRecommendations()">
          <option value="">General</option>
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
        <button v-if="selectedTag || selectedType" @click="clearFilters()" class="clear-filter-button">Sterge Filtre</button>
      </div>

      <div class="recommendations">
        <div v-for="recommendation in recommendations" :key="recommendation.id" class="card">
          <h3>{{ recommendation.hashtag }}</h3>
          <p>{{ recommendation.text }}</p>
          <p> Pentru: {{ recommendation.recommandationType }}</p>
        </div>
      </div>

      <Pagination
        :totalPages="totalPages"
        :currentPage="currentPage"
        @changePage="changePage"
        class="pagination-component"
      />
    </div>
  </div>
  </template>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.content {
    flex: 1;
    overflow: auto;
    padding: 20px;
    background-color: #f2f2f2;
}
  
.header {
    margin: 50px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 50px;
}

.title {
    margin: 0;
}

.add-button {
    width: 200px;
    height: 50px;
    border-radius: 8px;
    background: #b80f20;
    color: #fff;
    font-size: 18px;
    border: none;
    cursor: pointer;
    display: block;
}

.clear-filter-button {
    width: 80;
    height: 40px;
    border-radius: 8px;
    background: white;
    color: #b80f20;
    font-size: 15px;
    border: 1px solid #b80f20;
    cursor: pointer;
    display: block;
}

.filter-bar {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 20px;
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
    background: #ffffff;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    display: block;
}

.radio-group input[type="radio"]:checked + label {
    background: #b80f20;
    color: #fff;
    border-color: #b80f20;
}

  
.type-selector {
    border-radius: 8px;
    border: 1px solid rgb(194, 191, 191);
}

.recommendations {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 50px;
}
  
.card {
    width: calc(30% - 60px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    background-color: #fff;
}
  
@media (max-width: 768px) {
    .recommendations {
      flex-direction: column;
      align-items: center;
    }
  
    .card {
      width: 50%;
      max-width: 300px;
    }
}
</style>