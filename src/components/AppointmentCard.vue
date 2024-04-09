<script setup>
import {computed, ref} from 'vue';
import { getPatientById } from "../services/patient_service.js";

const props = defineProps({
    "id": "",
    "date" : "",
    "doctorId": "",
    "patientId": "",
    "doctorEmail": "",
    "patientEmail": "",
    "nobodyCanceled": "",
    "visitType" : ""
});

const visitTypeColor = computed(() => {
    switch(props.visitType) {
        case 'Consultatie':
            return 'green';
        case 'Vizia':
            return 'blue';
        default:
            return 'pink';
    }
});

const newDate = computed(() => {
      const date = new Date(props.date);
      const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit' };
      return `${date.toLocaleDateString('ro-RO', optionsDate)} ${date.toLocaleTimeString('ro-RO', optionsTime)}`;
});

</script>

<template>
    <div class="card">
        <p> <span class="title"> Pacient </span> {{ props.patientEmail }} </p>
        <p> <span class="title"> Data </span> {{ newDate }} </p>
        <p> <span class="title"> Tip </span> {{ props.visitType }} </p>
    </div>

</template>

<style scoped>

.card {
    background-color: rgb(250, 250, 250);
    width: 40%;
    border-radius: 10px;
    padding: 15px;
    font-size: 17px;
    font-weight: bold;
    margin: 20px auto;
}

.card:hover{
    border: 2px solid slategray;
}

.title {
  color: #b80f20;
  font-weight: bold;
}

@media(max-width: 750px) {
    .card {
        width: 75%;
    }
}
</style>