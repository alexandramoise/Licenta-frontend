<script setup>
import { onMounted, ref } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import PatientCard from "../components/PatientCard.vue";
import FilteringPatientsSidebar from "../components/FilteringPatientsSidebar.vue";
import { getDoctorsPatients, getPatientById } from "../services/patient_service.js";        

const patients = ref([]);

async function fetchPatients() {
    patients.value = await getDoctorsPatients('alexandramoise636@gmail.com');
}

onMounted(() => {
    fetchPatients();
})

const selectedPatient = ref("");
async function showPatientDetails(patientId) {
    selectedPatient.value = await getPatientById(patientId);
    // details page for the selected patient
}

</script>

<template>
    <div class="page">
        <CustomNavbar> </CustomNavbar>

        <div class="filtering-sidebar">
            <FilteringPatientsSidebar> </FilteringPatientsSidebar>
        </div>
        <div class="patients-list">
            <PatientCard
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
    </div>
</template>

<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: rgb(255, 255, 255);
    overflow-y: auto;
}

.filtering-sidebar {
    background-color: rgb(212, 216, 221);
    width: 20vw;
    height: 100vh;
    float: left;
    overflow-y: auto;
}

.patients-list {
    display: flex;
    flex-direction: column;
}
@media(max-width: 600px) {
    .filtering-sidebar {
        width: 30vw;
    }
}
</style>