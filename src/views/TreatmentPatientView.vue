<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomCalendar from '@/components/CustomCalendar.vue';
import CustomModal from '@/components/CustomModal.vue';
import CustomInput from '@/components/CustomInput.vue';
import CustomLoader from '@/components/CustomLoader.vue';
import CustomButton from '@/components/CustomButton.vue';

import { getPatientByEmail } from '@/services/patient_service.js';
import { getCurrentTreatmentsForMedicalCondition, getTreatmentById } from '@/services/treatment_service.js';
import { getTreatmentTakingsOfADay, addTreatmentAdministration } from '@/services/treatment_taking_service.js';


import NotAuthenticatedView from './NotAuthenticatedView.vue';
import NotAllowedView from "./NotAllowedView.vue";

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

const notAllowed = ref(false);
onMounted(() => {
    currentDate.value = new Date();
    token.value = localStorage.getItem("token");
    availableUntil.value = localStorage.getItem("availableUntil");
    if(localStorage.getItem("role") !== "patient") {
        notAllowed.value = true;
    }
});

const patientEmail = ref(localStorage.getItem('user'));
const patientName = ref('');
const patientTendency = ref('Normala');
const medicalCondition = ref('');
const patientTreatments = ref([]);
const medicineName = ref('');
const treatmentId = ref(null);
const treatmentDoses = ref(0);
const treatmentAdministrations = ref([]);

const selectedDate = ref(null);
const selectedTime = ref([]);

const isLoading = ref(false);
const treatmentsFound = ref(false);

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
        isLoading.value = true;
        const treatments = await getCurrentTreatmentsForMedicalCondition(patientEmail.value, medicalCondition.value, null, null);
        patientTreatments.value = treatments;
        if (patientTreatments.value.length > 0) {
            treatmentsFound.value = true;
            selectCard(patientTreatments.value[0].id);
        }

        isLoading.value = false;
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
    isLoading.value = true;
    const selectedTreatment = await getTreatmentById(cardId);
    isLoading.value = false;
    treatmentId.value = cardId;
    treatmentDoses.value = selectedTreatment.doses;
    medicineName.value = selectedTreatment.medicineName;

    // clearing selection date = getting current date
    if(selectedDate.value == null) {
        selectedDate.value = formatDate(new Date());
    }

    isLoading.value = true;
    treatmentAdministrations.value = await getTreatmentTakingsOfADay(cardId, patientEmail.value, selectedDate.value);
    isLoading.value = false;
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
            selectCard(treatmentId.value);
        }
    }
}

function handleTimeChange(event, index) {
    selectedTime.value[index] = event.target.value;
    console.log(selectedTime.value);
}

async function addTreatmentAdmin(index) {
    if(selectedTime.value[index] == undefined || selectedTime.value[index] == null) {
        modalShow.value = true;
        modalTitle.value = "Problema";
        modalMessage.value = "Va rog selectati o ora inainte de apasarea butonului";
        return;
    }

    const selectedDateToCompare = new Date(selectedDate.value);
    const currentDate = new Date();

    let [selectedHour, selectedMinute] = selectedTime.value[index].split(':').map(Number);
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    if (selectedDateToCompare.toDateString() === currentDate.toDateString() 
        && (selectedHour > currentHour || (selectedHour === currentHour && selectedMinute > currentMinute))) {
        modalShow.value = true;
        modalTitle.value = "Problema";
        modalMessage.value = "Ora selectata nu poate fi in viitor";
        return;
    } 

    selectedHour -= 3;
    if (selectedHour < 0) {
        selectedHour += 24;
    }
    const adjustedTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

    const administrationTime = `${selectedDate.value}T${adjustedTime}:00`;
    console.log(administrationTime);

    const treatmentAdministrationDto = {
        treatmentId: treatmentId.value, 
        patientEmail: patientEmail.value,
        administrationDate: administrationTime
    }

    try {
        await addTreatmentAdministration(treatmentAdministrationDto);
    } catch(error) {
        if(error.message === "Treatment not started yet") {
            modalShow.value = true;
            modalTitle.value = "Problema";
            modalMessage.value = "Tratamentul nu era inceput la data " + convertDateOnly(administrationTime.substring(0,10));
        }
    }
    

    selectCard(treatmentId.value);
}

