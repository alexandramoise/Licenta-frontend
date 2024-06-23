<script setup>
import { useRoute } from 'vue-router';
import router from "@/router";
import { ref, onMounted, watch, computed } from 'vue';
import CustomLoader from "../components/CustomLoader.vue";
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomButton from "../components/CustomButton.vue";
import CustomModal from "../components/CustomModal.vue";
import CustomInput from '@/components/CustomInput.vue';
import { getDoctorsPatients, getPatientById, getPatientByEmail } from "../services/patient_service.js";
import { createNewAppointment, getAppointmentById, updateAppointment } from "../services/appointments_service.js";
import NotAuthenticatedView from './NotAuthenticatedView.vue';
import NotFoundView from './NotFoundView.vue';

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


const isDoctor = ref(false);

const route = useRoute()
isDoctor.value = localStorage.getItem('role') === 'doctor'; 

const dateInput = ref('');

const visitTypeOptions = ['Rutina', 'Consultatie'];
const selectedVisitType = ref('');

const commentText = ref('');

let doctorEmail;
const selectedPatientEmail = ref('');

const update = ref(false);

const idFromUrl = ref(false);
const notFoundError = ref(false);
if(route.query.updateId) {
    try {
        const data = await getAppointmentById(route.query.updateId);
        selectedPatientEmail.value = data.patientEmail; // patient email from the appointment
        idFromUrl.value = true;
    } catch(error) {
        notFoundError.value = true;
    }
}

if(route.query.patientId) {
    try {
        const data = await getPatientById(route.query.patientId);
        selectedPatientEmail.value = data.email; // patient email from the appointment
        idFromUrl.value = true;
    } catch(error) {
        notFoundError.value = true;
    }
}

if(isDoctor.value) {
    doctorEmail = localStorage.getItem('user') // VA FI ADRESA DIN STORAGE
} else {
    selectedPatientEmail.value = localStorage.getItem('user') // VA FI ADRESA DIN STORAGE
    const patient = await getPatientByEmail(selectedPatientEmail.value);
    doctorEmail = patient.doctorEmailAddress;
}

const patients = ref([]);
const noPatients = ref(false);
async function getPatients() {
    if(isDoctor.value) {
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
}

onMounted(() => {
    getPatients();
});


const initialData = ref({ date: '', visitType: '', comment: '' });

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

        initialData.value = {
            date: dateInput.value,
            visitType: selectedVisitType.value,
            comment: commentText.value
        };

        console.log(initialData.value);
    }
});

const hasChanges = computed(() => {
    return (
        dateInput.value !== initialData.value.date ||
        selectedVisitType.value !== initialData.value.visitType ||
        commentText.value !== initialData.value.comment
    );
});

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const isLoading = ref(false);
async function createOrUpdateAppointment() {
    if(selectedVisitType.value && dateInput.value && commentText.value) {
        try {
            const dateFromInput = new Date(dateInput.value);
            const adjustedDate = dateFromInput.toISOString();

            const appointmentDto = {
                doctorEmail: doctorEmail,
                patientEmail: selectedPatientEmail.value,
                date: adjustedDate,
                visitType: selectedVisitType.value,
                comment: commentText.value,
            };

            console.log("appointmentDto: ", appointmentDto);

            console.log("are schimbari? ", hasChanges.value, "INITIAL: ", initialData.value, " COIMPLETT=A: ", appointmentDto);
            let data;
            if(update.value) {
                if(hasChanges.value) {
                    isLoading.value = true;
                    data = await updateAppointment(appointmentDto, route.query.updateId);
                    isLoading.value = false;
                    modalShow.value = true;
                    modalTitle.value = "Succes";
                    modalMessage.value = "S-a salvat!";
                    return data;
                } else {
                    modalShow.value = true;
                    modalTitle.value = "Nu sunt modificari";
                    modalMessage.value = "Nu ati modificat nimic.";
                }
            } else {
                isLoading.value = true;
                data = await createNewAppointment(appointmentDto);
                isLoading.value = false;
                modalShow.value = true;
                modalTitle.value = "Succes";
                modalMessage.value = "S-a salvat!";
                return data;
            }

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
    <div v-if="isLoading" class="loading-animation">
        <CustomLoader size="100" />
    </div>

    <div class="page" v-if="isAuthenticated && !notFoundError">
        <CustomNavbar />
        <div class="form-container">
            <div class="form-content">
                <h1 class="form-title"> {{ !update ? "Programare noua" : "Modifica programare" }} </h1>
                
                <div v-if="isDoctor" class="input-row full-width">
                    <label for="patientSelect" class="form-label">Pacient</label>
                    <select id="patientSelect" name="patientSelect" v-model="selectedPatientEmail" class="custom-input" :disabled="idFromUrl">
                        <option v-for="patient in patients" :key="patient.email" :value="patient.email">
                            {{ patient.fullName }}
                        </option>
                    </select>
                </div>
                
                <div class="input-row">
                    <div class="input-wrapper">
                        <label for="date" class="form-label">Data</label>
                        <CustomInput 
                            v-model="dateInput"
                            :type="'datetime-local'"
                            name="date"
                            class="custom-input"
                        />
                    </div>
                    <div class="input-wrapper">
                        <label for="visitTypeSelect" class="form-label">Tipul vizitei</label>
                        <select id="visitTypeSelect" v-model="selectedVisitType" class="custom-input">
                            <option v-for="opt in visitTypeOptions" :key="opt" :value="opt">
                                {{ opt }}
                            </option>
                        </select>
                    </div>
                </div>
                
                <div class="input-row full-width">
                    <label for="commentText" class="form-label">Motiv</label>
                    <textarea 
                        id="commentText"
                        v-model="commentText"
                        :maxlength="100"
                        class="custom-input textarea"
                    ></textarea>
                    <div class="char-counter">{{ commentText.length }}/100</div>
                </div>
                
                <CustomButton @click="createOrUpdateAppointment" class="submit-button">Gata</CustomButton>
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
    <div v-else-if="!isAuthenticated && !notFoundError">
        <NotAuthenticatedView />
    </div>
    <div v-else="notFoundError">
        <NotFoundView />
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
    margin: 50px auto;
    width: 100%;
    display: flex;
    justify-content: center;
}

.form-title {
    text-align: center;
    margin-bottom: 20px;
    color: #b80f20;
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

.input-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 600px;
    margin-bottom: 15px;
}

.input-row.full-width {
    flex-direction: column;
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

.textarea {
    resize: none;
    height: 80px;
}

.char-counter {
    font-size: 12px;
    color: #555;
    text-align: right;
    margin-top: 5px;
}

.submit-button {
    background-color: #b80f20;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    width: 100%; 
    max-width: 600px; 
    cursor: pointer;
}

@media (max-width: 600px) {
    .form-content {
        padding: 15px;
    }

    .input-row {
        flex-direction: column;
    }

    .input-wrapper {
        margin-right: 0;
        margin-bottom: 10px;
    }

    .submit-button {
        width: 100%;
    }
}
</style>