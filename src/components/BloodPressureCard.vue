<script setup>
import {computed} from 'vue';

const props = defineProps({
    "id": "",
    "systolic" : "",
    "diastolic" : "",
    "pulse" : "",
    "bloodPressureType" : "",
    "date" : "",
    "patientEmail": "",
    "isEditable" : ""
});

const tendencyTranslation = computed(() => {
    switch(props.bloodPressureType) {
        case 'Hypotension':
            return 'Hipotensiune';
        case 'Normal':
            return 'Normală';
        case 'Hypertension':
            return 'Hipertensiune';
    }
});

const tendencyColor = computed(() => {
    switch(props.bloodPressureType) {
        case 'Hypotension':
            return '#3399ff';
        case 'Normal':
            return '#2eb82e';
        case 'Hypertension':
            return 'red';
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
        <p> <span class="title"> <i class="fas fa-heartbeat"></i> Val: </span> {{ props.systolic }} / {{ props.diastolic }} mmHg <b class="title">||</b> {{ props.pulse }} <i class="fa fa-heart" style="font-size:15px;color:red"></i> bpm  </p>
        <p> <span class="title"> <i class="fas fa-calendar-alt"></i> Data: </span> {{ newDate }} </p>
        <p> <span class="title"> <i class="fas fa-tachometer-alt"></i> Tip: </span> <span :style="{ color: tendencyColor }"> {{ tendencyTranslation }} </span> </p> 
    </div>

</template>

<style scoped>
.card {
    background-color: rgb(250, 250, 250);
    border-radius: 10px;
    padding: 15px;
    font-size: 17px;
    font-weight: bold;
    width: 300px; 
    box-sizing: border-box;
}

.title {
  color: #b80f20;
  font-weight: bold;
}

@media (max-width: 900px) {
    .card {
        width: 240px;
        font-size: 13px;
    }
}

</style>