<script setup>
import {ref, watch} from 'vue';
import router from "../router";
import CustomInput from '@/components/CustomInput.vue';
import CustomModal from '@/components/CustomModal.vue';
import { changePasswordPatient, getPatientByEmail } from '@/services/patient_service.js';
import { changePasswordDoctor, getDoctorByEmail } from '@/services/doctor_service.js';
import { useRoute } from 'vue-router';

const emailText = ref('');
const passwordText = ref('');
const newPasswordText = ref('');
const confirmNewPasswordText = ref('');

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

// validating new password
const showErrorMessageForPassword = ref(false);
const errorMessage = ref('');
watch(newPasswordText, (newVal) => {
    const hasUpperCase = /[A-Z]/.test(newVal);
    const hasLowerCase = /[a-z]/.test(newVal);
    const hasSpecialChar = /[,._?]/.test(newVal);

    if(newVal.length < 8) {
        showErrorMessageForPassword.value = true;
        errorMessage.value = "Minim 8 caractere";
    }
    else if(!(hasUpperCase && hasLowerCase)) {
        showErrorMessageForPassword.value = true;
        errorMessage.value = "Atat majuscule cat si litere mici";
    } 
    else if(!hasSpecialChar) {
        showErrorMessageForPassword.value = true;
        errorMessage.value = "Si caractere speciale , . _ ? ";
    } else {
        showErrorMessageForPassword.value = false;
    }
});

// using it to make a difference between doctor and patient without having the role after authentication
// this will be the link sent in the email after creating an account / requesting a new password
const route = useRoute();
let userType;
if(route.query.for === 'p') {
    userType = 'patient';
} else if(route.query.for === 'd') {
    userType = 'doctor';
}

async function saveChanges() {
    if(emailText.value === '' || emailText.value === null 
    || passwordText.value === '' || passwordText.value === null
    || newPasswordText.value === '' || newPasswordText.value === null
    || confirmNewPasswordText.value === '' || confirmNewPasswordText.value === null) {
        modalShow.value = true;
        modalTitle.value = "Alerta";
        modalMessage.value = "Va rog sa completati campurile";
    } else {
        if(confirmNewPasswordText.value !== newPasswordText.value) {
            modalShow.value = true;
            modalTitle.value = "Eroare";
            modalMessage.value = "Parola si confirmarea ei nu coincid";
        } else {
            if(! showErrorMessageForPassword.value) {
                const changePasswordDto = {
                    email: emailText.value,
                    oldPassword: passwordText.value,
                    newPassword: newPasswordText.value
                };

                modalShow.value = true;

                let response;
                if(userType === 'patient'){
                    response = await changePasswordPatient(changePasswordDto);
                } else if(userType === 'doctor') {
                    response = await changePasswordDoctor(changePasswordDto);
                } 

                if(response === 200) {
                    modalTitle.value = "Succes";
                    modalMessage.value = "Veti fi redirectionat la pagina de login";
                } else if(response === 400) {
                    modalTitle.value = "Eroare";
                    modalMessage.value = "Credentiale incorecte";
                } else if(response === 404) {
                    modalTitle.value = "Eroare";
                    modalMessage.value = "Nu exista un cont asociat acestei adrese";
                }
            } 
        }
    }
}


const showOldPassword = ref(false);
const showNewPassword = ref(false);

function showOldPasswordToggle() {
    showOldPassword.value = !showOldPassword.value;
}

function showNewPasswordToggle() {
    showNewPassword.value = !showNewPassword.value;
}

function closeDialog() {
    modalShow.value = false;
    if(modalTitle.value === "Succes") {
        router.push("login");
    }
}

</script>

<template>
    <div class="page">
        <div class="login-container" :style="{ height: showErrorMessageForPassword ? '350px' : '320px'}">
            <h2>Schimbare parola</h2>
            <CustomInput 
                v-model="emailText"
                :placeholder="'adresa de mail'"
                :type="'text'"
           />
           <div class="password-field">
                <CustomInput 
                    v-model="passwordText"
                    :placeholder="'parola temporara'"
                    :type="showOldPassword ? 'text' : 'password'"
                />
                <button @click="showOldPasswordToggle" class="toggle-visibility">
                    <i :class="!showOldPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                </button>
            </div>
            <div class="password-field">
                <CustomInput 
                    v-model="newPasswordText"
                    :placeholder="'parola noua'"
                    :type="showNewPassword ? 'text' : 'password'"
                />
                <button @click="showNewPasswordToggle" class="toggle-visibility">
                    <i :class="!showNewPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                </button>
            </div>
            <div class="password-field">
                <CustomInput 
                    v-model="confirmNewPasswordText"
                    :placeholder="'confirmare parola noua'"
                    :type="showNewPassword ? 'text' : 'password'"
                />
                <button @click="showNewPasswordToggle" class="toggle-visibility">
                    <i :class="!showNewPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                </button>
            </div>

            <div v-show="showErrorMessageForPassword" class="error-message"> {{ errorMessage }}</div>
            <button @click="saveChanges" class="login-button" @keyup.enter="enterPress" d>Salvare</button>
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
    display: flex; 
    align-items: center;
    justify-content: center; 
    height: 100vh;
    width: 100vw;
    background-color: rgb(163, 2, 2);
}

.login-container {
    display: flex;
    flex-direction: column; 
    align-items: center; 
    background-color: white;
    width: 300px;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
}

.login-container > * {
    width: 100%; 
    margin: 10px 0; 
}

.login-container h2 {
    margin-bottom: 20px; 
    color: rgb(163, 2, 2);
    font-family: Tahoma, sans-serif;
    text-align: center;
}

.password-field {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.password-field input {
    width: 100%;
    padding: 8px 40px 8px 8px;
    box-sizing: border-box;
}

.toggle-visibility {
    position: absolute;
    right: 5px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    height: 100%;
}

.toggle-visibility i {
    color: #555;
    font-size: 20px;
}

.login-button,
.register-button {
    border-radius: 8px;
    font-size: 14px;
}

.login-button {
    width: 100%;
    padding: 10px 20px;
    background: #b80f20;
    color: #fff;
    border: none;
    cursor: pointer;
    display: block;
}

.login-button:hover {
    background-color: #930c1a; 
}

.register-button {
    background-color: white;
    color: rgb(163, 2, 2);
    font-weight: bold;
    border: none;
}

.error-message {
    text-decoration: underline;
    color: rgb(163, 2, 2);
    font-size: 16px;
}
</style>
