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
            return '#3399ff';
        case 'Normal':
            return '#2eb82e';
        case 'Hypertension':
            return 'red';
    }
});

const tendencyTranslation = computed(() => {
    switch(props.tendency) {
        case 'Hypotension':
            return 'Hipotensiune';
        case 'Normal':
            return 'Normală';
        case 'Hypertension':
            return 'Hipertensiune';
    }
})

const cardBackgroundColor = computed(() => {
    switch (props.gender) {
        case 'Feminine':
            return '#ffe6f2';
        case 'Masculine': 
            return '#ccf2ff';
        default: 
            return '#f2f2f2';
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
  height: 140px;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px; 
  font-size: 20px;
  margin-left: 2vw;
  font-weight: bold;
  margin-left: auto;
  margin-right: auto;
}

.card:hover{
    border: 2px solid rgb(197, 197, 197);
}

.title {
  color: #b80f20;
  font-weight: bold;
}


@media(max-width: 750px) {
    .card {
        font-size: 15px;
    }
}
</style>
