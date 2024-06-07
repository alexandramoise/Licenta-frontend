<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import CustomNavbar from '../components/CustomNavbar.vue';
import CustomInput from '../components/CustomInput.vue';
import CustomButton from '../components/CustomButton.vue';
import CustomModal from '../components/CustomModal.vue';
import { getDoctorByEmail, updateDoctorByEmail } from '../services/doctor_service.js';
import { getPatientByEmail, updatePatientByEmail } from '../services/patient_service.js';
import { getCurrentMedicalConditions } from '@/services/medical_condition_service.js';
import NotAuthenticatedView from './NotAuthenticatedView.vue';
import router from '@/router';

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
    { label: 'Consum alcool', value: 'Consum alcool' },
]

const userType = localStorage.getItem('role');
let email = localStorage.getItem('user');
let data;

const patientMedicalConditions = ref([]);

if(userType === "doctor") {
    data = await getDoctorByEmail(email);

    if(data.fullName !== null) {
        let name = data.fullName.split(' ');
        console.log(name);
        firstName.value = name[0];
        lastName.value = name[1];
    }

} else if(userType === "patient") {
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

    let medcond = await getCurrentMedicalConditions(email);
    patientMedicalConditions.value = medcond.map(m => m.name);

    if (medcond.length !== 0) {
        medicalConditions.value = medcond
            .filter(mc => 
                (medicalConditionOptions.some(option => option.value === mc.name) ||
                habits.some(habit => habit.value === mc.name)) && 
                (mc.endingDate == null || mc.endingDate === "")
            )
            .map(mc => mc.name);
}

    
}

function prepareMedicalConditionsForUpdate(selectedConditions, initialMedicalConditions) {
  const allConditions = [...medicalConditionOptions, ...habits]; // combin afectiuni + obiceiuri pentru toate

  const currentDate = new Date().toISOString();

  const conditionsToUpdate = allConditions.map(option => {
    const isSelectedNow = selectedConditions.includes(option.label);
    const wasSelectedBefore = initialMedicalConditions.includes(option.label);

    if (isSelectedNow && !wasSelectedBefore) {
      // console.log("selectat ", option.label)
      return { name: option.value, startingDate: currentDate };
    } else if (!isSelectedNow && wasSelectedBefore) {
      // console.log("deselectat ", option.label)
      return { name: option.value, endingDate: currentDate };
    }
    return null; 
  }).filter(Boolean); // sterg elementele null sau neschimbate
  
  return conditionsToUpdate;
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
            medicalConditions: prepareMedicalConditionsForUpdate(medicalConditions.value, patientMedicalConditions.value),
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
    let route = "main-" + userType;
    router.push(route);
}
</script>

<template>
<div class="page" v-if="isAuthenticated">
    <CustomNavbar />
    <div v-if="userType === 'patient'">
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


@media (max-width: 768px) {
  .page {
    overflow-y: auto;
    scrollbar-width: thin; 
    scrollbar-color: #c9c9c9 #ececec; 
  }

  .card, .doctor-card {
    margin: 20px; 
    width: auto; 
  }

  .input-row {
    grid-template-columns: 1fr; 
  }

  .conditions-grid, .habits-row {
    grid-template-columns: 1fr 1fr; 
  }

  .radio-container, .checkbox-item {
    flex-direction: column;
    align-items: start; 
  }

  button {
    width: calc(100% - 40px); 
  }

  .checkbox-item, .radio-container {
    flex-direction: row; 
    align-items: center;
  }

  .checkbox-item input, .radio-container input {
    margin-right: 10px; 
  }

  .checkbox-item label, .radio-container label {
    margin: 0; 
    white-space: nowrap; 
  }
  
  
  .input-container, .conditions-grid, .habits-row {
    width: 100%; 
  }
}

</style>