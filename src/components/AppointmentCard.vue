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

const newDate = computed(() => {
      const date = new Date(props.date);
      const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const optionsTime = { hour: '2-digit', minute: '2-digit' };
      return `${date.toLocaleDateString('ro-RO', optionsDate)} ${date.toLocaleTimeString('ro-RO', optionsTime)}`;
});

const inThePast = computed(() => {
    const appointmentDate = new Date(props.date);
    const currentDate = new Date();

    return appointmentDate < currentDate;
})

const emits = defineEmits(['isPast']);
function clickCard() {
    emits('isPast', inThePast.value);
}

const patientName = ref('');
onMounted(async () => {
    try {
        const patient = await getPatientByEmail(props.patientEmail);
        patientName.value = patient.fullName;
    } catch (error) {
        console.error("Failed to fetch patient data:", error);
        patientName.value = "";
    }

    emits('isPast', inThePast.value);
});

</script>

<template>
    <div class="card" :style="{backgroundColor: !inThePast ? 'rgb(252, 252, 252)' : 'rgb(245, 245, 245)'}" @click="clickCard">
        <p> <span class="title"> <i class="fas fa-user"></i> Pacient </span> {{ patientName }} </p>
        <p> <span class="title"> <i class="fas fa-calendar-alt"></i> </span> {{ newDate }} <span class="title"> || Tip </span> {{ props.visitType }}</p>
        <p> <span class="title"> <i class="fas fa-comment-dots"></i> </span> {{ props.comment }} </p>
    </div>

</template>

<style scoped>

.card {
    width: 300px;
    border-radius: 10px;
    padding: 15px;
    font-size: 17px;
}

.title {
  color: #b80f20;
  font-weight: bold;
}
</style>