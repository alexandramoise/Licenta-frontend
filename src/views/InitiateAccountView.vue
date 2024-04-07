<script setup>
import { createDoctorAccount } from '../services/doctor_service.js'
import { ref, onBeforeUnmount } from 'vue';
import router from "../router";
import CustomInput from "../components/CustomInput.vue";

const emailText = ref('');

window.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
    if (event.key === "Enter") {
        createAccount();
    }
}

const showCreateAccountForDoctor = ref(false);
if(sessionStorage.getItem("gotIn") === "doctor") {
    showCreateAccountForDoctor.value = true;
}

async function createAccount() {
    if (emailText.value === '' || emailText.value === null) {
        alert("Vă rog să completați câmpul");
    } else {
        try {
            //const result = await createDoctorAccount(emailText.value);
            if(!validateEmail(emailText.value)) {
                console.log("mail invalid");
                alert("INVALID");
            } else {
                console.log("S-A INTRODUS: ", emailText.value);
                alert(emailText.value)
                router.push('login');
            }
        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    }
}

const showErrorMessage = ref(false);
function validateEmail(emailAddress) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailAddress)) {
        return true;
    }
    showErrorMessage.value = true;
    return false;
}

onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyPress);
});

</script>

<template>
    <div class="page">
        <div class="register-container">
            <h2>Creare cont</h2>
            <CustomInput 
                v-model="emailText"
                :placeholder="'adresa de mail'"
                :type="'email'"
           />
            <span v-if="showErrorMessage" class="error-message"> Introduceți o adresă de email validă </span>
            <button @click="createAccount" class="register-button">Creare</button>
        </div>
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
    background-color: rgb(163, 2, 2);
    color: white;
    border-radius: 8px;
    font-size: 14px;
}

.error-message {
    color: rgb(163, 2, 2);
    font-size: 15px;
    font-family: Tahoma, sans-serif;
}
</style>
