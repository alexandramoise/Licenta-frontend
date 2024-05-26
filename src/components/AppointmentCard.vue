<script setup>
import {computed, ref, onMounted} from 'vue';
import { getPatientByEmail } from "../services/patient_service.js";

const props = defineProps({
    "id": "",
    "date" : "",
    "doctorId": "",
    "patientId": "",
    "doctorEmail": "",
    "patientEmail": "",
    "nobodyCanceled": "",
    "visitType" : "",
    "comment": ""
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

const patientName = ref('');
onMounted(async () => {
    try {
        const patient = await getPatientByEmail(props.patientEmail);
        patientName.value = patient.fullName;
    } catch (error) {
        console.error("Failed to fetch patient data:", error);
        patientName.value = "Failed to load"; // Handle error scenario
    }
});

</script>

<template>
    <div class="card">
        <p> <span class="title"> Pacient </span> {{ patientName }} </p>
        <p> <span class="title"> Data </span> {{ newDate }} </p>
        <p> <span class="title"> Tip </span> {{ props.visitType }} </p>
        <p> <span class="title"> Motiv </span> {{ props.comment }} </p>
    </div>

</template>

<style scoped>

.card {
    background-color: rgb(250, 250, 250);
    width: 300px;
    border-radius: 10px;
    padding: 15px;
    font-size: 17px;
    font-weight: bold;
}

.title {
  color: #b80f20;
  font-weight: bold;
}

@media(max-width: 750px) {
    .card {
        width: 200px;
    }
}
</style>