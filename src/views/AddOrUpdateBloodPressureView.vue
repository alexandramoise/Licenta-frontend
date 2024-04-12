<script setup>
import CustomNavbar from "@/components/CustomNavbar.vue";
import CustomInput from "@/components/CustomInput.vue";
import CustomButton from "@/components/CustomButton.vue";
import CustomModal from "../components/CustomModal.vue";
import { addBloodPressure, getBloodPressures } from "../services/bloodpressure_service.js";
import { ref } from 'vue';
import router from "@/router";

//const userEmail = sessionStorage.getItem("email");
const userEmail = "alexandramoise5@gmail.com"
const update = ref(false);

const systolicInput = ref('');
const diastolicInput = ref('');
const pulseInput = ref('');
const dateInput = ref('');

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

function handleInput(event) {
  const validCharacters = '0123456789';
  if (!validCharacters.includes(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
    event.preventDefault();
  }
}

async function add() {
    console.log(systolicInput.value, diastolicInput.value, pulseInput.value, dateInput.value);

    if (!systolicInput.value || !diastolicInput.value || !pulseInput.value || !dateInput.value) {
        //alert("Nu poți lăsa câmpuri necompletate.");
        modalShow.value = true;
        modalTitle.value = "Alerta";
        modalMessage.value = "Va rog sa completati campurile";
    } else {
        const dateFromInput = new Date(dateInput.value);
        const adjustedDate = dateFromInput.toISOString();

        try {
            const bloodPressureDto = {
                systolic: systolicInput.value,
                diastolic: diastolicInput.value,
                pulse: pulseInput.value,
                date: adjustedDate,
            };

            console.log("bloodPressureDTO: ", bloodPressureDto);
            const data = await addBloodPressure(bloodPressureDto, userEmail);
            modalShow.value = true;
            modalTitle.value = "Succes";
            modalMessage.value = "S-a salvat!";
            return data;
        } catch(error) {
            modalTitle.value = "Eroare";
            modalShow.value = true;
            if(error.message === "No patient account for this email address") {
                //alert("Nu exista un cont asociat adresei de mail ", userEmail);
                modalMessage.value = "Nu exista un cont asociat adresei de mail " + userEmail;
            } else if(error.message === "Invalid values for diastolic and/or systolic") {
                //alert("Valorile introduse sunt invalide, nu apartin unui interval");
                modalMessage.value = "Valorile introduse sunt invalide, nu apartin unui interval";
            } else if(error.message === "Date can not be in the future") {
                //alert("Nu puteti alege o data in viitor");
                modalMessage.value = "Nu puteti alege o data in viitor";
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
  <div class="page">
    <CustomNavbar />

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
        <CustomButton class="add-button" @click="add">Salveaza</CustomButton>
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
</template>

<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: #b80f20;
    overflow-y: auto;
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
