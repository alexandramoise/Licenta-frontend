<script setup>
import { ref } from 'vue';
import CustomNavbar from '../components/CustomNavbar.vue';
import CustomInput from '../components/CustomInput.vue';
import CustomButton from '../components/CustomButton.vue';
import CustomModal from '../components/CustomModal.vue';
import { getDoctorByEmail, updateDoctorByEmail } from '../services/doctor_service.js';
import { getPatientByEmail, updatePatientByEmail } from '../services/patient_service.js';

const firstName = ref('');
const lastName = ref('');
const gender = ref('');
const dateOfBirth = ref('');
const userMedicalConditions = [];
const medicalConditions = ref(userMedicalConditions);

const genderOptions = [
    { label: 'Masculin', value: 'Masculine' },
    { label: 'Feminin', value: 'Feminine' },
    { label: 'Altul', value: 'Other' }
]; 

const medicalConditionOptions = [
    { label: 'Diabet tip 1', value: 'Diabet tip 1' },
    { label: 'Diabet tip 2', value: 'Diabet tip 2' },
    { label: 'Boli renale', value: 'Boli renale' },
    { label: 'Hipotiroidism', value: 'Hipotiroidism' },
    { label: 'Lupus', value: 'Lupus' },
    { label: 'Anemie', value: 'Anemie' },
    { label: 'Hipoglicemie', value: 'Hipoglicemie' },
    { label: 'Parkinson', value: 'Parkinson' }
];

const habits = [
    { label: 'Sedentarism', value: 'Sedentarism' },
    { label: 'Obezitate', value: 'Obezitate' },
    { label: 'Fumat', value: 'Fumat' },
    { label: 'Consum alcool', value: 'Consum de alcool' },
]

const userType = sessionStorage.getItem("gotIn");
// o sa il iau din session storage
let email;
let data;
if(userType === "doctor") {
    email = "alexandramoise636@gmail.com";
    data = await getDoctorByEmail(email);

    if(data.fullName !== null) {
        let name = data.fullName.split(' ');
        console.log(name);
        firstName.value = name[0];
        lastName.value = name[1];
    }

} else {
    email = "alexandramoise2@gmail.com";
    data = await getPatientByEmail(email);

    if(data.fullName !== null) {
        let name = data.fullName.split(' ');
        console.log(name);
        firstName.value = name[0];
        lastName.value = name[1];
    }

    if(data.gender !== null) {
        gender.value = genderOptions.find((option) => option.value === data.gender).value;
        console.log(data.gender, " am setat si in ", gender.value);
    }

    if(data.dateofBirth !== null) {
        dateOfBirth.value = data.dateofBirth.slice(0,10);
    }

    if(data.medicalConditions.length !== 0) {
        console.log(data.medicalConditions);
        medicalConditions.value = data.medicalConditions
                                .map(mc => mc.name)
                                .filter(name => 
                                    medicalConditionOptions.some(option => option.value === name) ||
                                    habits.some(habit => habit.value === name)
                                );
    }
}

function prepareMedicalConditionsForUpdate(selectedConditions) {
  const allConditions = [...medicalConditionOptions, ...habits]; // Combinați ambele liste de opțiuni
  return selectedConditions.map(conditionLabel => {
    const conditionOption = allConditions.find(option => option.label === conditionLabel);
    return conditionOption ? { name: conditionOption.value } : null;
  }).filter(Boolean); // Eliminați orice elemente care sunt nule sau nu sunt găsite
}


const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

async function saveChangesDoctor() {
    try {
        const doctorUpdateDto = {
            firstName: firstName.value,
            lastName: lastName.value,
        };

        console.log("DoctorUpdateDto: ", doctorUpdateDto);
        const data = await updateDoctorByEmail(doctorUpdateDto, email);
        modalShow.value = true;
        modalTitle.value = "Succes";
        modalMessage.value = "Modificarile s-au salvat";
        return data;

    } catch(error) {
        modalShow.value = true;
        modalTitle.value = "Eroare";
        modalMessage.value = error.message;
    }
}

async function saveChangesPatient() {
    try {
        const patientUpdateDto = {
            firstName: firstName.value,
            lastName: lastName.value,
            gender: gender.value,
            dateOfBirth: dateOfBirth.value,
            medicalConditions: prepareMedicalConditionsForUpdate(medicalConditions.value),
        };

        console.log("PatientUpdateDto: ", patientUpdateDto);
        const data = await updatePatientByEmail(patientUpdateDto, email);
        modalShow.value = true;
        modalTitle.value = "Succes";
        modalMessage.value = "Modificarile s-au salvat";
        return data;

    } catch(error) {
        modalShow.value = true;
        modalTitle.value = "Eroare";
        modalMessage.value = error.message;
    }
}

function closeDialog() {
    modalShow.value = false;
}
</script>

