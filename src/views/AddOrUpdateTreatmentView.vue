<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, watch, computed } from 'vue';
import router from "@/router";
import CustomLoader from "../components/CustomLoader.vue";
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomButton from "../components/CustomButton.vue";
import CustomModal from "../components/CustomModal.vue";
import CustomInput from '@/components/CustomInput.vue';
import { getMedicinesForMedicalCondition } from "../services/medicine_service.js";
import { getPatientById } from '@/services/patient_service.js' 
import { addTreatment, getTreatmentById, updateTreatment } from '@/services/treatment_service.js'

import NotAuthenticatedView from './NotAuthenticatedView.vue';
import NotFoundView from './NotFoundView.vue';
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
    if(localStorage.getItem("role") !== "doctor") {
        notAllowed.value = true;
    }
});

const route = useRoute();

const patientMedicalCondition = ref('Normala')
const medicines = ref([]);

const selectedMedicine = ref('');
const dosesInput = ref(0);
const commentText = ref('');

async function getMedicines() {
    try {
        if(patientMedicalCondition.value !== 'Normala') {
            const data = await getMedicinesForMedicalCondition(patientMedicalCondition.value);
            if (data && data.length !== 0) {
                medicines.value = data.map(m => m);
            } else {
                console.log("No medicines found or empty content");
            }
        }
    } catch (error) {
        console.error("No content returned from the API or error occurred: ", error);
    }
}

const patientId = ref(route.query.patientId);
const notFoundError = ref(false);
try {
    const patientData = await getPatientById(patientId.value);
    const patientTendency = ref(patientData.tendency);
    if(patientTendency.value === "Hypotension") {
        patientMedicalCondition.value = "Hipotensiune";
    } else if(patientTendency.value === "Hypertension") {
        patientMedicalCondition.value = "Hipertensiune";
    }

    getMedicines();
} catch(error) {
    notFoundError.value = true;
}

const update = ref(false);
const initialValues = ref({
    selectedMedicine: '',
    dosesInput: 0,
    commentText: ''
});

if(route.query.updateId) {
    update.value = true;
    try {
        const treatment = await getTreatmentById(route.query.updateId);
        selectedMedicine.value = treatment.medicineName;
        dosesInput.value = treatment.doses;
        commentText.value = treatment.comment;

        initialValues.value = {
            selectedMedicine: treatment.medicineName,
            dosesInput: treatment.doses,
            commentText: treatment.comment
        };
    } catch(error) {
        notFoundError.value = true;
    }
}

function hasChanges() {
    return selectedMedicine.value !== initialValues.value.selectedMedicine ||
           dosesInput.value !== initialValues.value.dosesInput ||
           commentText.value !== initialValues.value.commentText;
}

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const isLoading = ref(false);
async function createOrUpdateTreatment() {
    if(selectedMedicine.value && dosesInput.value && commentText.value) {
        try {
            if(dosesInput.value > 5 || dosesInput.value < 1) {
                modalShow.value = true;
                modalTitle.value = "Problema";
                modalMessage.value = "Doza trebuie sa fie intre 1 si 5";
                return;
            }
            
            const treatmentDto = {
                patientId: route.query.patientId,
                medicalConditionName: patientMedicalCondition.value,
                medicineName: selectedMedicine.value,
                doses: dosesInput.value,
                comment: commentText.value,
            };

            const updateTreatmentDto = {
                medicineName: selectedMedicine.value,
                doses: dosesInput.value,
                comment: commentText.value,
            };

            isLoading.value = true;
            let data = ''
            if(update.value) {
                if(hasChanges) {
                    data = await updateTreatment(route.query.updateId, updateTreatmentDto);
                } else {
                    return;
                }
            } else {
                data = await addTreatment(treatmentDto);
            }

            isLoading.value = false;

            modalShow.value = true;
            modalTitle.value = "Succes";
            modalMessage.value = "S-a salvat!";

            return data;
        } catch(error) {
            console.error(error);
            isLoading.value = false;
            modalShow.value = true;
            modalTitle.value = "Eroare";
            if(error.message === "Patient already takes that medicine") {
                modalMessage.value = "Pacientul are deja prescris acest medicament, modificati-l pe acela.";
            } else if(error.message === "Patient does not have this medical condition") {
                modalMessage.value = "Pacientul nu sufera de " + !update.value ? treatmentDto.medicalConditionName : updateTreatmentDto.medicalConditionName;
            } else if(error.message === "This medicine does not work for that medical condition") {
                modalMessage.value = "Medicamentul " + !update.value ? treatmentDto.medicineName : updateTreatmentDto.medicineName; + " nu are efect pentru afectiunea " + !update.value ? treatmentDto.medicalConditionName : updateTreatmentDto.medicalConditionName;
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
        router.push({
            name: "patient-detailed",
            query: {
                patientId: route.query.patientId,
            },
        });
    }
}
</script>


<template>
    <div class="page" v-if="isAuthenticated && !notFoundError && !notAllowed">
        <CustomNavbar />
        <div v-if="patientMedicalCondition !== 'Normala'" class="form-container">
            <div class="form-content">
                <h1 class="form-title"> {{ !update ? "Tratament nou" : "Modifica tratament" }} </h1>
                
                <div class="input-row">
                    <div class="input-wrapper">
                        <label for="medicineSelect" class="form-label">Medicament</label>
                        <select id="medicineSelect" name="patientSelect" v-model="selectedMedicine" class="custom-input" :disabled="update">
                        <option v-for="medicine in medicines" :key="medicine" :value="medicine">
                            {{ medicine }}
                        </option>
                    </select>
                    </div>
                    <div class="input-wrapper">
                        <label for="visitTypeSelect" class="form-label"> Doza zilnica </label>
                        <CustomInput 
                            v-model="dosesInput"
                            :type="'number'"
                            name="doses"
                            min="1"
                            max="5"
                            step="1"
                            class="custom-input"
                        />
                    </div>
                </div>
                
                <div class="input-row full-width">
                    <label for="commentText" class="form-label"> Comentariu </label>
                    <textarea 
                        id="commentText"
                        v-model="commentText"
                        :maxlength="100"
                        class="custom-input textarea"
                    ></textarea>
                    <div class="char-counter">{{ commentText.length }}/100</div>
                </div>
                
                <CustomButton @click="createOrUpdateTreatment" class="submit-button">Gata</CustomButton>
                
                <div v-if="isLoading" class="loading-animation">
                    <CustomLoader size="100" />
                </div>
            </div>
        </div>
        <div v-else>
            <p> Tensiunea normala nu necesita tratament. </p>
        </div>
        
        <CustomModal
            :open="modalShow"
            :forConfirmation="false"
            :title="modalTitle"
            :message="modalMessage"
            @close="closeDialog"
        />
        
    </div>
    <div v-else-if="!isAuthenticated && !notFoundError && !notAllowed">
        <NotAuthenticatedView />
    </div>
    <div v-else="notFoundError && !notAllowed">
        <NotFoundView />
    </div>
    <div v-else="notAllowed">
        <NotAllowedView />
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
    height: 50px;
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