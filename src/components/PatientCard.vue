<script setup> 
import {computed, onMounted, ref } from 'vue';      

const props = defineProps({
    "id": "",
    "name" : "",
    "email" : "",
    "firstLoginEver" : "",
    "age" : "",
    "gender" : "",
    "doctorEmail": "",
    "tendency" : ""
});

const tendencyColor = computed(() => {
    switch(props.tendency) {
        case 'Hypotension':
            return '3399ff';
        case 'Optimal':
            return '#2eb82e';
        case 'Normal':
            return '#2eb82e';
        case 'Prehypertension':
            return '#ff6600';
        case 'Hypertension_stage1':
            return 'red';
        case 'Hypertension_stage2':
            return '#cc0000';
        case 'Hypertension_stage3':
            return '#990000';
    }
});

const tendencyTranslation = computed(() => {
    switch(props.tendency) {
        case 'Hypotension':
            return 'Hipotensiune';
        case 'Optimal':
            return 'Optimă';
        case 'Normal':
            return 'Normală';
        case 'Prehypertension':
            return 'Prehipertensiune';
        case 'Hypertension_stage1':
            return 'Hipertensiune stadiul 1';
        case 'Hypertension_stage2':
            return 'Hipertensiune stadiul 2';
        case 'Hypertension_stage3':
            return 'Hipertensiune stadiul 3';
    }
})

const cardBackgroundColor = computed(() => {
    switch (props.gender) {
        case 'Feminine':
            return '#ffe6f2';
        case 'Masculine': 
            return '#ccf2ff';
        default: 
            return 'gray';
    }
});

</script>


<template>
    <div class="card" 
        :style="{ 'background-color': cardBackgroundColor }"
        
    >
        <p> <span class="title"> Nume </span> {{ props.name }} </p>
        <p> <span class="title"> Varsta </span> {{ props.age }} </p> 
        <p> <span class="title"> Tendinta </span> <span :style="{ color: tendencyColor }"> {{ tendencyTranslation }} </span> </p>
    </div>
</template>

<style scoped>

.card {
  width: 25vw;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px; 
  font-size: 20px;
  margin-left: 2vw;
  font-weight: bold;
}


.title {
    color: #b80f20;
    font-weight: bold;
}


@media(max-width: 750px) {
    .card {
        font-size: 15px;
        width: 30vw;
    }
}
</style>
