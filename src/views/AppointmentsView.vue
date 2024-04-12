<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomButton from "../components/CustomButton.vue";
import AppointmentCard from "../components/AppointmentCard.vue";
import CustomCalendar from '../components/CustomCalendar.vue';
import Pagination from '../components/Pagination.vue';

import { getDoctorsPagedAppointments, 
        getPatientsPagedAppointments, 
        getPatientsAppointmentsOnACertainDay, 
        getDoctorsAppointmentsOnACertainDay, 
     } from "../services/appointments_service.js";
import router from '@/router';

//const userEmail = sessionStorage.getItem("email");
const doctorEmail = "alexandramoise636@gmail.com";
const patientEmail = "alexandramoise@gmail.com";
const userType = sessionStorage.getItem("gotIn");

const appointments = ref([]);
const appointmentsNotFound = ref(false);

const pageSize = 3;
const totalPages = ref(0);
const currentPage = ref(1);

onMounted(() => {
  fetchPaginatedAppointments();
});

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
    selectedDate.value = date;
}

async function fetchPaginatedAppointments() {
    let data = '';
    if(userType === "doctor") {
        data = await getDoctorsPagedAppointments(doctorEmail, pageSize, currentPage.value - 1);
    } else {
        data = await getPatientsPagedAppointments(patientEmail, pageSize, currentPage.value - 1);
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
        data = await getDoctorsAppointmentsOnACertainDay(doctorEmail, date, pageSize, currentPage.value - 1);
    } else {
        data = await getPatientsAppointmentsOnACertainDay(patientEmail, date, pageSize, currentPage.value - 1);
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
</script>


<template>
    <div class="page">
        <CustomNavbar />
        <div class="content">
            <div class="history-section">
                <CustomCalendar
                @selected-date="getDateFromCalendar" />
            </div>

            <div class="statistics-panel">

                <CustomButton class="add-button" @click="redirectToForm"> {{ userType === 'doctor' ? 'Creaza' : 'Solicita' }} programare </CustomButton>
                <div v-if="!appointmentsNotFound">
                    <AppointmentCard
                        v-for="appointment in appointments"
                        :key="appointment.id"
                        :class="card"
                        :patientId="appointment.patientId"
                        :patientEmail="appointment.patientEmail"
                        :doctorId="appointment.doctorId"
                        :visitType="appointment.visitType"
                        :date="appointment.date"
                        :nobodyCanceled="appointment.nobodyCanceled"
                    />

                    <Pagination 
                        :totalPages="totalPages"
                        :currentPage="currentPage"
                        @changePage="changePage"
                        class="pagination-component"
                    />
                </div>
                
                <div v-else class="not-found">
                    <p> Nu există programari in ziua selectata. </p>
                </div>       
            </div>
        </div>
    </div>
</template>


<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: rgb(255, 255, 255);
    overflow-y: auto;
}

.content {
    display: grid;
    height: 100%;
    grid-template-columns: 1fr 1fr;
}

.history-section {
    background-color: rgb(227, 227, 227);
    padding: 15px;
}


.statistics-panel {
    background-color: rgb(240, 240, 240);
    padding: 15px;
    position: relative;
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

.pagination-component {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    margin-bottom: 7%;
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


@media(max-width: 600px) {

    .content {
        grid-template-columns: 1fr; 
    }

}

</style>