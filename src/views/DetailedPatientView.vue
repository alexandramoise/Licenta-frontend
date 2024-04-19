<script setup>
import { onMounted, ref } from 'vue';
import { getPatientById } from '../services/patient_service';
import { getPatientsPagedAppointments } from '@/services/appointments_service';
import { useRoute  } from "vue-router";
import router from "@/router";

import CustomNavbar from '@/components/CustomNavbar.vue';
import CustomButton from '@/components/CustomButton.vue';
import Pagination from '@/components/Pagination.vue';

const route = useRoute();

const patientName = ref('');
const patientAppointments = ref([]);
const patientTreatments = ref([]);
const patientMedicalHistory = ref([]);
onMounted(async () => {
    if (route.query.patientId) {
        let id = route.query.patientId;
        const data = await getPatientById(id);
        patientName.value = data.fullName;

        patientAppointments.value = data.appointments.map((appointment) => ({
                ...appointment
            }));

        patientMedicalHistory.value = data.medicalConditions.map((m) => ({
                ...m
            }));

        patientTreatments.value = data.treatments.map((t) => ({
            ...t
        }));

        console.log("programari: ", patientAppointments.value[0], ", boli: ", patientMedicalHistory.value, " si tratamente ", patientTreatments.value);
        console.log("In pagina de detalii: ", data);
    }
});

const treatmentHistory = ref(false);
const medicalHistory = ref(false);
const visitsHistory = ref(false);

function showMTreatmentHistory() {
    treatmentHistory.value = true;
    medicalHistory.value = false;
    visitsHistory.value = false;
}

function showMedicalHistory() {
    medicalHistory.value = true;
    treatmentHistory.value = false;
    visitsHistory.value = false;
}

function showVisitsHistory() {
    visitsHistory.value = true;
    treatmentHistory.value = false;
    medicalHistory.value = false;
}

function showAllInformation() {
    treatmentHistory.value = false;
    medicalHistory.value = false;
    visitsHistory.value = false;
}

function convertDateToSuitableFormat(originalDate) {
    const date = new Date(originalDate);
    const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit' };
    return `${date.toLocaleDateString('ro-RO', optionsDate)} ${date.toLocaleTimeString('ro-RO', optionsTime)}`;
}

function convertDateOnly(originalDate) {
    const date = new Date(originalDate);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('ro-RO', options);
}
</script>

