<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, watch, computed } from 'vue';
import router from "@/router";
import CustomNavbar from "../components/CustomNavbar.vue";
import NotAuthenticatedView from './NotAuthenticatedView.vue';
import CustomCalendar from '@/components/CustomCalendar.vue';
import CustomModal from '@/components/CustomModal.vue';

import { getPatientByEmail } from '@/services/patient_service.js';
import { getCurrentTreatmentsForMedicalCondition, getTreatmentById } from '@/services/treatment_service.js';
import { getTreatmentTakingsOfADay } from '@/services/treatment_taking_service.js';

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

const patientEmail = ref(localStorage.getItem('user'));
const patientName = ref('');
const patientTendency = ref('Normala');
const medicalCondition = ref('');
const patientTreatments = ref([]);
const treatmentDoses = ref(0);
const treatmentAdministrations = ref([]);
const selectedDate = ref(null);

// used to convert todays date to yyyy-mm-dd format
function formatDate(date) {
  if (!date) return '';
  let month = '' + (date.getMonth() + 1),
      day = '' + date.getDate(),
      year = date.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

onMounted(async () => {
    const patientData = await getPatientByEmail(patientEmail.value);
    patientName.value = patientData.fullName;
    patientTendency.value = patientData.tendency;
    medicalCondition.value = patientTendency.value === 'Hypertension' ? 'Hipertensiune' : patientTendency.value === 'Hypotension' ? 'Hipotensiune' : '';

    if (medicalCondition.value) {
        const treatments = await getCurrentTreatmentsForMedicalCondition(patientEmail.value, medicalCondition.value, null, null);
        patientTreatments.value = treatments;
        if (patientTreatments.value.length > 0) {
            selectCard(patientTreatments.value[0].id);
        }
    }

    // clearing selection date = getting current date
    if(selectedDate.value == null) {
        selectedDate.value = formatDate(new Date());
    }

});

function convertDateOnly(originalDate) {
    const date = new Date(originalDate);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('ro-RO', options);
}

async function selectCard(cardId) {
    const selectedTreatment = await getTreatmentById(cardId);
    treatmentDoses.value = selectedTreatment.doses;

    // clearing selection date = getting current date
    if(selectedDate.value == null) {
        selectedDate.value = formatDate(new Date());
    }

    treatmentAdministrations.value = await getTreatmentTakingsOfADay(cardId, patientEmail.value, selectedDate.value);
}

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

function getDateFromCalendar(date) {
    const selectedDateToCompare = new Date(date);
    const currentDate = new Date();
    
    if(selectedDateToCompare > currentDate) {
        modalShow.value = true;
        modalTitle.value = "Problema";
        modalMessage.value = "Data selectata nu poate fi in viitor";
        return;
    } else {
        selectedDate.value = date;
        if (patientTreatments.value.length > 0) {
            selectCard(patientTreatments.value[0].id);
        }
    }
}

function closeDialog() {
    modalShow.value = false;
}


function range(start, end) {
      return Array(end - start + 1).fill().map((_, idx) => start + idx)
}
</script>

<template>
    <div class="page" v-if="isAuthenticated">
        <CustomNavbar />
        <div class="content">
            <div v-if="patientTreatments.length === 0" class="no-treatments">
                <p> Nu aveti tratamente adaugate de catre medic. </p>
            </div>
                <div class="calendar-section">
                    <div class="calendar-container">
                        <CustomCalendar @selectedDate="getDateFromCalendar" />
                    </div>
                </div>
                <div class="treatment-administration">
                    <p>ADMINISTRARI PENTRU DATA DE: {{ convertDateOnly(selectedDate) }}</p>
                    <p>{{ treatmentDoses }}</p>
                    <li v-for="admin in treatmentAdministrations" :key="admin.id">{{ admin }}</li>
                        <li v-for="i in range(treatmentAdministrations.length + 1, treatmentDoses)" :key="'add-dose-' + i">
                            <button @click="addingDose = i">Adauga doza {{ i }}</button>
                            <div v-if="addingDose === i">
                                <input type="time" v-model="time" @change="addDose(time)" />
                            </div>
                        </li>
                </div>
                <div class="treatments-container">
                    <div v-for="treatment in patientTreatments" :key="treatment.id" class="card" @click="selectCard(treatment.id)">
                        <p>Nume tratament: {{ treatment.medicineName }}</p>
                        <p>Doza zilnica: {{ treatment.doses }}</p>
                        <p>Data inceput: {{ convertDateOnly(treatment.startingDate) }}</p>
                        <p>Comentariu: {{ treatment.comment }}</p>
                    </div>
                </div>
        </div>

        <CustomModal
            :open="modalShow"
            :forConfirmation="false"
            :title="modalTitle"
            :message="modalMessage"
            @close="closeDialog"
        />
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
    grid-template-columns: 35% 35% 30%;
    height: 100%;
}

.calendar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgb(244, 244, 244)
}

.calendar-container {
    width: 95%;
    max-width: 600px;
    margin: auto; 
    height: auto; 
}

.treatments-container {
    display: flex;
    flex-direction: column;
    padding: 15px;
}

.treatment-administration ul {
    list-style: none;
    padding: 0;
}

.treatment-administration li {
    margin-bottom: 10px;
}

.admin-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.add-dose {
    margin-top: 10px;
}

.treatments-container {
    display: flex;
    flex-direction: column;
    padding: 15px;
}

.card {
    position: relative;
    background-color: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 10px;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s;
}

.card p {
    margin: 5px 0;
}
</style>
