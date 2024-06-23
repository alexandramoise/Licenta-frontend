<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomButton from "../components/CustomButton.vue";
import AppointmentCard from "../components/AppointmentCard.vue";
import CustomCalendar from '../components/CustomCalendar.vue';
import CustomLoader from '@/components/CustomLoader.vue';
import Pagination from '../components/Pagination.vue';

import { getDoctorsPagedAppointments, 
        getPatientsPagedAppointments, 
        getPatientsAppointmentsOnACertainDay, 
        getDoctorsAppointmentsOnACertainDay, 
        doctorCancelesAppointment,
        patientCancelesAppointment
     } from "../services/appointments_service.js";
import router from '@/router';
import NotAuthenticatedView from './NotAuthenticatedView.vue';

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

const userEmail = localStorage.getItem('user');
const userType = localStorage.getItem('role');

const appointments = ref([]);
const appointmentsNotFound = ref(false);

const pageSize = 5;
const totalPages = ref(0);
const currentPage = ref(1);

onMounted(() => {
  fetchPaginatedAppointments();
});

setInterval(fetchPaginatedAppointments, 30000);

const selectedDate = ref(null);

watch(selectedDate, (newValue, oldValue) => {
  if (newValue) {
    currentPage.value = 1;
    fetchAppointmentsByDate(newValue);
  } else {
    fetchPaginatedAppointments();
  }
});


watch(currentPage, (newPage, oldPage) => {
  if (selectedDate.value) {
    fetchAppointmentsByDate(selectedDate.value);
  } else {
    fetchPaginatedAppointments();
  }
});


function getDateFromCalendar(date) {
  //console.log("Date received from CalendarComponent:", date);
  selectedDate.value = date;
}


const isLoading = ref(false);
async function fetchPaginatedAppointments() {
    let data = '';
    if(userType === "doctor") {
        isLoading.value = true;
        data = await getDoctorsPagedAppointments(userEmail, pageSize, currentPage.value - 1);
        isLoading.value = false;
    } else {
        isLoading.value = true;
        data = await getPatientsPagedAppointments(userEmail, pageSize, currentPage.value - 1);
        isLoading.value = false;
    }

    if (data && data.content) { 
        if(data.content.length !== 0) {
            appointments.value = data.content.map((appointment) => ({
                ...appointment
            }));

            appointmentsNotFound.value = false;
            totalPages.value = Math.ceil(data.totalElements / pageSize);
        } else {
            totalPages.value = 0;
            appointmentsNotFound.value = true;
        }

        console.log(appointmentsNotFound.value);
    } else {
        console.error("No content returned from the API");
    }
}

async function fetchAppointmentsByDate(date) {
    let data = '';
    if(userType === "doctor") {
        isLoading.value = true;
        data = await getDoctorsAppointmentsOnACertainDay(userEmail, date, pageSize, currentPage.value - 1);
        isLoading.value = false;
    } else {
        isLoading.value = true;
        data = await getPatientsAppointmentsOnACertainDay(userEmail, date, pageSize, currentPage.value - 1);
        isLoading.value = false;
    }

    if (data && data.content) { 
        if(data.content.length !== 0) {
            appointments.value = data.content.map((appointment) => ({
                ...appointment
            }));

            appointmentsNotFound.value = false;
            totalPages.value = Math.ceil(data.totalElements / pageSize);

        } else {
            appointmentsNotFound.value = true;
        }
        console.log(appointments.value); 
    } 
}

function changePage(newPage) {
    currentPage.value = newPage;
}

function redirectToForm() {
    if(userType === "doctor") {
        router.push("create-appointment");
    } else {
        router.push("request-appointment");
    }
}


const inThePast = ref([]);
function checkIsPast(appointmentId, value) {
  inThePast.value[appointmentId] = value;
}

const selectedApId = ref(null);
function toggleButtons(apId) {
    // console.log("Programarea cu: ", apId, ! inThePast.value[apId] ? " poate fi modificata" : " nu poate fi modificata");
    selectedApId.value = selectedApId.value === apId ? null : apId;
}

async function cancelAppointment(apId) {
    // console.log("voi da cancel la: ", apId);
    if(userType === "doctor") {
        await doctorCancelesAppointment(apId);
    } else if(userType === "patient") {
        await patientCancelesAppointment(apId);
    }   

    console.log(userType, " a dat cancel la ", apId);
    router.push({
        name: "request-appointment",
        query: {
            updateId: apId,
        },
        });
}
</script>