function closeDialog() {
    modalShow.value = false;
}

function range(start, end) {
      return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function convertTime(adminTime) {
      const date = new Date(adminTime);
      const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit' };
      return `${date.toLocaleTimeString('ro-RO', optionsTime)}`;
}

function getDayMoment(time) {
    switch (true) {
        case (time >= 5 && time < 12):
            return "Dimineața";
        case (time >= 12 && time < 17):
            return "Prânz";
        case (time >= 17 && time < 22):
            return "Seara";
        default:
            return "Noaptea";
    }
}

</script>

<template>
    <div class="page" v-if="isAuthenticated && !notAllowed">
        <CustomNavbar />

        <div v-if="isLoading" class="loading-animation">
            <CustomLoader size="100" />
        </div>

        <div class="content" v-if="treatmentsFound">
                <div class="calendar-section">
                    <div class="calendar-container">
                        <CustomCalendar @selectedDate="getDateFromCalendar" />
                    </div>
                </div>
                <div class="treatment-details">
                    <div class="treatment-administration">
                        <div class="treatment-administration-content">
                            <p class="title"> Administrări medicament <span> {{ medicineName.toUpperCase() }} </span> în data de: <span> {{ convertDateOnly(selectedDate) }} </span> </p>
                            <p class="text">Doza zilnica <span style="color: rgb(3, 60, 130);"> prescrisa: </span> <span> {{ treatmentDoses }} </span> buc. pe zi </p>
                            <p class="text"> Doze <span style="color: rgb(1, 110, 45);"> administrate: </span> <span> {{ treatmentAdministrations.length }} </span> </p>
                            <ul>
                                <li v-for="admin in treatmentAdministrations" :key="admin.id" class="admin-item"> {{ getDayMoment(convertTime(admin.administrationDate).substring(0,2)) }} la ora {{ convertTime(admin.administrationDate) }}</li>
                            </ul>
                            <div class="dose-buttons-container">
                            <ul class="dose-buttons" v-if="treatmentAdministrations.length < treatmentDoses">
                                <li v-for="i in range(treatmentAdministrations.length + 1, treatmentDoses)" :key="'add-dose-' + i" class="dose-item">
                                    <label for="time-input">Alegeti o ora</label>
                                    <CustomInput id="time-input" :type="'time'" @input="event => handleTimeChange(event, i)" />
                                    <CustomButton @click="addTreatmentAdmin(i)" class="add-dose-button">Adauga doza {{ i }} </CustomButton>
                                </li>
                            </ul>
                            </div>
                        </div>
                    </div>
                    <div class="treatments-container">
                        <div class="treatments-container-content">
                            <p class="medical-condition-title"> Tratament curent {{ medicalCondition }}</p>
                            <div v-for="treatment in patientTreatments" :key="treatment.id" class="card" @click="selectCard(treatment.id)">
                                <div class="card-header">
                                    <h3>{{ treatment.medicineName }}</h3>
                                </div>
                                <div class="card-body">
                                    <p><strong>Doza zilnică:</strong> {{ treatment.doses }} buc.</p>
                                    <p><strong>Data început:</strong> {{ convertDateOnly(treatment.startingDate) }}</p>
                                    <p><strong>Comentariu:</strong> {{ treatment.comment }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        <div v-else class="not-found">
            <p> Nu aveti tratamente adăugate de către medic. </p>
        </div>

        <CustomModal
            :open="modalShow"
            :forConfirmation="false"
            :title="modalTitle"
            :message="modalMessage"
            @close="closeDialog"
        />
    </div>
    <div v-else-if="!isAuthenticated && !notAllowed">
        <NotAuthenticatedView />
    </div>
    <div v-else="notAllowed">
        <NotAllowedView />
   </div>
</template>

<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: rgb(255, 255, 255);
    overflow-y: hidden;
    overflow-x: hidden;
}

.content {
    display: grid;
    grid-template-columns: 40% 60%;
    height: 100%;
}

.treatment-details {
    display: grid;
    grid-template-columns: 50% 50%;
    height: 100%;
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
    background-color: rgb(240, 240, 240);
}

.treatment-administration {
    padding: 20px;
    background-color: rgb(249, 249, 249);
    overflow-y: auto;
}

.treatment-administration-content,
.treatments-container-content {
    margin: 120px auto;
    overflow-y: auto;
    overflow-x: hidden;
}

.treatment-administration-content {
    text-align: center;
}

.title,
.text {
    font-family: Arial, Helvetica, sans-serif;
    margin-bottom: 10px;
}

.title { 
    font-size: 18px;
}

.text {
    font-size: 16px;
}

.title span {
    color: #a90e0e;
    font-weight: bold;
}

.text span {
    color: #a90e0e;
    font-weight: bold;
}

.treatment-administration ul {
    list-style: none;
    padding: 0;
}

.treatment-administration li {
    margin-bottom: 10px;
}

.admin-item {
    background: #e5e5e5c6;
    font-size: 17px;
    margin: 5px 0;
    padding: 10px;
    border-radius: 5px;
    width: 90%;
}

.dose-buttons-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.dose-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
}

