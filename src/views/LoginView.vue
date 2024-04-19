<script setup>
import { createDoctorAccount } from '../services/doctor_service.js'
import { ref, onBeforeUnmount} from 'vue';
import router from "../router";
import CustomInput from "../components/CustomInput.vue";
import CustomNavbar from "../components/CustomNavbar.vue";

const emailText = ref('');
const passwordText = ref('');

window.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
    if (event.key === "Enter") {
        login();
    }
}

const showCreateAccountForDoctor = ref(false);
if(sessionStorage.getItem("gotIn") === "doctor") {
    showCreateAccountForDoctor.value = true;
}

const userType = sessionStorage.getItem("gotIn");
console.log("IN LOG IN VERIFIC USER TYPE", userType);

async function login() {
    if (emailText.value === '' || emailText.value === null 
        || passwordText.value === '' || passwordText.value == null) {
            modalShow.value = true;
            modalTitle.value = "Alerta";
            modalMessage.value = "Va rog sa completati campurile";
    } else {
        try {
            console.log('Email: ', emailText.value);
            console.log('Password: ', passwordText.value);
            if(emailText.value === 'ana@gmail.com' && passwordText.value === 'parola1') {
                modalShow.value = true;
                modalTitle.value = "Succes";
                modalMessage.value = "Conectare cu succes!";
                sessionStorage.setItem("email", emailText.value);
            } else {
                modalShow.value = true;
                modalTitle.value = "Eroare";
                modalMessage.value = "Email si/sau parola incorecte";
            }
        } catch (error) {
            modalShow.value = true;
            modalTitle.value = "Eroare";
            modalMessage.value = error.message;
            console.error(error);
        }
    }
}

function closeDialog() {
    modalShow.value = false;
    if(modalTitle.value === "Succes") {
        if(userType === "doctor") {
            setTimeout(() => {
                router.push("main-doctor");
            }, 300);
        } else {
            setTimeout(() => {
                router.push("main-patient");
            }, 300);
        }
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

window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
window.history.go(1);
};
</script>

<template>
    <div class="page">
        <div class="login-container">
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
            <button @click="login" class="login-button" @keyup.enter="enterPress">Conectare</button>
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

.login-container {
    display: flex;
    flex-direction: column; 
    align-items: center; 
    background-color: white;
    width: 300px;
    height: 250px;
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
    background-color: rgb(163, 2, 2);
    color: white;
}

.register-button {
    background-color: white;
    color: rgb(163, 2, 2);
    font-weight: bold;
    border: none;
}
</style>
