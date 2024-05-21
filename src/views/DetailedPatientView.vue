<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { getPatientById, getMedicalConditions } from '../services/patient_service.js';
import { getPatientsAppointments } from '@/services/appointments_service.js';
import { getCurrentMedicalConditions, getAllMedicalConditions } from '@/services/medical_condition_service.js'
import { getMostRecentOfPatientAppointments } from '../services/appointments_service.js';
import { getTreatmentsForCondition } from '@/services/treatment_service.js'
import { useRoute } from "vue-router";

import CustomNavbar from '@/components/CustomNavbar.vue';
import CustomButton from '@/components/CustomButton.vue';
import CustomInput from '@/components/CustomInput.vue';
import CustomModal from '@/components/CustomModal.vue';

const route = useRoute();

const token = localStorage.getItem("token");
console.log(token);
const isAuthenticated = ref(token !== null);
watch(() => localStorage.getItem("token"), (newToken) => {
  isAuthenticated.value = newToken !== null;
});

const patientName = ref('');
const patientAppointments = ref([]);
const patientTreatments = ref([]);
const patientCurrentMedicalConditions = ref([]);
const patientMedicalHistory = ref([]);
const medicineName = ref('');

const latestAppointment = ref(null);

onMounted(async () => {
    if (route.query.patientId) {
        let id = route.query.patientId;
        const data = await getPatientById(id);
        patientName.value = data.fullName;
        
        try {
            latestAppointment.value = await getMostRecentOfPatientAppointments(data.email);
        } catch(error) {
            if(error.message === 'No appointments') {
                latestAppointment.value = 'Pacientul nu are programari';
            } else if(error.message === 'No past appointments') {
                latestAppointment.value = 'Doar programari viitoare';
            }
        }

        let medcond = await getAllMedicalConditions(data.email);
        let current = await getCurrentMedicalConditions(data.email);
        patientMedicalHistory.value = medcond.map(m => m);
        patientCurrentMedicalConditions.value = current.map(m => m);

       let medicalCondition = '';
       if(data.tendency === 'Hypertension') {
          medicalCondition = "Hipertensiune";
       } else if(data.tendency === 'Hypotension') {
          medicalCondition = "Hipotensiune";
       }

       console.log(medicalCondition);
       let treatments = await getTreatmentsForCondition(data.email, medicalCondition);
       patientTreatments.value = treatments.map(t => t);

       let appointments = await getPatientsAppointments(data.email);
       patientAppointments.value = appointments.map(a => a);

        console.log("programari: ", patientAppointments.value[0], ", boli: ", patientMedicalHistory.value, " si tratamente ", patientTreatments.value);
        console.log("In pagina de detalii: ", data);
    }
});

const treatmentHistory = ref(false);
const medicalHistory = ref(false);
const visitsHistory = ref(false);

const filteredTreatments = computed(() => {
    return patientTreatments.value.filter(treatment => 
        treatment.medicineName.toLowerCase().includes(medicineName.value.toLowerCase())
    );
});

