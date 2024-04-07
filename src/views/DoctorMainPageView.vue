<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import PatientCard from "../components/PatientCard.vue";
import FilteringPatientsSidebar from "../components/FilteringPatientsSidebar.vue";
import { getDoctorsPatients, getPagedPatients, getPatientById } from "../services/patient_service.js";        

const patients = ref([]);

async function loadPatients() {
    const data = await getPagedPatients(
        "alexandramoise636@gmail.com",
        3,
        0,
        "dateOfBirth"
    );

    if (data && data.content) { 
        patients.value = data.content.map((patient) => ({
            ...patient
        }));

        console.log(patients.value); 
    } else {
        console.error("No content returned from the API");
    }
}

onMounted(() => {
    loadPatients();
});


const selectedPatient = ref("");
async function showPatientDetails(patientId) {
    selectedPatient.value = await getPatientById(patientId);
}


</script>

<template>
    <div class="page">
        <CustomNavbar />

        <div class="content">
            <div class="filtering-sidebar">
                <FilteringPatientsSidebar />
            </div>
            <div class="patients-list">
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
                    @click="showPatientDetails(patient.id)"
                />
            </div>
            <div class="statistics-panel">
                <p> AICI VOR FI STATISTICILE </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: rgb(255, 255, 255);
    overflow-y: auto;
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
    display: flex;
    flex-direction: column;
}

.statistics-panel {
    background-color: rgb(181, 255, 255);
    height: 100vh;
    padding: 15px;
}

@media(max-width: 600px) {
    .content {
        grid-template-columns: 30% 35% 35%;
    }
}
</style>