<template>
<div class="page">
    <CustomNavbar />
    
    <div class="content">
            <div class="options-sidebar">
                <CustomButton class="option-button" @click="showMTreatmentHistory"> Istoric tratament </CustomButton>
                <CustomButton class="option-button" @click="showMedicalHistory"> Istoric medical </CustomButton>
                <CustomButton class="option-button" @click="showVisitsHistory"> Istoric vizite </CustomButton>
                <CustomButton class="option-button" @click="showAllInformation"> Inapoi la toate informatiile </CustomButton>
            </div>
            <div class="middle-container">
                <p v-if="!treatmentHistory && !medicalHistory && !visitsHistory"> 
                    AICI SUNT ULTIMELE DATE PENTRU PACIENTUL {{ patientName }} : <br> <br>
                    <h3> Ultima programare: </h3>
                    <div v-if="patientAppointments.length !== 0">
                        
                        Data: {{ convertDateToSuitableFormat(patientAppointments[0].date) }} <br>
                        Tip: {{ patientAppointments[0].visitType }} 
                    </div>
                    <div v-else>
                        <p> Inca nu ati avut intalniri cu pacientul {{ patientName }}</p>
                    </div>

                    <h3> Afectiuni: </h3>
                    <div v-if="patientMedicalHistory.length !== 0">
                        {{  patientMedicalHistory[0].name}}
                    </div>
                    <div v-else>
                        <p> Pacientul {{ patientName }} nu are nicio afectiune inregistrata </p>
                    </div>

                    <h3> Ultimul tratament: </h3>
                    <div v-if="patientTreatments.length !== 0">
                        <p> <span style="font-size: 17px; color: darkred; font-weight: 700;"> Afectiune: </span> {{ patientTreatments[0].medicalConditionName }} </p>
                        <p> <span style="font-size: 17px; color: darkred; font-weight: 700;"> Nume medicament: </span> {{ patientTreatments[0].medicineName }} </p>
                        <p> <span style="font-size: 17px; color: darkred; font-weight: 700;"> Doza zilnica: </span> {{ patientTreatments[0].doses }} </p>
                        <p> <span style="font-size: 17px; color: darkred; font-weight: 700;"> Data inceput: </span> {{ convertDateOnly(patientTreatments[0].startingDate) }}</p>
                        <p> <span style="font-size: 17px; color: darkred; font-weight: 700;"> Data final: </span> {{ patientTreatments[0].endingDate != null ? convertDateOnly(patientTreatments[0].endingDate) : 'nu e incheiat' }}</p>
                    </div>
                    <div v-else>
                        <p> Pacientul {{ patientName }} nu are niciun tratament inregistrat </p>
                    </div>
                </p>

                <!-- sectiune tratamente -->
                <div v-if="treatmentHistory">
                    AICI O SA AFISEZ TRATAMENTELE PENTRU PACIENT SI BUTONUL 
                    <div v-if="patientTreatments.length !== 0">
                        <div 
                            v-for="treatment in patientTreatments" 
                            :key="treatment.id"
                            class="card"
                        >
                            <p> Afectiune: {{ treatment.medicalConditionName }} </p>
                            <p> Nume tratament: {{ treatment.medicineName }} </p>
                            <p> Doza zilnica: {{ treatment.doses }} </p>
                            <p> Data inceput: {{ convertDateOnly(treatment.startingDate) }}</p>
                            <p> Data final: {{ treatment.endingDate != null ? convertDateOnly(treatment.endingDate) : 'nu e incheiat' }}</p>
                        </div>

                        <Pagination 
                            :totalPages="totalPages"
                            :currentPage="currentPage"
                            @changePage="changePage"
                            class="pagination-component"
                        />
                    </div>
                    <div v-else>
                        <p>Pacientul {{ patientName }} nu are tratamente adaugate.</p>
                    </div>
                </div>

                <!-- sectiune boli -->
                <div v-if="medicalHistory">
                    AICI O SA AFISEZ BOLILE PENTRU PACIENT
                </div>

                <!-- sectiune vizite -->
                <div v-if="visitsHistory">
                    <div v-if="patientAppointments.length !== 0">
                        <div 
                            v-for="appointment in patientAppointments" 
                            :key="appointment.id"
                            class="card"
                        >
                            <p>Tip vizită: {{ appointment.visitType }}</p>
                            <p>Data: {{ convertDateToSuitableFormat(appointment.date) }}</p>
                        </div>

                        <Pagination 
                            :totalPages="totalPages"
                            :currentPage="currentPage"
                            @changePage="changePage"
                            class="pagination-component"
                        />
                    </div>
                    <div v-else>
                        <p>Pacientul {{ patientName }} nu are vizite la activ.</p>
                    </div>
                </div>

            </div>
            <div class="statistics-panel">
                <p> AICI VOR FI STATISTICILE </p>
            </div>
        </div>
</div>
</template>

<style scoped>
.page {
    max-height: 100vh;
    width: 100vw;
    background-color: rgb(255, 255, 255);
    overflow-y: hidden;
}

.content {
    display: grid;
    grid-template-columns: 20% 40% 40%;
}

.options-sidebar {
    background-color: rgb(248, 231, 237);
    float: left;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

}

.option-button {
    background-color: rgb(231, 149, 149);
    border-color: transparent;
    border-radius: 10px;
    width: 60%;
    margin: auto;
    height: 6%;
}

.option-button:hover {
    background-color: rgb(198, 111, 111);;
}

.middle-container {
    display: flex;
    flex-direction: column;
    position: relative; 
    background-color: rgb(255, 221, 227);
    padding: 25px;
}

.pagination-component {
    position: absolute;
    bottom: 0; /* Poziționează la baza containerului `.patients-list` */
    left: 50%; /* Începe la jumătatea `.patients-list` */
    transform: translateX(-50%); /* Centrează-l în mod corect pe orizontală */
    width: auto; /* Setează lățimea să fie auto sau cât de mare trebuie să fie */
}

.card {
    background-color: white;
    width: 40%;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;
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
        grid-template-columns: 0% 50% 50%;
    }

    .filtering-sidebar {
        display: flex;
        flex-direction: row;
        background-color: red;
    }
}
</style>