<template>
<div class="page">
    <CustomNavbar />
    <div v-if="userType === 'pacient'">
        <div class="card">
        <h2>Date personale</h2>
            <div class="input-row">
                
                <div class="input-container">
                    <label for="lastName"> <h3> Nume de familie </h3> </label>
                    <CustomInput id="lastName" v-model="lastName" placeholder="Nume de familie" type="text" />
                </div>
            
                <div class="input-container">
                    <label for="firstName"> <h3> Prenume </h3> </label>
                    <CustomInput id="firstName" v-model="firstName" placeholder="Prenume" type="text" />
                </div>
            </div>

            <div class="input-row">
                <div class="input-container">
                    <label> <h3> Gen </h3> </label>
                    <div class="radio-container">
                        <div v-for="option in genderOptions" :key="option.value">
                            <input 
                                type="radio" 
                                :id="option.value" 
                                :value="option.value" 
                                v-model="gender"
                            />
                            <label :for="option.value">{{ option.label }}</label>
                        </div>
                    </div>
                </div>
                
                <div class="input-container">
                    <label for="dateOfBirth"> <h3> Data nașterii </h3> </label>
                    <CustomInput id="dateOfBirth" v-model="dateOfBirth" type="date" />
                </div>
            </div>

            <h3>Afecțiuni</h3>
            <div class="conditions-grid">
            
                <div v-for="condition in medicalConditionOptions" :key="condition.value" class="checkbox-item">
                    <input 
                        type="checkbox" 
                        :id="condition.value" 
                        :value="condition.value" 
                        v-model="medicalConditions"
                    />
                    <label :for="condition.value">{{ condition.label }}</label>
                </div>
            </div>

            <h3>Obiceiuri</h3>
            <div class="habits-row">
            
                <div v-for="habit in habits" :key="habit.value" class="checkbox-item">
                    <input 
                        type="checkbox" 
                        :id="habit.value" 
                        :value="habit.value" 
                        v-model="medicalConditions"
                    />
                    <label :for="habit.value">{{ habit.label }}</label>
                </div>
            </div>

            
            <div class="button-container">
                <CustomButton @click="saveChangesPatient">Salvare</CustomButton>
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
        <div class="doctor-card">
            <h2>Date personale</h2>
                    <div class="input-container">
                        <label for="lastName"> <h3> Nume de familie </h3> </label>
                        <CustomInput id="lastName" v-model="lastName" placeholder="Nume de familie" type="text" />
                    </div>
                
                    <div class="input-container">
                        <label for="firstName"> <h3> Prenume </h3> </label>
                        <CustomInput id="firstName" v-model="firstName" placeholder="Prenume" type="text" />
                    </div>
                
                    <div class="button-container">
                        <CustomButton @click="saveChangesDoctor">Salvare</CustomButton>
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
</template>

<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: #b80f20;
    overflow-y: hidden;
}
.card {
    max-width: 600px;
    margin: auto; 
    padding: 20px; 
    background: #FFF; 
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px; 
    font-family: Arial, sans-serif; 
}

.input-row {
    display: grid;
    grid-template-columns: 50% 50%;
}

.doctor-card {
    max-width: 300px;
    margin: 50px auto; 
    padding: 20px;
    background: #FFF; 
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 
    border-radius: 8px; 
    font-family: Arial, sans-serif; 
}

.input-container {
    width: 90%; 
    display: flex;
    flex-direction: column;
    margin-bottom: 10px; 
}

.radio-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

.custom-input, .radio-buttons {
    width: 100%; 
    border: 1px solid #ccc; 
    border-radius: 4px; 
    padding: 8px; 
    margin-top: 5px; 
}

.conditions-grid,
.habits-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr); 
    gap: 10px; 
    margin-bottom: 20px;
}

.checkbox-item {
    display: flex;
    align-items: center; 
}

.button-container {
    display: flex;
    justify-content: center; 
    margin-top: 20px; 
}

button {
    width: 95%;
    padding: 10px 20px;
    border-radius: 8px;
    background: #b80f20;
    color: #fff;
    font-size: 17px;
    border: none;
    cursor: pointer;
    display: block;
    margin: 20px auto;
}

button:hover {
    background-color: #930c1a; 
}

h2 {
    color: #b80f20;
    text-align: center;
    margin-bottom: 30px;
}

h3 {
    color: #333; 
    margin-bottom: 10px;
}

input[type='radio']:checked,
input[type='checkbox']:checked {
  accent-color: #b80f20; 
}

/* Stilurile de bază, valabile pentru desktop */
/* ... (stilurile tale actuale) ... */

/* Stiluri pentru ecrane mici (telefoane) */
@media (max-width: 768px) {
  .page {
    overflow-y: auto; /* permite derularea pe ecrane mici */
  }

  .card, .doctor-card {
    margin: 20px; /* mai puțin spațiu în jurul cardurilor */
    width: auto; /* se extinde să se potrivească cu spațiul disponibil */
  }

  .input-row {
    grid-template-columns: 1fr; /* stivuiește input-urile vertical */
  }

  .conditions-grid, .habits-row {
    grid-template-columns: 1fr 1fr; /* 2 coloane pentru afecțiuni și obiceiuri */
  }

  .radio-container, .checkbox-item {
    flex-direction: column; /* stivuiește radio buttons și checkboxes vertical */
    align-items: start; /* aliniază la start pentru a nu se întinde pe tot ecranul */
  }

  button {
    width: calc(100% - 40px); /* ajustează lățimea butonului la padding */
  }

  .checkbox-item, .radio-container {
    flex-direction: row; /* schimbați înapoi la row pentru a avea eticheta alături */
    align-items: center; /* centrați elementele pe verticală */
  }

  .checkbox-item input, .radio-container input {
    margin-right: 10px; /* spațiu între caseta de selectat și etichetă, dacă este necesar */
  }

  .checkbox-item label, .radio-container label {
    margin: 0; /* Eliminați marginile dacă sunt setate */
    white-space: nowrap; /* asigurați-vă că textul nu trece la linia următoare */
  }
  
  /* Ajustați lățimea containerelor de input pentru a se potrivi cu noua structură */
  .input-container, .conditions-grid, .habits-row {
    width: 100%; /* utilizarea completă a lățimii disponibile */
  }
}

</style>