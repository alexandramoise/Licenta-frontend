<script setup>
import CustomNavbar from "@/components/CustomNavbar.vue";
import CustomInput from "@/components/CustomInput.vue";
import CustomButton from "@/components/CustomButton.vue";
import CustomModal from "../components/CustomModal.vue";
import CustomLoader from "@/components/CustomLoader.vue";
import { addBloodPressure, updateBloodPressure, getBloodPressureById } from "@/services/bloodpressure_service.js";
import { onMounted, ref, watch, computed} from 'vue';
import { useRoute  } from "vue-router";
import router from "@/router";

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
const isLoading = ref(false);
onMounted(() => {
    currentDate.value = new Date();
    token.value = localStorage.getItem("token");
    availableUntil.value = localStorage.getItem("availableUntil");
    if(localStorage.getItem("role") !== "patient") {
        notAllowed.value = true;
    }
});

const userEmail = localStorage.getItem('user');
const update = ref(false);

const systolicInput = ref('');
const diastolicInput = ref('');
const pulseInput = ref('');
const dateInput = ref('');

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

// function to allow only digits introduced in the inputs
function handleInput(event) {
  const validCharacters = '0123456789';
  if (!validCharacters.includes(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
    event.preventDefault();
  }
}

const route = useRoute();
const notFoundError = ref(false);

const initialValues = ref({
    systolic: 0,
    diastolic: 0,
    pulse: '',
    date: 0,
});

if (route.query.updateId) {
    update.value = true;
    let id = route.query.updateId;
    try {
        const data = await getBloodPressureById(id, userEmail);
        systolicInput.value = data.systolic;
        diastolicInput.value = data.diastolic;
        pulseInput.value = data.pulse;
        const newDate = new Date(data.date);
        newDate.setHours(newDate.getHours() + 3);
        dateInput.value = newDate.toISOString().slice(0,16);

        initialValues.value = {
            systolic: systolicInput.value,
            diastolic: diastolicInput.value,
            pulse: pulseInput.value,
            date: dateInput.value
        };
    } catch(error) {
        notFoundError.value = true;
    }
}

const hasChanges = computed(() => {
    return (
        systolicInput.value !== initialValues.value.systolic ||
        diastolicInput.value !== initialValues.value.diastolic ||
        pulseInput.value !== initialValues.value.pulse ||
        dateInput.value !== initialValues.value.date
    );
});

async function addOrUpdate() {
    console.log(systolicInput.value, diastolicInput.value, pulseInput.value, dateInput.value);

    if (!systolicInput.value || !diastolicInput.value || !pulseInput.value || !dateInput.value) {
        //alert("Nu poți lăsa câmpuri necompletate.");
        modalShow.value = true;
        modalTitle.value = "Alerta";
        modalMessage.value = "Va rog sa completati campurile";
    } else {
        const dateFromInput = new Date(dateInput.value);
        const adjustedDate = dateFromInput.toISOString();

        const selectedDateToCompare = new Date(adjustedDate);
        const currentDate = new Date();
    
        if(selectedDateToCompare > currentDate) {
            modalShow.value = true;
            modalTitle.value = "Problema";
            modalMessage.value = "Data selectata nu poate fi in viitor";
            return;
        }

        try {
            const bloodPressureDto = {
                systolic: systolicInput.value,
                diastolic: diastolicInput.value,
                pulse: pulseInput.value,
                date: adjustedDate,
            };

            console.log("bloodPressureDTO: ", bloodPressureDto);

            let data;
            if(route.query.updateId) {
                if(hasChanges.value) {
                    isLoading.value = true;
                    data = await updateBloodPressure(bloodPressureDto, route.query.updateId);
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
                data = await addBloodPressure(bloodPressureDto, userEmail);
                isLoading.value = false;
                modalShow.value = true;
                modalTitle.value = "Succes";
                modalMessage.value = "S-a salvat!";
                return data;
            }
            
            

        } catch(error) {
            isLoading.value = false;
            modalTitle.value = "Eroare";
            modalShow.value = true;
            if(error.message === "No patient account for this email address") {
                modalMessage.value = "Nu exista un cont asociat adresei de mail " + userEmail;
            } else if(error.message === "Invalid values for diastolic and/or systolic") {
                modalMessage.value = "Valorile introduse sunt invalide, nu apartin unui interval";
            } else if(error.message === "Uneditable!") {
                modalMessage.value = "Inregistrarea nu este editabila";
            } else if(error.message === "BP Not found") {
                modalMessage.value = "Inregistrarea nu exista";
            }
        }
    }
}

function closeDialog() {
    modalShow.value = false;
    if(modalTitle.value === "Succes") {
        setTimeout(() => {
        redirectToDashboard();
    }, 300);
    }
}

function redirectToDashboard() {
    router.push("main-patient");
}

</script>

<template>
  <div class="page" v-if="isAuthenticated && !notFoundError && !notAllowed">
    <CustomNavbar />

    <div v-if="isLoading" class="loading-animation">
        <CustomLoader size="100" />
    </div>

    <div class="form-container">
      <div class="add-form">
        <h1 class="form-title"> {{ !update ? "Adauga inregistrare" : "Modifica inregistrare" }} </h1>
            <div class="tension-inputs">
                <div class="input-wrapper">
                        <label for="systolic" class="form-label"> Sistolica </label>
                        <CustomInput 
                            v-model="systolicInput"
                            :placeholder="'ex. 120'"
                            :type="'number'"
                            name="systolic"
                            min="0"
                            max="200"
                            step="1"
                            class="custom-input"
                            @keydown="handleInput"
                        />
                    </div>
    
                    <div class="input-wrapper">
                        <label for="diastolic" class="form-label"> Diastolica </label>
                        <CustomInput 
                            v-model="diastolicInput"
                            :placeholder="'ex. 80'"
                            :type="'number'"
                            name="diastolic"
                            min="0"
                            max="180"
                            step="1"
                            class="custom-input"
                            @keydown="handleInput"
                        />
                    </div>

                    <div class="input-wrapper">
                        <label for="pulse" class="form-label"> Puls </label>
                        <CustomInput 
                            v-model="pulseInput"
                            :placeholder="'ex. 70'"
                            :type="'number'"
                            name="pulse"
                            min="0"
                            max="150"
                            step="1"
                            class="custom-input"
                            @keydown="handleInput"
                        />
                    </div>
                </div>
                <div class="input-wrapper date-input-wrapper">
                    <label for="date" class="form-label"> Data si ora </label>
                    <CustomInput 
                        v-model="dateInput"
                        :type="'datetime-local'"
                        name="date"
                        class="custom-input"
                    />
                </div>
        <CustomButton class="add-button" @click="addOrUpdate">Salveaza</CustomButton>
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
  <div v-else-if="!isAuthenticated && !notFoundError && !notAllowed">
        <NotAuthenticatedView />
  </div>
  <div v-else-if="notFoundError && !notAllowed">
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

.form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 400px;
    margin: 100px auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.add-form {
    width: 100%;
    align-items: center;
}

.tension-inputs,
.date-input {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px; 
}

.input-wrapper {
  flex: 1;
  margin: 0 10px;
}

.custom-input {
  width: 95%;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  margin-top: 5px;
}

.form-title {
  text-align: center;
  margin-bottom: 20px;
  color: #b80f20;
}

.add-button {
    width: 95%;
    padding: 10px 20px;
    border-radius: 8px;
    background: #b80f20;
    color: #fff;
    font-size: 18px;
    border: none;
    cursor: pointer;
    display: block;
    margin: 20px auto;
}

.form-label {
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
}
.date-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}


</style>
