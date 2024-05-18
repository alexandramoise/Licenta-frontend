<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomLoader from '../components/CustomLoader.vue';
import PatientCard from "../components/PatientCard.vue";
import FilteringPatientsSidebar from "../components/FilteringPatientsSidebar.vue";
import Pagination from "../components/Pagination.vue";
import { getPagedPatients, getPagedFilteredPatients } from "../services/patient_service.js";        
import router from '@/router';
import NotAuthenticatedView from './NotAuthenticatedView.vue';
 
// checking whether or not the user is authenticated based on the token's existence
const token = localStorage.getItem("token");
const isAuthenticated = ref(token !== null);
watch(() => localStorage.getItem("token"), (newToken) => {
  isAuthenticated.value = newToken !== null;
});

const userEmail = localStorage.getItem("user");

const patients = ref([]);
const patientsNotFound = ref(false);
const isLoading = ref(false);

const criteria = ref({
    "name": "",
    "maxAge": 0,
    "gender": "",
    "type": "",
});

function handleUpdateCriteria(newCriteria) {
    currentPage.value = 1; // always going back on the first page when i do filtering
    Object.entries(newCriteria).forEach(([key, value]) => {
        if (criteria.value[key] !== value) {
            criteria.value[key] = value;
        }
    });
}

function resetCriteria() {
    currentPage.value = 1; // always going back on the first page when i do filtering
    criteria.value.name = "",
    criteria.value.maxAge = 0;
    criteria.value.gender = "";
    criteria.value.type = "";
}

const pageSize = 3;
const totalPages = ref(0);
const currentPage = ref(1);

onMounted(() => {
    fetchPatients();
});

watch(currentPage, (newPage, oldPage) => {
  fetchPatients();
});

watch(criteria, () => {
  fetchPatients();
}, { deep: true });

async function fetchPatients() {
    isLoading.value = true;

    const data = await getPagedFilteredPatients(
            userEmail,
            criteria.value.name, 
            criteria.value.maxAge, 
            criteria.value.gender,
            criteria.value.type,
            pageSize, 
            currentPage.value - 1,
            "dateOfBirth"
        );

    if (data && data.content) { 
        if(data.content.length !== 0) {
            patients.value = data.content.map((patient) => ({
                ...patient
            }));

            patientsNotFound.value = false;
            totalPages.value = Math.ceil(data.totalElements / pageSize);
        
        } else {
            totalPages.value = 0;
            patientsNotFound.value = true;
        }
    } else {
        console.error("No content returned from the API");
    }

    isLoading.value = false;
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
</script>

<template>
    <div class="page" v-if="isAuthenticated">
        <CustomNavbar />

        <div class="content">
            <div class="filtering-sidebar">
                <FilteringPatientsSidebar
                    @update-criteria = "handleUpdateCriteria"
                    @reset-filters = "resetCriteria"
                />
            </div>
            <div class="patients-list">
                <div v-if="!patientsNotFound">
                    <PatientCard
                        :class="card"
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

                </div>
                <div v-else class="not-found">
                    <p> Nu s-au gasit pacienti.  </p>
                </div>
            </div>
            <div class="statistics-panel">
                <p> AICI VOR FI STATISTICILE </p>
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

.filtering-sidebar {
    background-color: rgb(212, 216, 221);
    height: 100vh;
    float: left;
    overflow-y: auto;
}

.patients-list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: relative; /* Adăugăm poziționare relativă aici */
    max-height: 90vh;
}

.pagination-component {
    position: absolute;
    bottom: 0;
    left: 50%; 
    transform: translateX(-50%); 
    width: auto; 
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
}

@media(max-width: 600px) {
    .content {
        grid-template-columns: 30% 35% 35%;
    }
}
</style>