<template>
    <div class="page" v-if="isAuthenticated">
        <div v-if="isLoading" class="loading-animation">
                <CustomLoader size="100" />
        </div>

        <CustomNavbar />
        <div class="content">
            <div class="history-section">
                <div class="calendar-container">
                    <CustomCalendar @selectedDate="getDateFromCalendar" />
                </div>
            </div>

            <div class="appointments-section">

                <CustomButton class="add-button" @click="redirectToForm"> {{ userType === 'doctor' ? 'Creeaza' : 'Solicita' }} programare </CustomButton>
                <div v-if="!appointmentsNotFound" class="appointments-container">
                    <div class="card-container" v-for="appointment in appointments" :key="appointment.id">
                        <AppointmentCard
                            :patientId="appointment.patientId"
                            :patientEmail="appointment.patientEmail"
                            :doctorId="appointment.doctorId"
                            :visitType="appointment.visitType"
                            :comment="appointment.comment"
                            :date="appointment.date"
                            :nobodyCanceled="appointment.nobodyCanceled"
                            @click="toggleButtons(appointment.id)"
                            @isPast="checkIsPast(appointment.id, $event)"
                        />
                        <div v-if="selectedApId === appointment.id && !inThePast[appointment.id]">
                            <CustomButton class="button-element" @click="cancelAppointment(appointment.id)"> <i class="fas fa-calendar-alt"> </i> Data noua </CustomButton>
                        </div>
                    </div>

                    <Pagination 
                        :totalPages="totalPages"
                        :currentPage="currentPage"
                        @changePage="changePage"
                        class="pagination-component"
                    />
                </div>
                
                <div v-else class="not-found">
                    <p> Nu s-au gasit programari. </p>
                </div>       
            </div>
        </div>
    </div>
    <div v-else> 
        <NotAuthenticatedView />
    </div>
</template>


<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: rgb(255, 255, 255);
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

.content {
    display: grid;
    height: 100%;
    grid-template-columns: 40% 60%;
}

.history-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgb(244, 244, 244)
}

.calendar-container {
    width: 95%;
    max-width: 600px;
    margin: auto; 
    height: auto; 
}

.appointments-section {
    background-color: rgb(240, 240, 240);
    padding: 15px;
    display: flex;
    flex-direction: column;
    position: relative;
    height: calc(100% - 60px);
    margin-top: 2px;
    overflow: hidden;
}

.appointments-container {
    flex-grow: 1;
    overflow-y: auto; 
    display: flex;
    flex-direction: column;
    scrollbar-width: thin; 
    scrollbar-color: #c9c9c9 #ececec;
}

.card-container {
    display: grid;
    grid-template-columns: auto auto;
    align-items: start; 
    margin: 15px auto; 
    gap: 0px; 
}

.button-element {
    border-radius: 6px;
    border: 1px solid gray;
    color: darkred;
    background-color: white;
    height: 30px;
    width: 100%;
    cursor: pointer;
}

.pagination-component {
    margin-top: auto; 
    width: 100%;
    text-align: center;
    padding: 10px 0; 
    background-color: inherit; 
}

.add-button {
    width: 40%;
    padding: 10px 20px;
    border-radius: 8px;
    background: #b80f20;
    color: #fff;
    font-size: 18px;
    border: none;
    cursor: pointer;
    display: block;
    margin: 10px auto;
}

.not-found {
    display: flex;
    justify-content: center;
    align-items: center; 
    height: 100%;
    text-align: center;
    color: darkred;
    font-size: 17px;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
}


@media (max-width: 600px){
    .content {
        grid-template-columns: 1fr; 
        grid-template-rows: 50% 50%; 
        overflow-x: hidden;
    }

    .history-section {
        overflow: hidden;
        width: 100%; 
    }

    .calendar-container {
        width: 80%; 
        max-width: none; 
        margin: 0;
        height: auto; 
    }

    .appointments-section {
        overflow-y: auto;
        overflow-x: hidden;
        padding: 10px 0;
        scrollbar-width: thin; 
        scrollbar-color: #c9c9c9 #ececec;
    }
}

@media (max-width: 1024px) and (min-width: 601px) {
    .history-section {
        overflow: hidden;
        width: 100%; 
    }

    .calendar-container {
        width: 90%; 
        max-width: none; 
        margin: 0; 
        height: auto;
    }

    .appointments-section {
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin; 
        scrollbar-color: #c9c9c9 #ececec;
    }
}



</style>