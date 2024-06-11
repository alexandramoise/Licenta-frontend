<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { getPatientById } from '../services/patient_service.js';
import { getMostRecentOfPatientAppointments, getPatientAppointmentsInTime } from '@/services/appointments_service.js';
import { getCurrentMedicalConditions, getAllMedicalConditions } from '@/services/medical_condition_service.js'
import { getTreatmentsForCondition, endTreatment } from '@/services/treatment_service.js'
import { getBloodPressures } from '@/services/bloodpressure_service.js';
import { useRoute } from "vue-router";

import CustomNavbar from '@/components/CustomNavbar.vue';
import CustomButton from '@/components/CustomButton.vue';
import CustomInput from '@/components/CustomInput.vue';
import CustomModal from '@/components/CustomModal.vue';
import CustomLoader from '@/components/CustomLoader.vue';
import StatisticsForOnePatient from '@/components/StatisticsForOnePatient.vue';
import DateFiltering from '@/components/DateFiltering.vue';
import router from '@/router';

import NotAuthenticatedView from './NotAuthenticatedView.vue';
import NotFoundView from './NotFoundView.vue';

const route = useRoute();

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

const patientName = ref('');
const patientEmail = ref('');
const patientTendency = ref('');
const patientAppointments = ref([]);
const patientTreatments = ref([]);
const patientCurrentMedicalConditions = ref([]);
const patientMedicalHistory = ref([]);
const medicineName = ref('');
const medicalCondition = ref('Normala');
const id = ref(route.query.patientId);
const latestAppointment = ref(null);
const appointmentComment = ref('');

const isLoading = ref(false);

const notFoundError = ref(false);
if (route.query.patientId) {
    try {
        const data = await getPatientById(id.value);
        patientName.value = data.fullName;
        patientEmail.value = data.email;
        patientTendency.value = data.tendency;
    } catch(error) {
        notFoundError.value = true;
    } 
}

async function getPatientDetails() {
    try {
            latestAppointment.value = await getMostRecentOfPatientAppointments(patientEmail.value);
        } catch(error) {
            if(error.message === 'No appointments') {
                latestAppointment.value = 'Pacientul nu are programari';
            } else if(error.message === 'No past appointments') {
                latestAppointment.value = 'Doar programari viitoare';
            }
        }

        let medcond = await getAllMedicalConditions(patientEmail.value);
        let current = await getCurrentMedicalConditions(patientEmail.value);
        patientMedicalHistory.value = medcond.map(m => m);
        patientCurrentMedicalConditions.value = current.map(m => m);

       if(patientTendency.value === 'Hypertension') {
          medicalCondition.value = "Hipertensiune";
       } else if(patientTendency.value === 'Hypotension') {
          medicalCondition.value = "Hipotensiune";
       } 

       console.log(medicalCondition.value);
       if(medicalCondition.value === "Hipertensiune" || medicalCondition.value === "Hipotensiune") {
            let treatments = await getTreatmentsForCondition(patientEmail.value, medicalCondition.value, null, null);
            patientTreatments.value = treatments.map(t => t);
       }

       let appointments = await getPatientAppointmentsInTime(patientEmail.value, null, null);
       patientAppointments.value = appointments.map(a => a);

       fetchBloodPressures();
}
onMounted(async () => {
    getPatientDetails();
});

setInterval(getPatientDetails, 30000);

const treatmentHistory = ref(false);
const medicalHistory = ref(false);
const visitsHistory = ref(false);

const filteredTreatments = computed(() => {
    return patientTreatments.value.filter(treatment => 
        treatment.medicineName.toLowerCase().includes(medicineName.value.toLowerCase())
    );
});

const filteredAppointments = computed(() => {
    return patientAppointments.value.filter(appointment => 
        appointment.comment.toLowerCase().includes(appointmentComment.value.toLowerCase())
    );
});

const conditionStyles = computed(() => {
    return condition => {
        return {
            backgroundColor: condition.endingDate ? '#f8d7da' : '#d4edda'
        };
    };
});

