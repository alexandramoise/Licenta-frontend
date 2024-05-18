<script setup>
import { login } from '../services/auth_service.js'
import { ref, onBeforeUnmount} from 'vue';
import router from "../router";
import CustomInput from "../components/CustomInput.vue";
import CustomModal from "../components/CustomModal.vue";
import CustomLoader from '@/components/CustomLoader.vue';

import { requestNewPasswordPatient } from '@/services/patient_service.js';
import { requestNewPasswordDoctor, getFirstLogin } from '@/services/doctor_service.js';

const emailText = ref('');
const passwordText = ref('');

window.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
    if (event.key === "Enter") {
        login();
    }
}

const showCreateAccountForDoctor = ref(false);
if(localStorage.getItem("role") === "doctor") {
    showCreateAccountForDoctor.value = true;
}

const userType = localStorage.getItem('role');
//console.log("IN LOG IN VERIFIC USER TYPE", userType);

const modalShow = ref(false);
const changePasswordModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const firstLoginEver = ref(false);

async function loginFunction() {
    if (emailText.value === '' || emailText.value === null 
        || passwordText.value === '' || passwordText.value == null) {
            modalShow.value = true;
            modalTitle.value = "Alerta";
            modalMessage.value = "Va rog sa completati campurile";
    } else {
        const loginRequestDto = {
            email: emailText.value,
            password: passwordText.value,
        };

        let response = await login(loginRequestDto);
        if (response.error) {
            modalShow.value = true;
            modalTitle.value = "Eroare";
            modalMessage.value = response.message;
        } else {
            localStorage.setItem('user', emailText.value);
            modalShow.value = true;
            modalTitle.value = "Succes";
            modalMessage.value = "Veti putea intra in aplicatie";
        }
    }
}


const isLoading = ref(false);

async function requestChangePassword() {
    if(emailText.value === null || emailText.value === '') {
        modalShow.value = true;
        modalTitle.value = "Alerta";
        modalMessage.value = "Introduceti email-ul pentru a putea cere o parola noua";
    } else {
        try {
            let response;
            if(userType === 'patient') {
                isLoading.value = true;
                response  = await requestNewPasswordPatient(emailText.value);
                isLoading.value = false;
            } else if(userType === 'doctor') {
                isLoading.value = true;
                response  = await requestNewPasswordDoctor(emailText.value);
                isLoading.value = false;
            }

            modalShow.value = true;
            changePasswordModal.value = true;

            if(response === 404) {
                modalTitle.value = "Eroare";
                modalMessage.value = "Niciun cont asociat acestei adrese";
            } else if(response === 200) {
                modalTitle.value = "Succes";
                modalMessage.value = "Cerere primita, verificati inbox-ul adresei de mail";
            }
                
        } catch (error) {
            console.error("Eroare:", error);
        }
    }
}

function closeDialog() {
    modalShow.value = false;
    if(modalTitle.value === "Succes" && !changePasswordModal.value) {
        if(userType === "doctor") {
            router.push("main-doctor");
        } else {
            router.push("main-patient");
        }
    } else if(changePasswordModal.value && modalTitle.value === "Succes") {
        router.push({
            name: "change-password",
            query: {
                for: userType.substring(0,1).toLowerCase(),
            },
        });
    }
}


function redirectToRegister() {
    router.push({
        name: "new",
        query: {
            accountType: "doctor",
        },
    });
}

const showPassword = ref(false);
function showPasswordToggle() {
    showPassword.value = !showPassword.value;
}

onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyPress);
});

/* window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
window.history.go(1);
}; */
</script>

<template>
    <div class="page">
        <div v-if="isLoading" class="loading-animation" aria-label="Se incarca, asteptati">
                <CustomLoader size="100" />
        </div>

        <div class="login-container" :style="{ height: userType === 'patient' ? '250px' : '290px'}">
            <h2>Accesare cont</h2>
            <CustomInput 
                v-model="emailText"
                :placeholder="'adresa de mail'"
                :type="'text'"
           />
           <div class="password-field">
                <CustomInput 
                    v-model="passwordText"
                    :placeholder="'parola'"
                    :type="showPassword ? 'text' : 'password'"
                />
                <button @click="showPasswordToggle" class="toggle-visibility">
                    <i :class="!showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                </button>
            </div>
            <button @click="requestChangePassword" class="forgot-password"> Am uitat parola </button>
            <button @click="loginFunction" class="login-button" @keyup.enter="enterPress">Conectare</button>
            <div v-if="showCreateAccountForDoctor">
                <span> Nu aveți un cont de medic? </span> 
                <button @click="redirectToRegister" class="register-button"> Creați unul </button>
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
    display: flex; 
    align-items: center;
    justify-content: center; 
    height: 100vh;
    width: 100vw;
    background-color: rgb(163, 2, 2);
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

.forgot-password {
    background-color: transparent;
    border: none;
    text-align: start;
    text-decoration: underline;
    color: rgb(163, 2, 2);
    font-size: 14px;
}

.forgot-password:hover{
    color: rgb(114, 3, 3);
    text-decoration: none;
}
</style>
