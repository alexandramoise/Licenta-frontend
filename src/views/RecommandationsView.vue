<script setup>
import { onMounted, ref, watch, reactive, computed } from 'vue';
import router from '@/router';
import { getPatientByEmail } from '@/services/patient_service';
import { getAllRecommandations, getRecommandationsByType, 
         getRecommandationsByHashtag, getRecommandationsByHashtagAndType, 
         getAllRecommandationsForPatient, getRecommandationsForPatientByHashtag} from '@/services/recommandation_service.js' 

import CustomNavbar from '@/components/CustomNavbar.vue';
import Pagination from '@/components/Pagination.vue';
import CustomButton from '@/components/CustomButton.vue';
import CustomLoader from '@/components/CustomLoader.vue';
import NotAuthenticatedView from './NotAuthenticatedView.vue';

// checking whether or not the user is authenticated based on the token's existence and expiration
const token = ref(localStorage.getItem("token"));
const availableUntil = ref(localStorage.getItem("availableUntil"));
const currentDate = ref(new Date());

const isAuthenticated = computed(() => {
    if (!token.value) return false;
    const expirationDate = new Date(availableUntil.value);
    return currentDate.value < expirationDate;
});

watch([token, availableUntil], ([newToken, newExpireDate]) => {
    if (newToken === null || newExpireDate === null) {
        isAuthenticated.value = false;
    } else {
        const expirationDate = new Date(newExpireDate);
        const currentDate = new Date();
        isAuthenticated.value = currentDate < expirationDate;
    }
});

onMounted(() => {
    currentDate.value = new Date();
    token.value = localStorage.getItem("token");
    availableUntil.value = localStorage.getItem("availableUntil");
});


const userType = localStorage.getItem('role');
const isDoctor = ref(userType == "doctor");

const tags = ref(['Sport', 'Alimentatie', 'Stres', 'Obiceiuri']);
const types = ref(['Hipertensiune','Normal','Hipotensiune']); 
const selectedTag = ref('');
const selectedType = ref('');
const recommendations = ref([]);

const pageSize = 3;
const totalPages = ref(0);
const currentPage = ref(1);

let userEmail = localStorage.getItem('user');
let doctorEmail;
let patientType;

// Define a cache object
const recommendationsCache = reactive(new Map());

