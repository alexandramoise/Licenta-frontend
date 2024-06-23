<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import router from '@/router';

import CustomNavbar from '@/components/CustomNavbar.vue';
import CustomButton from '@/components/CustomButton.vue';
import CustomModal from '@/components/CustomModal.vue';
import CustomLoader from '@/components/CustomLoader.vue';

import NotAuthenticatedView from './NotAuthenticatedView.vue';

import { getDoctorByEmail, doctorToggleNotifications, doctorDeactivatesAccount } from '@/services/doctor_service';
import { getPatientByEmail, patientToggleNotifications, patientDeactivatesAccount } from '@/services/patient_service';

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

const email = localStorage.getItem("user");
const role = localStorage.getItem("role");

const hasNotificationsOn = ref(true);
onMounted(async () => {
    let userData;
    if(role === "doctor") {
        userData = await getDoctorByEmail(email);
    } else if(role === "patient") {
        userData = await getPatientByEmail(email);
    }

    hasNotificationsOn.value = userData.sendNotifications;
});

const confirmModalShow = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');

let confirmDeactivate = () => {};

function openDeactivateModal() {
    confirmModalShow.value = true;
    confirmModalTitle.value = "Dezactivare cont";
    confirmModalMessage.value = "Sunteti sigur ca doriti stergerea contului?"

    confirmDeactivate = () => deactivateAccount();
}

async function deactivateAccount() {
    let response;

    if(role === 'doctor') {
        response = await doctorDeactivatesAccount(email);
    } else {
        response = await patientDeactivatesAccount(email);
    }

    confirmModalShow.value = false;
    modalShow.value = true;
    modalTitle.value = "Confirmare cont dezactivat";
    modalMessage.value = "Contul a fost dezactivat cu succes";
}

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
async function toggleUserNotifications() {
    let response;

    if(role === 'doctor') {
        response = await doctorToggleNotifications(email);
    } else {
        response = await patientToggleNotifications(email);
    }

    modalShow.value = true;
    modalTitle.value = "Notificari";
    modalMessage.value = "De acum " + (hasNotificationsOn.value ? "nu" : "") + " veti primi notificări pe adresa de email";
}

function closeDialog() {
    modalShow.value = false;
    confirmModalShow.value = false;

    if(modalTitle.value === "Confirmare cont dezactivat") {
        localStorage.clear();
        router.push("/");
    } else {
        window.location.reload();
    }
}
</script>

<template>
    <div class="page" v-if="isAuthenticated">

      <CustomNavbar />
  
      <div class="account-settings">
          <div class="content">
              <h2>Opțiuni pentru contul dvs</h2>
              
              <h3> <i class="far fa-star"></i> Notificări pe adresa de email </h3>
                  <div class="options-content">
                      <p> În acest moment aveți notificările <span :style="{color: !hasNotificationsOn ? 'red' : '#ff6666'}"> <b> <i> {{ hasNotificationsOn ? 'pornite' : 'oprite'}} </i> </b> </span> </p>
                      <p> În cadrul aplicației <span style="color: #b80f20; font-family: Arial, Helvetica, sans-serif;"> <i>  CardioHealth Companion </i> </span>, notificările sunt transmise prin intermediul adresei de email asociate contului de utilizator, un canal de comunicare sigur și la îndemâna tuturor. </p>
                      <p> Notificările sunt menite să vă țină la curent cu toate actualizările care sunt de interes dumneavoastră pentru utilizatorii cu rol de {{ role === 'doctor' ? role : 'pacient'}}: </p>
                        <ul>
                            <li> <p> detaliile programărilor <span v-if="role === 'patient'"> la medic </span></p></li>
                            <li> <p> reminder în ziua unei vizite </p></li>
                            <li> <p> modificarea sau încheierea unui tratament </p></li>
                            <li v-if="role === 'patient'"> <p> remindere pentru administrarea tratamentului </p></li>
                            <li v-if="role === 'doctor'"> <p> tendința unui pacient </p></li>
                        </ul>
                      
                      <div class="button-container">
                        <p> {{ hasNotificationsOn ? 
                            "Alegeți să opriți notificările dacă doriți să nu le mai primiți"
                                :
                            "Alegeți să porniți din nou notificările pentru a fii la curent cu toate noutățile"
                            }}
                            
                        </p>
                        <CustomButton class="notifications-button" @click="toggleUserNotifications"> {{ hasNotificationsOn ? 'Opriți' : 'Reporniți'}} notificările </CustomButton>
                      </div>
                  </div>
  
              <h3> <i class="far fa-star"></i> Activitatea contului </h3>
              
                  <div class="options-content">
                      <p> Folosirea aplicației <span style="color: #b80f20; font-family: Arial, Helvetica, sans-serif;"> <i>  CardioHealth Companion </i> </span> este condiționată de crearea unui cont folosind o adresă de mail validă și accesarea sa. </p>
                      <p> Dacă doriți să nu mai fiți un utilizator al platformei, puteți <i style="color: #cc0000;"> deazactiva </i> contul și acesta va fi închis. </p>
                      <p> <b style="color: red"> Atenție</b> după dezactivarea contului, acesta nu poate fi recuperat. </p>
                      <div class="button-container">
                        <p> Dacă alegeți închiderea contului, acesta nu va mai putea fi folosit.</p>
                        <CustomButton class="deactivate-button" @click="openDeactivateModal"> ÎNCHIDEȚI CONTUL </CustomButton>
                      </div>
                  </div>
          </div>
      </div>
  

      <CustomModal
            :open="confirmModalShow"
            :forConfirmation="true"
            :title="confirmModalTitle"
            :message="confirmModalMessage"
            @cancel="closeDialog"
            @confirm="confirmDeactivate"
        />

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

.content {
    margin: 50px auto;
    background-color: white;
    padding: 20px;
    width: 80vw;
    max-width: 500px;
    height: 100%;
    max-height: 70vh;
    overflow-y: auto;
    scrollbar-width: thin; 
    scrollbar-color: #c9c9c9 #ececec;
}

h2 {
    color: #b80f20;
    text-align: center;
    margin-bottom: 30px;
    font-family: Arial, sans-serif; 
    text-decoration: underline;
}

h3 {
    color: #b80f20;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
}

.options-content {
    margin-bottom: 20px;
}

p {
    margin: 10px 0;
    font-family: Arial, sans-serif;
}

.button-container {
    display: flex;
    gap: 10px;
    background-color: rgb(246, 246, 246);
    padding: 10px;
}


.notifications-button, 
.deactivate-button {
    border-radius: 8px;
    cursor: pointer;
    display: block;
    font-size: 1rem;
    width: 5vw;
    padding: 5px 10px;
    max-width: 180px;
    min-width: 120px;
    height: 2vw;
    min-height: 50px;
    max-height: 70px;
}

.notifications-button {
    background: #ff9ea6;
    border: 1px solid #e84353;
}

.notifications-button:hover {
    background-color: #f88d97;
}

.deactivate-button {
    background: #b80f20;
    border: 1px solid #760712;
    color: #fff;
}

.deactivate-button:hover {
    background-color: #930c1a; 
}

@media(max-width: 400px) {
    .content {
        width: 80vw;
        height: 70vh;
    }
}

@media(max-height: 450px) {
    .content {
        height: 60vh;   
    }
}
</style>