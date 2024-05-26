<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomLoader from '../components/CustomLoader.vue';
import CustomModal from '@/components/CustomModal.vue';
import PatientCard from "../components/PatientCard.vue";
import FilteringPatientsSidebar from "../components/FilteringPatientsSidebar.vue";
import Pagination from "../components/Pagination.vue";
import StatisticsForListOfPatients from '@/components/StatisticsForListOfPatients.vue';
import StatisticsForOnePatient from '@/components/StatisticsForOnePatient.vue';
import { getPagedFilteredPatients } from "../services/patient_service.js";       
import router from '@/router';
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

const userEmail = localStorage.getItem("user");

const patients = ref([]);
const patientsList = ref([]); // list of all patients used for statistics
const patientsNotFound = ref(false);
const isLoading = ref(false);

const criteria = ref({
    "name": "",
    "minAge": 0,
    "maxAge": 0,
    "gender": "",
    "type": "",
});

function handleUpdateCriteria(newCriteria) {
    currentPage.value = 1; 
    Object.entries(newCriteria).forEach(([key, value]) => {
        if (criteria.value[key] !== value) {
            criteria.value[key] = value;
        }
    });
}

function resetCriteria() {
    currentPage.value = 1; 
    criteria.value.name = "",
    criteria.value.minAge = 0;
    criteria.value.maxAge = 0;
    criteria.value.gender = "";
    criteria.value.type = "";
}

const sizes = [3, 5, 10, 20, 50];
const categories = {
    "Varsta": "dateOfBirth",
    "Nume": "lastName",
}

const pageSize = ref(3);
const totalPages = ref(0);
const currentPage = ref(1);
const sortCategory = ref("Varsta");

onMounted(() => {
    fetchPatients();
});

watch(currentPage, (newPage, oldPage) => {
  fetchPatients();
});

watch(criteria, () => {
  fetchPatients();
}, { deep: true });

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const statisticsForList = ref(false);
const statisticsForOne = ref(true);
async function fetchPatients() {
    if(criteria.value.minAge !== 0 && criteria.value.maxAge !== 0 && criteria.value.minAge > criteria.value.maxAge) {
        modalShow.value = true;
        modalTitle.value = "Problema";
        modalMessage.value = "Interval de varste invalid";
        return;
    } 

    isLoading.value = true;

    try {
        const data = await getPagedFilteredPatients(
            userEmail,
            criteria.value.name, 
            criteria.value.minAge,
            criteria.value.maxAge, 
            criteria.value.gender,
            criteria.value.type,
            pageSize.value, 
            currentPage.value - 1,
            categories[sortCategory.value]
        );

        const dataForList = await getPagedFilteredPatients(
            userEmail,
            criteria.value.name, 
            criteria.value.minAge,
            criteria.value.maxAge, 
            criteria.value.gender,
            criteria.value.type,
            500, // considering a max of 500 patients for a doctor 
            0, 
            categories[sortCategory.value]
        );

        if (data && data.content) {
            if(data.content.length !== 0) {
                patients.value = data.content.map((patient) => ({ ...patient }));
                patientsNotFound.value = false;
                totalPages.value = Math.ceil(data.totalElements / pageSize.value);
            } else {
                totalPages.value = 0;
                patientsNotFound.value = true;
            }
        } else {
            console.error("No content returned from the API");
        }

        if(dataForList && dataForList.content) {
            if(dataForList.content.length !== 0) {
                patientsList.value = dataForList.content.map((p) => ({ ...p }));

                if(dataForList.content.length > 1) {
                    statisticsForList.value = true;
                    statisticsForOne.value = false;
                } else {
                    statisticsForList.value = false;
                    statisticsForOne.value = true;
                }
            } else {
                statisticsForList.value = false;
                statisticsForOne.value = false;
            }
        }

    } catch (error) {
        console.error("An error occurred while fetching patients or statistics:", error);
    } finally {
        isLoading.value = false;
    }
}

function closeDialog() {
    modalShow.value = false;
}

function changePage(newPage) {
    currentPage.value = newPage;
}

function redirectToPatientDetails(id) {
    router.push({
        name: "patient-detailed",
        query: {
            patientId: id,
        },
    });
}

function updateViewCriteria() {
    currentPage.value = 1; // always going back on first page when i do filtering
    fetchPatients();
}

function convertDate(originalDate) {
    const date = new Date(originalDate);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('ro-RO', options);
}

</script>