.dose-item {
    margin: 10px;
    text-align: center;
}

.dose-item:last-child:nth-child(odd){
    margin: auto;
}

.dose-item label {
    display: block;
    margin-bottom: 5px;
    color: #333;
    font-weight: bold;
}

.add-dose-button {
    width: 60%;
    height: 5vh;
    margin-top: 5px;
    background-color: #a90e0e;
    color: white;
    border: none;
    padding: 5px;
    border-radius: 8px;
    cursor: pointer;
}

.add-dose-button:hover {
    background-color: #850b0b;
}

.card {
    position: relative;
    background-color: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 10px;
    width: 80%;
    cursor: pointer;
    border: 1px solid #818181;
}

.card-header {
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
}

.card-header h3 {
  font-size: 18px;
  color: #a90e0e;
  margin: 0;
}

.card-body p {
  margin: 5px 0;
  font-size: 16px;
}

.card-body p strong {
  color: #333;
}

.medical-condition-title {
    font-size: 18px; 
    text-align: center;
    font-family: Georgia, serif;
    font-weight: bold;
}

@media (min-height: 450px) and (max-width: 700px) {
    .content {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 50% 50%;
    }
    .dose-item {
        flex: 1 0 100%;
        margin-right: 0;
    }

    .calendar-container {
        width: 80%; 
        max-width: none; 
        margin: 0; 
        height: auto;
    }

    .treatment-administration-content,
    .treatments-container-content {
        margin: 120px auto;
    }

    .treatment-details {
        display: grid;
        grid-template-columns: 50% 50%;
        overflow-y: auto;
    }

    .treatment-administration-content,
    .treatments-container-content {
        margin: 1vh;
        font-size: 14px;
        margin-bottom: 40px;
    }

    .card {
        width: 25vw;
        margin: 10px auto;
        font-size: 15px;
    }

    .add-dose-button {
        height: 6vh;
    }

    .dose-item { 
        margin: auto;
    }
}

@media(max-height: 450px) {
    .calendar-container {
        margin-top: 5vh;
    }

    .treatment-details {
        overflow-y: auto;
    }

    .treatment-administration-content,
    .treatments-container-content {
        margin: 1vh;
        font-size: 14px;
        margin-bottom: 40px;
    }

    .card {
        width: 18vw;
        margin: 10px auto;
        font-size: 15px;
    }

    .add-dose-button {
        height: 10vh;
    }

    .dose-item { 
        margin: auto;
    }
}

</style>