if(!isDoctor.value) {
    let data = await getPatientByEmail(userEmail);
    patientType = data.tendency;
    doctorEmail = data.doctorEmailAddress;
    console.log("Tip pacient: ", patientType);
} else {
    doctorEmail = userEmail;
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


const isLoading = ref(false);
async function fetchRecommendations() {
  const cacheKey = `${doctorEmail}-${selectedTag.value}-${selectedType.value}-${currentPage.value}`;
  if (recommendationsCache.has(cacheKey)) {
    // Load from cache
    const cachedData = recommendationsCache.get(cacheKey);
    recommendations.value = cachedData.content;
    totalPages.value = Math.ceil(cachedData.totalElements / pageSize);
    return;
  }

  isLoading.value = true;
  let data;
  // fetch-urile pentru doctor: dupa eticheta, tip, eticheta si tip sau toate
  if (isDoctor.value) {
    if (selectedTag.value && selectedType.value) {
      let typeInEnglish = typeTranslations[selectedType.value] || selectedType.value;
      data = await getRecommandationsByHashtagAndType(doctorEmail, typeInEnglish, selectedTag.value, pageSize, currentPage.value - 1);
      isLoading.value = false;
    } else if (selectedTag.value) {
      data = await getRecommandationsByHashtag(doctorEmail, selectedTag.value, pageSize, currentPage.value - 1);
      isLoading.value = false;
    } else if (selectedType.value) {
      let typeInEnglish = typeTranslations[selectedType.value] || selectedType.value;
      data = await getRecommandationsByType(doctorEmail, typeInEnglish, pageSize, currentPage.value - 1);
      isLoading.value = false;
    } else {
      data = await getAllRecommandations(doctorEmail, pageSize, currentPage.value - 1);
      isLoading.value = false;
    }
  } 
  // fetch-urile pentru pacient, dupa eticheta sau toate
  else {
    if (selectedTag.value) {
      data = await getRecommandationsForPatientByHashtag(doctorEmail, patientType, selectedTag.value, pageSize, currentPage.value - 1);
      isLoading.value = false;
    } else {
      data = await getAllRecommandationsForPatient(doctorEmail, patientType, pageSize, currentPage.value - 1);
      isLoading.value = false;
    }
  }

  if (data && data.content) {
      recommendations.value = data.content.map((r) => ({
          ...r
      }));


      // saving the result from the request
      recommendationsCache.set(cacheKey, data);

      totalPages.value = Math.ceil(data.totalElements / pageSize);
  } else {
      recommendations.value = [];
      totalPages.value = 0;
  }
}

onMounted(() => {
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

function redirectToAdd() {
  router.push("add-recommandation");
}

// get the icon associated with each tag
const getIconPath = (tag) => {
  switch (tag) {
    case 'Sport':
      return '/src/assets/images/sport.png';
    case 'Alimentatie':
      return '/src/assets/images/alimentatie.png';
    case 'Stres':
      return '/src/assets/images/stres.png';
    case 'Obiceiuri':
      return '/src/assets/images/obiceiuri.png';
    default:
      return '/src/assets/images/logo.png';
  }
};

</script>


<template>
  <div v-if="isLoading" class="loading-animation" aria-label="Se incarca, asteptati">
    <CustomLoader size="100" />
  </div>

  <div class="page-container" v-if="isAuthenticated">
    <CustomNavbar />

    <div class="content">
      <div class="header">
        <h2 class="title">Recomandari</h2>
        <CustomButton v-if="isDoctor" class="add-button" @click="redirectToAdd">Adauga recomandare</CustomButton>
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
          <option class="type-option" v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
        <button v-if="selectedTag || selectedType" @click="clearFilters()" class="clear-filter-button">Sterge Filtre</button>
      </div>

      <div v-if="recommendations.length !== 0">
        <div class="recommendations">
          <div v-for="recommendation in recommendations" :key="recommendation.id" class="card">
            <div class="card-content">
              <h3> #{{ recommendation.hashtag }}</h3>
              <p>{{ recommendation.text }}</p>
              <p> Pentru: {{ recommendation.recommandationType }}</p>
            </div>
            <div class="card-icon">
              <img :src="getIconPath(recommendation.hashtag)" alt="icon">
            </div>
          </div>
        </div>

        <Pagination
            :totalPages="totalPages"
            :currentPage="currentPage"
            @changePage="changePage"
            class="pagination-component"
        />
      </div>
      <div v-else>
        <p class="not-found"> Nu s-au gasit recomandari. </p>
      </div>
    </div>
  </div>
  <div v-else> 
    <NotAuthenticatedView />
  </div>
</template>


<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.loading-animation {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.5); 
    z-index: 1000; /* is positioned above other components */
}

.content {
    flex: 1;
    overflow: auto;
    padding: 20px;
    background-color: #f2f2f2;
}
  
.header {
    margin: 60px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
}

.not-found {
    display: flex;
    justify-content: center;
    align-items: center; 
    margin-top: 100px;
    text-align: center;
    color: darkred;
    font-size: 17px;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
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
    width: 100px;
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
    padding: 5px;
}

.recommendations {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 50px;
}
  
.card {
    width: calc(30% - 100px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
  
.card-content {
    flex: 1;
}

.card-icon img {
    width: 100px;
    height: 120px;
    margin-left: 10px;
}

@media (max-width: 768px) {
    .recommendations {
      flex-direction: column;
      align-items: center;
    }
  
    .card {
      width: 70%;
      max-width: 300px;
    }

    .filter-bar {
      flex-direction: column;
    }

    .radio-group {
      display: grid;
      grid-template-columns: 50% 50%;
    }

    .type-selector {
      height: 30px;
    }
    
    .add-button {
      width: 120px;
      height: 40px;
      border-radius: 8px;
      background: #b80f20;
      color: #fff;
      font-size: 14px;
      border: none;
      cursor: pointer;
      display: block;
  }

    .card-icon img {
      width: 70px;
      height: 70px;
      margin-left: 10px;
  }

}
</style>