<template>
    <div class="page" v-if="isAuthenticated">
        <CustomNavbar />

        <div :class="['content', { 'two-columns': patientsNotFound }]">
            <div class="filtering-sidebar">
                <FilteringPatientsSidebar
                    @update-criteria="handleUpdateCriteria"
                    @reset-filters="resetCriteria"
                />
            </div>
            <div class="patients-list">
                <div class="input-section">
                    <div class="select-container">
                        <label for="pageSizeSelect" class="form-label">Afiseaza</label>
                        <select id="pageSizeSelect" name="pageSizeSelect" v-model="pageSize" class="custom-input" @change="updateViewCriteria">
                            <option v-for="size in sizes" :key="size" :value="size">
                                {{ size }}
                            </option>
                        </select>
                    </div>

                    <div class="select-container">
                        <label for="sortBySelect" class="form-label">Sorteaza dupa</label>
                        <select id="sortBySelect" name="sortBySelect" v-model="sortCategory" class="custom-input" @change="updateViewCriteria">
                            <option v-for="(value, key) in categories" :key="key" :value="key">
                                {{ key }}
                            </option>
                        </select>
                    </div>
                </div>

                <div v-if="!patientsNotFound" class="patients-container">
                    <PatientCard
                        v-for="patient in patients"
                        :key="patient.id" 
                        :name="patient.fullName" 
                        :email="patient.email"
                        :age="patient.age"
                        :tendency="patient.tendency"
                        :doctorEmail="patient.doctorEmail"
                        :gender="patient.gender"
                        @click="redirectToPatientDetails(patient.id)"
                    />

                    <Pagination 
                        :totalPages="totalPages"
                        :currentPage="currentPage"
                        @changePage="changePage"
                        class="pagination-component"
                    />

                    <div v-if="isLoading" class="loading-animation" aria-label="Se incarca, asteptati">
                          <CustomLoader size="100" />
                    </div>

                    <CustomModal
                        :open="modalShow"
                        :forConfirmation="false"
                        :title="modalTitle"
                        :message="modalMessage"
                        @close="closeDialog"
                    />

                </div>
                <div v-else class="not-found">
                    <p> Nu s-au gasit pacienti.  </p>
                </div>
            </div>
           <div class="statistics-panel" v-if="!patientsNotFound">
                <div v-if="statisticsForList">
                    <StatisticsForListOfPatients :patients="patientsList" />
                </div>
                <div v-if="statisticsForOne && patientsList.length > 0">
                    <StatisticsForOnePatient :patientEmail="patientsList[0].email" />
                </div>
            </div>
        </div>
    </div>
    <div v-else> 
        <NotAuthenticatedView />
    </div>
</template>


<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: rgb(255, 255, 255);
    overflow-y: hidden;
}

.content {
    display: grid;
    grid-template-columns: 20% 35% 45%;
}

.two-columns {
    grid-template-columns: 20% 80%; 
}

.filtering-sidebar {
    background-color: rgb(212, 216, 221);
    height: 100vh;
    float: left;
    overflow-y: auto;
    scrollbar-width: thin; 
    scrollbar-color: #c9c9c9 #ececec;
}

.input-section {
    display: flex;
    justify-content: space-between;
    padding: 10px; 
}

.select-container {
    flex: 1;
    margin: 2px 5px; 
}

.patients-list {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    padding-bottom: 60px; 
    position: relative;
}

.patients-container {
    flex-grow: 1;
    overflow-y: auto;
    scrollbar-width: thin; 
    scrollbar-color: #c9c9c9 #ececec; 
}

.form-label {
    font-size: 17px;
    padding: 10px;
    font-family: Georgia, 'Times New Roman', Times, serif;
    font-weight: 400;
}

.custom-input {
    border: 1px solid #ccc;
    height: 100%;
    padding: 3px;
    border-radius: 4px;
    font-size: 15px;
}

.pagination-component {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    background-color: inherit;
    margin-top: auto; 
    text-align: center;
    padding: 10px 0;  
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
    z-index: 1000; 
}

.not-found {
    display: flex;
    justify-content: center;
    align-items: center; 
    height: 100%;
    text-align: center;
    color: darkred;
    font-size: 17px;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
}

.statistics-panel {
  background-color: rgb(240, 240, 240);
  height: 100vh;
  padding: 15px;
  overflow-y: hidden;
}


@media(max-width: 600px) {
    .content {
        grid-template-columns: 30% 35% 35%;
    }
}
</style>

