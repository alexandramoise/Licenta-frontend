<script setup>
import { useRoute } from 'vue-router';
import router from "@/router";
import { ref, onMounted, watch } from 'vue';
import CustomLoader from "../components/CustomLoader.vue";
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomButton from "../components/CustomButton.vue";
import CustomModal from "../components/CustomModal.vue";
import CustomInput from '@/components/CustomInput.vue';
import { getDoctorsPatients } from "../services/patient_service.js";
import { createNewAppointment, getAppointmentById, updateAppointment } from "../services/appointments_service.js";

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import NotAuthenticatedView from './NotAuthenticatedView.vue';

// checking whether or not the user is authenticated based on the token's existence
const token = localStorage.getItem("token");
console.log(token);
const isAuthenticated = ref(token !== null);
watch(() => localStorage.getItem("token"), (newToken) => {
  isAuthenticated.value = newToken !== null;
});


const isDoctor = ref(false);

const route = useRoute()
if(route.name === 'create-appointment') {
    isDoctor.value = true;
}

const dateInput = ref('');

const visitTypeOptions = ['Rutina', 'Consultatie'];
const selectedVisitType = ref('');

const commentText = ref('');

let doctorEmail;
const selectedPatientEmail = ref('');

const update = ref(false);

if(isDoctor.value) {
    doctorEmail = localStorage.getItem('user') // VA FI ADRESA DIN STORAGE
    //selectedPatientEmail.value = 'alexandramoise@gmail.com'; // VA FI ADRESA SELECTATA DE EL
} else {
    doctorEmail = 'alexandramoise636@gmail.com'; // VA FI ADRESA MEDICULUI PACIENTULUI 
    selectedPatientEmail.value = localStorage.getItem('user') // VA FI ADRESA DIN STORAGE
}

const patients = ref([]);
const noPatients = ref(false);
async function getPatients() {
    try {
        const data = await getDoctorsPatients(doctorEmail);
        if (data && data.length !== 0) {
            patients.value = data.map(patient => ({
                fullName: patient.fullName,
                email: patient.email
            }));
            
            noPatients.value = false;
        } else {
            console.log("No patients found or empty content");
            noPatients.value = true;
        }
    } catch (error) {
        console.error("No content returned from the API or error occurred: ", error);
    }
}

onMounted(() => {
    getPatients();
});

onMounted(async () => {
    if (route.query.updateId) {
        update.value = true;
        let id = route.query.updateId;
        const data = await getAppointmentById(id);
        selectedVisitType.value = data.visitType;
        commentText.value = data.comment;
        const newDate = new Date(data.date);
        newDate.setHours(newDate.getHours() + 3);
        dateInput.value = newDate.toISOString().slice(0,16);
    }
});

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const isLoading = ref(false);
async function createOrUpdateAppointment() {
    if(selectedVisitType.value && dateInput.value && commentText.value) {
        try {
            const appointmentDto = {
                doctorEmail: doctorEmail,
                patientEmail: selectedPatientEmail.value,
                date: dateInput.value,
                visitType: selectedVisitType.value,
                comment: commentText.value,
            };

            console.log("appointmentDto: ", appointmentDto);

            let data;
            if(update.value) {
                isLoading.value = true;
                data = await updateAppointment(appointmentDto, route.query.updateId);
                isLoading.value = false;
            } else {
                isLoading.value = true;
                data = await createNewAppointment(appointmentDto);
                isLoading.value = false;
            }

            modalShow.value = true;
            modalTitle.value = "Succes";
            modalMessage.value = "S-a salvat!";
            return data;
        } catch(error) {
            isLoading.value = false;
            modalShow.value = true;
            modalTitle.value = "Eroare";
            if(error.message === "Doctor is not available at that time") {
                modalMessage.value = "Doctorul nu este disponibil la data aleasa";
            } else if(error.message === "Date can not be in the past") {
                modalMessage.value = "Nu puteti alege o data in trecut";
            }
        }
    } else {
        modalShow.value = true;
        modalTitle.value = "Alerta";
        modalMessage.value = "Va rog sa completati campurile";
    }
}

function closeDialog() {
    modalShow.value = false;
    if(modalTitle.value === "Succes") {
        router.push("appointments");
    }
}
</script>

<template>
    <div class="page" v-if="isAuthenticated">
        <CustomNavbar />

        <div class="form-container">
         <div class="form-content">
                <div v-if="isDoctor">
                    <div v-if="! noPatients">
                        <label for="visitType" class="form-label"> Pacient </label>
                        <select id="visitType" name="visitType" v-model="selectedPatientEmail" class="custom-input">
                            <option v-for="patient in patients" :key="patient.email" :value="patient.email">
                                {{ patient.fullName }}
                            </option>
                        </select>
                    </div>
                    <div v-else>
                        <p> Nu aveti niciun pacient. </p>
                    </div>
                </div>
                <div class="inputs-row">
                <label for="date" class="form-label"> Data </label>
                <Datepicker v-model="dateInput"></Datepicker>
                </div>

                <div class="inputs-row">
                <label for="visitTypeSelect" class="form-label">Tipul vizitei</label>
                <select id="visitTypeSelect" v-model="selectedVisitType" class="custom-input">
                    <option v-for="opt in visitTypeOptions" :key="opt" :value="opt">
                    {{ opt }}
                    </option>
                </select>
                </div>

                <div class="inputs-row">
                    <label class="form-label"> Motiv </label>
                    <CustomInput 
                        v-model="commentText"
                        :placeholder="'motiv'"
                        :type="'text'"
                    />
                </div>

                <CustomButton @click="createOrUpdateAppointment" class="submit-button">Gata</CustomButton>

                <div v-if="isLoading" class="loading-animation">
                    <CustomLoader size="100" />
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
    background-color: #b80f20;
    overflow-y: hidden;
}

.form-container {
  margin-top: auto; /* Centrat vertical */
  margin-bottom: auto;
  width: 100%;
  display: flex;
  justify-content: center;
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

.form-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.inputs-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 600px; /* Ajustează la latimea dorită */
  margin-bottom: 15px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-right: 10px;
}

.input-wrapper:last-child {
  margin-right: 0;
}

.custom-input {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  margin-top: 5px;
}

.form-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.submit-button {
  background-color: #b80f20;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  width: 100%; /* Butonul va ocupa întreaga lățime a formularului */
  max-width: 600px; /* Ajustează la latimea dorită */
}
</style>