<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomInput from "../components/CustomInput.vue";
import CustomButton from "../components/CustomButton.vue";
import BloodPressureCard from "../components/BloodPressureCard.vue";
import CustomCalendar from '../components/CustomCalendar.vue';

import { getBloodPressures} from "../services/bloodpressure_service.js";
import router from '@/router';

//const userEmail = sessionStorage.getItem("email");
const userEmail = "alexandramoise@gmail.com"

function redirectToAdd() {
    router.push("add-bloodpressure");
}

const bloodPressures = ref([]);
async function fetchBloodPressures() {
    bloodPressures.value = await getBloodPressures(userEmail);
}

onMounted(() => {
    fetchBloodPressures();
});

function showCanEdit(isEditable) {
    if(isEditable) {
        alert("Editezi");
    }
}
</script>


<template>
    <div class="page">
        <CustomNavbar />
        <div class="content">
            <div class="history-section">
                <p> ISTORIC </p>
                <CustomButton
                    @click="redirectToAdd"
                    class="add-button"
                > Adaugare </CustomButton> 

                <div class="list">
                    <BloodPressureCard
                        :class="card"
                        v-for="bp in bloodPressures"
                        :key="bp.id" 
                        :systolic="bp.systolic" 
                        :diastolic="bp.diastolic"
                        :pulse="bp.pulse"
                        :date="bp.date"
                        :bloodPressureType="bp.bloodPressureType"
                        :isEditable="bp.isEditable"
                        :patientEmail="bp.patientEmail"
                        @click.stop="showCanEdit(bp.isEditable)"
                />
                </div>
            </div>

            <div class="statistics-panel">
                <p> AICI O SA AM STATISTICI </p>           
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

.add-button {
    background-color: rgb(163, 2, 2);
    color: white;
    height: 30px;
    width: 100px;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    font-size: 15px;
}

.list {
    display: flex;
    flex-direction: column;
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