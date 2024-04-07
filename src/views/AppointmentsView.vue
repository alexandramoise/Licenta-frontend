<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomButton from "../components/CustomButton.vue";
import AppointmentCard from "../components/AppointmentCard.vue";
import CustomCalendar from '../components/CustomCalendar.vue';

import { getDoctorsPagedAppointments, 
        getPatientsPagedAppointments, 
        getPatientsAppointmentsOnACertainDay, 
        getDoctorsAppointmentsOnACertainDay } from "../services/appointments_service.js";
import router from '@/router';

//const userEmail = sessionStorage.getItem("email");
const userEmail = "alexandramoise@gmail.com"

const userType = sessionStorage.getItem("gotIn");

const appointments = ref([]);
const appointmentsNotFound = ref(false);

const pageSize = ref(3);
const pageNumber = ref(0);

onMounted(() => {
  fetchAppointments();
});

const selectedDate = ref(null);

watch(selectedDate, (newValue, oldValue) => {
  if (newValue) {
    fetchAppointmentsByDate(newValue);
  } else {
    fetchAppointments();
  }
});

function getDateFromCalendar(date) {
    selectedDate.value = date;
}

async function fetchAppointments() {
    let data = '';
    if(userType === "doctor") {
        data = await getDoctorsPagedAppointments(userEmail, pageSize.value, pageNumber.value);
    } else {
        data = await getPatientsPagedAppointments(userEmail, pageSize.value, pageNumber.value);
    }

    if (data && data.content) { 
        if(data.content.length !== 0) {
            appointments.value = data.content.map((appointment) => ({
                ...appointment
            }));

            appointmentsNotFound.value = false;
        } else {
            appointmentsNotFound.value = true;
        }
    } else {
        console.error("No content returned from the API");
    }
}

async function fetchAppointmentsByDate(date) {
    let data = '';
    if(userType === "doctor") {
        data = await getDoctorsAppointmentsOnACertainDay(userEmail, date, pageSize.value, pageNumber.value);
    } else {
        data = await getPatientsAppointmentsOnACertainDay(userEmail, date, pageSize.value, pageNumber.value);
    }

    if (data && data.content) { 
        if(data.content.length !== 0) {
            appointments.value = data.content.map((appointment) => ({
                ...appointment
            }));

            appointmentsNotFound.value = false;
        } else {
            appointmentsNotFound.value = true;
        }
        console.log(appointments.value); 
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
                <div v-if="!appointmentsNotFound">
                    <AppointmentCard
                        v-for="appointment in appointments"
                        :key="appointment.id"
                        :class="card"
                        :patientId="appointment.patientId"
                        :doctorId="appointment.doctorId"
                        :visitType="appointment.visitType"
                        :date="appointment.date"
                    />
                </div>
                
                <div v-else>
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
    background-color: rgb(181, 255, 255);
    padding: 15px;
}


@media(max-width: 600px) {

    .content {
        grid-template-columns: 1fr; 
    }

}

</style>