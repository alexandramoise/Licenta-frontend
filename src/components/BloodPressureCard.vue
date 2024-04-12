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
        <div v-if="isEditable"> <i class="fas fa-plus"> </i> MODIFICA </div>
        <p> <span class="title"> Valoare </span> {{ props.systolic }} / {{ props.diastolic }} </p>
        <p> <span class="title"> Puls </span> {{ props.pulse }} </p>
        <p> <span class="title"> Data </span> {{ newDate }} </p>
        <p> <span class="title"> Tip </span> <span :style="{ color: tendencyColor }"> {{ tendencyTranslation }} </span> </p> 
    </div>

</template>

<style scoped>

.card {
    background-color: rgb(250, 250, 250);
    width: 12vw;
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
        width: 35vw;
    }
}
</style>