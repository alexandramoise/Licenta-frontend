<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import PatientCard from "../components/PatientCard.vue";
import FilteringPatientsSidebar from "../components/FilteringPatientsSidebar.vue";
import Pagination from "../components/Pagination.vue";
import { getPagedPatients } from "../services/patient_service.js";        
import router from '@/router';
 
// checking whether or not the user is authenticated based on the token's existence
const token = localStorage.getItem("token");
const isAuthenticated = ref(token !== null);
watch(() => localStorage.getItem("token"), (newToken) => {
  isAuthenticated.value = newToken !== null;
});

const userEmail = localStorage.getItem("user");

const patients = ref([]);
const patientsNotFound = ref(false);

const pageSize = 3;
const totalPages = ref(0);
const currentPage = ref(1);

onMounted(() => {
    fetchPatients();
});

watch(currentPage, (newPage, oldPage) => {
  fetchPatients();
});

async function fetchPatients() {
    const data = await getPagedPatients(userEmail, pageSize, currentPage.value - 1, "dateOfBirth");

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
                <FilteringPatientsSidebar />
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
        <p> NEAUTENTIFICAAAT </p>
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
    bottom: 0; /* Poziționează la baza containerului `.patients-list` */
    left: 50%; /* Începe la jumătatea `.patients-list` */
    transform: translateX(-50%); /* Centrează-l în mod corect pe orizontală */
    width: auto; /* Setează lățimea să fie auto sau cât de mare trebuie să fie */
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