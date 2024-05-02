<script setup>
import { createDoctorAccount } from '../services/doctor_service.js'
import { ref, onBeforeUnmount, onMounted } from 'vue';
import router from "../router";
import { useRoute } from 'vue-router';

import CustomInput from "../components/CustomInput.vue";
import CustomModal from '../components/CustomModal.vue';
import CustomNavbar from '@/components/CustomNavbar.vue';

const emailText = ref('');

window.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
    if (event.key === "Enter") {
        createAccount();
    }
}

const showCreateAccountForDoctor = ref(false);
if(localStorage.getItem('role') === "doctor") {
    showCreateAccountForDoctor.value = true;
}

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');   
async function createAccount() {
    if (emailText.value === '' || emailText.value === null) {
        modalShow.value = true;
        modalTitle.value = "Alerta";
        modalMessage.value = "Va rog sa completati campul";
    } else {
        try {
            //const result = await createDoctorAccount(emailText.value)
            if(!validateEmail(emailText.value)) {
                console.log("mail invalid");
                modalShow.value = true;
                modalTitle.value = "Eroare";
                modalMessage.value = "Adresa de mail nu este valida";
            } else {
                console.log("S-A INTRODUS: ", emailText.value);
                alert(emailText.value)
                if(role.value === "doctor") {
                    modalMessage.value = "Verificati inbox-ul la adresa de email introdusa";
                } else {
                    modalMessage.value = "S-a trimis mail catre pacient";
                }
                modalShow.value = true;
                modalTitle.value = "Succes";
            }
        } catch (error) {
            modalShow.value = true;
            modalTitle.value = "Eroare";
            modalMessage.value = error.message;
            console.error(error);
        }
    }
}

const role = ref('');
onMounted(() => {
    const route = useRoute();
    if (route.query.accountType) {
        role.value = route.query.accountType;
    }
});

function closeDialog() {
    modalShow.value = false;
    if(modalTitle.value === "Succes") {
        if(role.value === "doctor") {
            setTimeout(() => {
                router.push("login");
            }, 300);
        } else {
            console.log("Merg la dashboard: ", role)
            setTimeout(() => {
                router.push("main-doctor");
            }, 300);
        }
    }
}

function validateEmail(emailAddress) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailAddress)) {
        return true;
    }
    return false;
}

onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyPress);
});

</script>

<template>
    <div v-if="role === 'pacient'">
        <CustomNavbar />
    </div>
    <div class="page" :style="{ height: role === 'pacient' ? '94vh' : '100vh'}">
        <div class="register-container">
            <h2>Creare cont {{ role }}</h2>
            <CustomInput 
                v-model="emailText"
                :placeholder="'adresa de mail'"
                :type="'email'"
           />
            <button @click="createAccount" class="register-button">Creare</button>
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
    width: 100vw;
    background-color: rgb(163, 2, 2);
}

.register-container {
    display: flex;
    flex-direction: column; 
    align-items: center; 
    background-color: white;
    width: 250px;
    height: 170px;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
}

.register-container > * {
    width: 100%; 
    margin: 10px 0; 
}

.register-container h2 {
    margin-bottom: 20px; 
    color: rgb(163, 2, 2);
    font-family: Tahoma, sans-serif;
    text-align: center;
}

.register-button {
    width: 100%;
    border-radius: 8px;
    font-size: 14px;
    padding: 10px 20px;
    background: #b80f20;
    color: #fff;
    border: none;
    cursor: pointer;
    display: block;
}

.register-button:hover {
    background-color: #930c1a; 
}

.error-message {
    color: rgb(163, 2, 2);
    font-size: 15px;
    font-family: Tahoma, sans-serif;
}
</style>