const conditionStyles = computed(() => {
    return condition => {
        return {
            backgroundColor: condition.endingDate ? '#f8d7da' : '#d4edda'
        };
    };
});

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
    <div class="page" v-if="isAuthenticated">
        <CustomNavbar />
        
        <div class="content">
            <div class="options-sidebar">
                <CustomButton class="option-button" @click="showMTreatmentHistory"> Istoric tratament </CustomButton>
                <CustomButton class="option-button" @click="showMedicalHistory"> Istoric medical </CustomButton>
                <CustomButton class="option-button" @click="showVisitsHistory"> Istoric vizite </CustomButton>
                <CustomButton class="option-button" @click="showAllInformation"> Inapoi la toate informatiile </CustomButton>
            </div>
            <div class="main-content">
                <div class="details-section">
                    <div v-if="!treatmentHistory && !medicalHistory && !visitsHistory"> 
                        <h3>Ultima programare:</h3>
                        <div v-if="latestAppointment && (latestAppointment === 'Pacientul nu are programari' || latestAppointment === 'Doar programari viitoare')">
                            {{ latestAppointment }}
                        </div>
                        <div v-else-if="latestAppointment && (typeof latestAppointment == 'object')" class="card">
                            <p> Data: {{ convertDateToSuitableFormat(latestAppointment.date) }}</p>
                            <p> Tip: {{ latestAppointment.visitType }}</p>
                            <p> Motiv: {{ latestAppointment.comment }}</p>
                        </div>
                        
                        <h3>Afectiuni curente:</h3>
                        <div v-if="patientCurrentMedicalConditions.length > 0">
                            <ul>
                                <li v-for="condition in patientCurrentMedicalConditions" :key="condition.id">
                                    {{ condition.name }} de la {{ convertDateOnly(condition.startingDate) }}
                                </li>
                            </ul>
                        </div>
                        <div v-else>
                            <p>Pacientul {{ patientName }} nu are nicio afectiune inregistrata</p>
                        </div>
                        
                        <h3>Ultimul tratament:</h3>
                        <div v-if="patientTreatments.length !== 0" class="card">
                            <p>Afectiune: {{ patientTreatments[0].medicalConditionName }}</p>
                            <p>Nume medicament: {{ patientTreatments[0].medicineName }}</p>
                            <p>Doza zilnica: {{ patientTreatments[0].doses }}</p>
                            <p>Comentariu: {{ patientTreatments[0].comment }}</p>
                            <p>Data inceput: {{ convertDateOnly(patientTreatments[0].startingDate) }}</p>
                            <p>Data final: {{ patientTreatments[0].endingDate != null ? convertDateOnly(patientTreatments[0].endingDate) : 'nu e incheiat' }}</p>
                        </div>
                        <div v-else>
                            <p>Pacientul {{ patientName }} nu are niciun tratament inregistrat</p>
                        </div>
                    </div>
                    
                    <!-- sectiune tratamente -->
                    <div v-if="treatmentHistory">
                        <div class="header">
                            <h3>Istoric tratamente:</h3>
                            <CustomInput 
                                v-model="medicineName"
                                :type="'text'"
                                name="medicineName"
                                placeholder="nume medicament"
                            />
                        </div>

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
                                <CustomButton class="filter-button" @click="filterByDate"> Filtrare </CustomButton>
                                <CustomModal
                                    :open="filterModalShow"
                                    :forConfirmation="false"
                                    :title="filterModalTitle"
                                    :message="filterModalMessage"
                                    @close="closeDialog"
                                />
                            </div>

                        <div v-if="filteredTreatments.length !== 0">
                            <div v-for="treatment in filteredTreatments" :key="treatment.id" class="card" :style="conditionStyles(treatment)">
                                <p>Afectiune: {{ treatment.medicalConditionName }}</p>
                                <p>Nume tratament: {{ treatment.medicineName }}</p>
                                <p>Doza zilnica: {{ treatment.doses }}</p>
                                <p>Data inceput: {{ convertDateOnly(treatment.startingDate) }}</p>
                                <p>Data final: {{ treatment.endingDate != null ? convertDateOnly(treatment.endingDate) : 'nu e incheiat' }}</p>
                            </div>
                        </div>
                        <div v-else>
                            <p>Pacientul {{ patientName }} nu a avut tratamentul {{ medicineName }} prescris.</p>
                        </div>
                    </div>
                    
                    <!-- sectiune boli -->
                    <div v-if="medicalHistory">
                        <h3>Istoric medical:</h3>
                        <div v-if="patientMedicalHistory.length > 0">
                            <ul>
                                <li v-for="condition in patientMedicalHistory" :key="condition.id" :style="conditionStyles(condition)">
                                    {{ condition.name }} de la {{ convertDateOnly(condition.startingDate) }} la {{ condition.endingDate != null ? convertDateOnly(condition.endingDate) : 'nu e incheiat' }}
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- sectiune vizite -->
                    <div v-if="visitsHistory">
                        <h3>Istoric vizite:</h3>
                        <div v-if="patientAppointments.length !== 0">
                            <div v-for="appointment in patientAppointments" :key="appointment.id" class="card">
                                <p>Tip vizită: {{ appointment.visitType }}</p>
                                <p>Motiv: {{ appointment.comment }}</p>
                                <p>Data: {{ convertDateToSuitableFormat(appointment.date) }}</p>
                            </div>
                        </div>
                        <div v-else>
                            <p>Pacientul {{ patientName }} nu are vizite la activ.</p>
                        </div>
                    </div>
                </div>
                <div class="statistics-panel">
                    <p>AICI VOR FI STATISTICILE</p> <br>
                    
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
    background-color: #f8f9fa;
    overflow-y: hidden;
}

.content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.options-sidebar {
    display: flex;
    justify-content: space-around;
    background-color: #f8d7da;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.option-button {
    background-color: #d9534f;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    padding: 10px 20px;
    margin: 5px;
}

.option-button:hover {
    background-color: #c9302c;
}

.main-content {
    display: flex;
    height: calc(100% - 70px);
}

.details-section {
    width: 40%;
    padding: 20px;
    overflow-y: auto;
}

.date-inputs {
    display: grid;
    grid-template-columns: 30% 30% 40%;
    gap: 10px; 
    margin-bottom: 10px;
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
}

.filter-button:hover {
    background-color: rgb(255, 247, 247);
    font-size: 14px;
}

.statistics-panel {
    width: 60%;
    padding: 20px;
    background-color: #f0f0f0;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
}

.card {
    background-color: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    width: 80%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card h2 {
    margin-top: 0;
    color: #d9534f;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 90%;
}

ul {
    list-style-type: none;
    padding: 0;
}

ul li {
    background: #e5e5e5c6;
    margin: 5px 0;
    padding: 10px;
    border-radius: 5px;
    width: 85%;
}

p {
    margin: 0;
    color: #555;
}

@media(max-width: 600px) {
    .content {
        flex-direction: column;
    }

    .options-sidebar {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 10px;
    }

    .option-button {
        width: 48%;
        margin: 5px 0;
    }

    .main-content {
        flex-direction: column;
        height: auto;
    }

    .details-section, .statistics-panel {
        width: 100%;
        height: calc((100vh - 140px) / 2);
        overflow-y: auto;
    }
}
</style>
