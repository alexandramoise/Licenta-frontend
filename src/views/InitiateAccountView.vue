<script setup>
import { createDoctorAccount } from '../services/doctor_service.js'
import { ref } from 'vue';

const emailText = ref('');

async function ceva() {
    if (emailText.value === '' || emailText.value === null) {
        alert("Input can't be empty");
    } else {
        try {
            const result = await createDoctorAccount(emailText.value);
        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    }
}
</script>

<template>
    <h1>Creare cont</h1>
    <input v-model="emailText">
    <button @click="ceva">Creare</button>
</template>


<style scoped>

</style>