const conditionAppointmentStyle = computed(() => {
    return a => {
        const currentDate = new Date();
        const appointmentDate = new Date(a.date);
        return {
            backgroundColor: appointmentDate < currentDate ? '#f8d7da' : '#d4edda'
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


const bloodPressures = ref([]);
const fromDate = ref(null);
const toDate = ref(null);

function filterBloodPressuresByDate({ fromDate: from, toDate: to }) {
    fromDate.value = from;
    toDate.value = to;

    fetchBloodPressures();
}

async function filterTreatmentsByDate({ fromDate: from, toDate: to }) {
    fromDate.value = from;
    toDate.value = to;
    let treatments = await getTreatmentsForCondition(patientEmail.value, medicalCondition.value, fromDate.value, toDate.value);
    patientTreatments.value = treatments.map(t => t);
    showMTreatmentHistory.value = true;
}

async function filterAppointmentsByDate({ fromDate: from, toDate: to }) {
    fromDate.value = from;
    toDate.value = to;
    let appointments = await getPatientAppointmentsInTime(patientEmail.value, fromDate.value, toDate.value);
    patientAppointments.value = appointments.map(t => t);
    showVisitsHistory.value = true;
}

async function fetchBloodPressures() {
    const data = await getBloodPressures(patientEmail.value, fromDate.value, toDate.value, 50, 0);

    if(data && data.content) {
        if(data.content.length !== 0) {
            bloodPressures.value = data.content.map(b => b);
        } else {
            bloodPressures.value = [];
        }
    } else {
        console.error("No content returned from the API");
    }
}

function redirectToAddTreatment() {
    router.push({
        name: "add-treatment",
        query: {
            patientId: id.value,
        },
    });
}

function redirectToUpdateTreatment(treatmentId) {
    router.push({
        name: "add-treatment",
        query: {
            patientId: id.value,
            updateId: treatmentId,
        },
    });
}

function redirectToCreateAppointment() {
    router.push({
        name: "create-appointment",
        query: {
            patientId: id.value,
        }
    });
}

const tendencyColor = computed(() => {
    switch(medicalCondition.value) {
        case 'Hipotensiune':
            return '#3399ff';
        case 'Hipertensiune':
            return 'red';
    }
});

const selectedCardId = ref(null);

function selectCard(cardId) {
    selectedCardId.value = cardId;
}

let confirmEndTreatment = () => {};

const confirmModalShow = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
function openConfirmModal(id) {
    confirmModalShow.value = true;
    confirmModalTitle.value = "Confirmare incheiere tratamentului";

    const tArray = patientTreatments.value.filter(t => t.id == id);
    const t = tArray[0];
    confirmModalMessage.value = "Doriti incheierea tratamentului: " + t.medicineName + " x " + t.doses + " pe zi";

    confirmEndTreatment = () => endSelectedTreatment(id);
}

async function endSelectedTreatment(id) {
    const data = await endTreatment(id);
    if(data === 200) {
        confirmModalShow.value = false;
        
        let treatments = await getTreatmentsForCondition(patientEmail.value, medicalCondition.value, null, null);
        patientTreatments.value = treatments.map(t => t);
    }
}

function closeDialog() {
    confirmModalShow.value = false;
}

</script>

<template>
    <div class="page" v-if="isAuthenticated && !notFoundError">
        <CustomNavbar />

        <div v-if="isLoading" class="loading-animation">
            <CustomLoader size="100" />
        </div>
        
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
                        <h2 v-if="medicalCondition !== 'Normala'" style="text-align: center;"> Pacientul {{ patientName }} sufera de <span :style="{ color: tendencyColor }"> {{ medicalCondition }} </span> </h2>
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
                        
                        <h3>Ultimul medicament adăugat:</h3>
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
                        <div v-if="medicalCondition !== 'Normala'">
                            <div class="header">
                                <h3>Istoric tratamente:</h3>
                                <CustomInput 
                                    v-model="medicineName"
                                    :type="'text'"
                                    name="medicineName"
                                    placeholder="cauta nume medicament"
                                />

                                <CustomButton class="add-button" @click="redirectToAddTreatment"> ADAUGA TRATAMENT </CustomButton>
                            </div>

                            <DateFiltering 
                                @filter-dates="filterTreatmentsByDate"
                            />

                            <div v-if="filteredTreatments.length !== 0">
                                <div v-for="treatment in filteredTreatments" :key="treatment.id" class="card" :style="conditionStyles(treatment)" @click="selectCard(treatment.id)">
                                    <p>Afectiune: {{ treatment.medicalConditionName }}</p>
                                    <p>Nume tratament: {{ treatment.medicineName }}</p>
                                    <p>Doza zilnica: {{ treatment.doses }}</p>
                                    <p>Data inceput: {{ convertDateOnly(treatment.startingDate) }}</p>
                                    <p>Data final: {{ treatment.endingDate != null ? convertDateOnly(treatment.endingDate) : 'nu e incheiat' }}</p>
                                    <p> Comentariu: {{ treatment.comment }}</p>
                                    <div v-if="selectedCardId === treatment.id && treatment.endingDate === null" class="buttons">
                                        <CustomButton  class="button-element" @click="redirectToUpdateTreatment(treatment.id)"> <i class="fas fa-pencil-alt"></i> </CustomButton>
                                        <CustomButton  class="button-element" @click="openConfirmModal(treatment.id)"> <i class="fas fa-times-circle"></i> </CustomButton>
                                    </div>
                                    <CustomModal
                                        :open="confirmModalShow"
                                        :forConfirmation="true"
                                        :title="confirmModalTitle"
                                        :message="confirmModalMessage"
                                        @cancel="closeDialog"
                                        @confirm="confirmEndTreatment"
                                    />
                                </div>
                            </div>
                            <div v-else>
                                <div v-if="medicineName !== ''">
                                    <p>Pacientul {{ patientName }} nu a avut tratamentul {{ medicineName }} prescris.</p>
                                </div>
                                <div v-else>
                                    <p>Pacientul {{ patientName }} nu are niciun tratament prescris </p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="not-found">
                            <p> Pacientul are tendinta Normala, e sanatos. </p>
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
                        <div class="header">
                                <h3>Istoric vizite:</h3>
                                <CustomInput 
                                    v-model="appointmentComment"
                                    :type="'text'"
                                    name="appointmentComment"
                                    placeholder="motiv - cuv. cheie"
                                />

                                <CustomButton class="add-button" @click="redirectToCreateAppointment"> CREEAZA PROGRAMARE </CustomButton>
                            </div>

                            <DateFiltering 
                                @filter-dates="filterAppointmentsByDate"
                            />
                        <div v-if="filteredAppointments.length !== 0">
                            <div v-for="appointment in filteredAppointments" :key="appointment.id" class="card" :style="conditionAppointmentStyle(appointment)">
                                <p>Tip vizită: {{ appointment.visitType }}</p>
                                <p>Motiv: {{ appointment.comment }}</p>
                                <p>Data: {{ convertDateToSuitableFormat(appointment.date) }}</p>
                            </div>
                        </div>
                        <div v-else>
                                <div v-if="appointmentComment !== ''">
                                    <p>Pacientul {{ patientName }} nu are nicio vizita din cauza {{ appointmentComment }} </p>
                                </div>
                                <div v-else>
                                    <p>Pacientul {{ patientName }} nu are niciun tratament prescris </p>
                                </div>
                            </div>
                    </div>
                </div>
                <div class="statistics-panel">
                    <StatisticsForOnePatient :patientEmail="patientEmail" />
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="!isAuthenticated && !notFoundError">
        <NotAuthenticatedView />
    </div>
    <div v-else-if="notFoundError">
        <NotFoundView />
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
    background-color: #dddddd;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.option-button {
    background-color: darkred;
    font-size: 14px;
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

.add-button {
    background-color: #f9cfcd;
    color: darkred;
    font-weight: bold;
    border: 2px solid rgb(236, 140, 140);
    border-radius: 10px;
    font-size: 13px;
    cursor: pointer;
    padding: 10px 20px;
    margin: 5px;
}

.add-button:hover {
    background-color: #ffe0df;
}

.main-content {
    display: flex;
    height: calc(100% - 70px);
}

.not-found {
    display: flex;
    justify-content: center;
    align-items: center; 
    height: 20%;
    text-align: center;
    font-size: 18px;
    color: green;
    font-weight: 600;
    font-family: Arial, Helvetica, sans-serif;
}


.details-section {
    width: 90%;
    padding: 20px;
    padding-top: 10px;
    overflow-y: auto;
    scrollbar-width: thin; 
    scrollbar-color: #c9c9c9 #ececec;
}

.statistics-panel {
    width: 100%;
    padding: 20px;
    background-color: #f0f0f0;
    overflow-y: auto;
    scrollbar-width: thin; 
    scrollbar-color: #c9c9c9 #ececec;
}

.card {
    position: relative;
    background-color: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    width: 80%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.buttons {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
}

.button-element {
    border-radius: 6px;
    border: 1px solid gray;
    color: darkred;
    background-color: white;
    height: 30px;
    width: 40px;
}

.button-element:hover {
    border: 2px solid darkred;
}
.card h2 {
    margin-top: 0;
    color: #d9534f;
}

.header {
    display: flex;
    align-items: center;
    flex-direction: row;
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

@media(max-width: 920px) {
    .header {
        flex-direction: column;
        gap: 3px;
        padding-bottom: 20px;
    }
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
        width: 90%;
        height: calc((100vh - 250px) / 2);
        overflow-y: auto;
        scrollbar-width: thin; 
        scrollbar-color: #c9c9c9 #ececec;
    }
}
</style>
