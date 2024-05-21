<script setup>
import { onMounted, ref, watch } from 'vue';
import CustomNavbar from "../components/CustomNavbar.vue";
import CustomModal from '@/components/CustomModal.vue';
import CustomButton from "../components/CustomButton.vue";
import CustomLoader from '@/components/CustomLoader.vue';
import CustomInput from '@/components/CustomInput.vue';
import BloodPressureCard from "../components/BloodPressureCard.vue";
import LineChartComponent from '../components/charts/LineChartComponent.vue';
import Pagination from '@/components/Pagination.vue';
import { getBloodPressures, getBloodPressureById, deleteBloodPressure } from "../services/bloodpressure_service.js";
import router from '@/router';
import NotAuthenticatedView from './NotAuthenticatedView.vue';

const token = localStorage.getItem("token");
const isAuthenticated = ref(token !== null);
watch(() => localStorage.getItem("token"), (newToken) => {
  isAuthenticated.value = newToken !== null;
});

const userEmail = localStorage.getItem('user');

// 50 trackings per page to balance the load on the system and to ensure the line chart shows a significant evolution without overwhelming the system with hundreds of data points in a single request.
const pageSize = 50; 
const currentPage = ref(1);
const totalPages = ref(0);

const bloodPressures = ref([]);
const selectedBpId = ref(null);

const noTrackings = ref(false);
const isLoading = ref(false);

const fromDate = ref(null);
const toDate = ref(null);
const filterModalShow = ref(false);
const filterModalTitle = ref('');
const filterModalMessage = ref('');

function changePage(newPage) {
    currentPage.value = newPage;
}

watch(currentPage, (newPage, oldPage) => {
  fetchBloodPressures();
});

function filterByDate() {
    const fromDateValue = new Date(fromDate.value);
    const toDateValue = new Date(toDate.value);
    const currentDate = new Date();

    currentPage.value = 1; // always going back on the first page when i do filtering

    if (toDate.value !== null && toDate.value !== '' && fromDate.value > toDate.value) {
        filterModalShow.value = true;
        filterModalTitle.value = "Problema";
        filterModalMessage.value = "Interval invalid";
        return;
    }

    if (fromDateValue > currentDate || toDateValue > currentDate) {
        filterModalShow.value = true;
        filterModalTitle.value = "Problema";
        filterModalMessage.value = "Datele nu pot fi în viitor";
        return;
    }

    fetchBloodPressures();
}

async function fetchBloodPressures() {
    isLoading.value = true;
    
    const data = await getBloodPressures(userEmail, fromDate.value, toDate.value, pageSize, currentPage.value - 1);
 
    if(data && data.content) {
        if(data.content.length !== 0) {
            bloodPressures.value = data.content.map(b => b);
            
            totalPages.value = Math.ceil(data.totalElements / pageSize);
            noTrackings.value = false;

            console.log("PAGINI: ", totalPages.value);
            console.log("Sunt pe pagina: ", currentPage.value);
        } else {
            totalPages.value = 0;
            noTrackings.value = true;
        }
    } else {
        console.error("No content returned from the API");
    }

    
    
    isLoading.value = false;
}

onMounted(() => {
    fetchBloodPressures();
});

function toggleButtons(bpId) {
    selectedBpId.value = selectedBpId.value === bpId ? null : bpId;
}

function editBp(bpId) {
    router.push({
        name: "add-bloodpressure",
        query: {
            updateId: bpId,
        },
        });
}

const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

let confirmDelete = () => {};

function convertDate(dateParam) {
    const date = new Date(dateParam);
    const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit' };
    return `${date.toLocaleDateString('ro-RO', optionsDate)} ${date.toLocaleTimeString('ro-RO', optionsTime)}`;
}

function openModal(bpId) {
    modalShow.value = true;
    modalTitle.value = 'Confirmare stergere';

    const bpArray = bloodPressures.value.filter(b => b.id == bpId);
    const bp = bpArray[0];
    modalMessage.value = "Doriti stergerea inregistrarii din data " + convertDate(bp.date);

    confirmDelete = () => deleteBp(bpId);
}

async function deleteBp(bpId) {
    const data = await deleteBloodPressure(bpId);
    
    if(data === 200) {
        modalShow.value = false;
        bloodPressures.value = bloodPressures.value.filter(bp => bp.id !== bpId);
    }
}

function closeDialog() {
    modalShow.value = false;
    filterModalShow.value = false;
}

const buttonText = ref('Adauga');

function updateButtonText() {
    if (window.innerWidth < 500 || window.innerWidth > 700) {
        buttonText.value = 'Adauga inregistrare';
    } else {
        buttonText.value = 'Adauga';
    }
}

onMounted(() => {
    updateButtonText(); 
    window.addEventListener('resize', updateButtonText);
});
</script>

<template>
    <div class="page" v-if="isAuthenticated">
        <CustomNavbar />
        <div class="content">
            <div v-if="isLoading" class="loading-animation">
                <CustomLoader size="100" />
            </div>
            <div class="history-section">
                <div class="header">
                    <p class="title"> Istoric inregistrari tensiune: <i> {{ userEmail }} </i></p>
                    <CustomButton class="add-button" @click="() => router.push('add-bloodpressure')"> {{buttonText}} </CustomButton>
                </div>

                <div class="date-inputs">
                    <div class="input-group">
                        <label for="fromDate">Inceput</label>
                        <CustomInput 
                            v-model="fromDate"
                            :type="'date'"
                            name="fromDate"
                            class="custom-input"
                        />
                    </div>
                    <div class="input-group">
                        <label for="toDate">Final</label>
                        <CustomInput 
                            v-model="toDate"
                            :type="'date'"
                            name="toDate"
                            class="custom-input"
                        />
                    </div>
                    <CustomButton class="filter-button" @click="filterByDate"> Filtrare </CustomButton>
                    <CustomModal
                        :open="filterModalShow"
                        :forConfirmation="false"
                        :title="filterModalTitle"
                        :message="filterModalMessage"
                        @close="closeDialog"
                    />
                </div>

                <div class="list" v-if="!noTrackings">
                    <div v-for="bp in bloodPressures" :key="bp.id" class="bp-container">
                        <BloodPressureCard
                            :systolic="bp.systolic"
                            :diastolic="bp.diastolic"
                            :pulse="bp.pulse"
                            :date="bp.date"
                            :bloodPressureType="bp.bloodPressureType"
                            @click="toggleButtons(bp.id)"
                        />
                        <div v-if="selectedBpId === bp.id" class="buttons">
                            <CustomButton class="button-element" @click="openModal(bp.id)"> <i class="fas fa-trash-alt"></i> </CustomButton>
                            <CustomButton class="button-element" v-if="bp.isEditable" @click="editBp(bp.id)"><i class="fas fa-pencil-alt"></i></CustomButton>
                        </div>

                        <CustomModal
                            :open="modalShow"
                            :forConfirmation="true"
                            :title="modalTitle"
                            :message="modalMessage"
                            @cancel="closeDialog"
                            @confirm="confirmDelete"
                        />
                    </div>
                    
                    <div v-if="totalPages > 1">
                        <Pagination 
                            :totalPages="totalPages"
                            :currentPage="currentPage"
                            @changePage="changePage"
                            class="pagination-component"
                        />
                    </div>
                    
                </div>
                <div v-else class="not-found">
                   <p> Nu au fost gasite inregistrari ale tensiunii. </p>
                </div>
                
            </div>
            <div class="statistics-panel">
                <LineChartComponent :bloodPressureData="bloodPressures"/>
            </div>
        </div>
    </div>
    <div v-else>
        <NotAuthenticatedView />
    </div>
</template>

<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: rgb(255, 255, 255);
    overflow-y: hidden;
}

.not-authenticated {
    height: 100vh;
    width: 100vw;
    background-color: darkred;
    overflow-y: hidden;
}

.loading-animation {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.5); 
    z-index: 1000; /* is positioned above other components */
}

.content {
    display: grid;
    height: 100%;
    grid-template-columns: 1fr 1fr;
}

.history-section {
    background-color: rgb(227, 227, 227);
    padding: 15px;
    overflow-y: auto;
    position: relative;
    scrollbar-width: thin; 
    scrollbar-color: #c9c9c9 #ececec;
}

.header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center; 
    padding: 10px; 
}

.title {
    font-size: 15px; 
    color: rgb(163, 2, 2);
    margin: 0; 
    font-weight: bold;
    font-family: Georgia, serif;
}

.add-button {
    background-color: rgb(163, 2, 2);
    color: white;
    height: 40px;
    width: 100%;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    margin-left: 5px;
    margin-right: 10px;
}

.date-inputs {
    display: grid;
    grid-template-columns: 30% 30% 40%;
    gap: 10px; 
    margin-bottom: 10px;
}

.input-group {
    display: flex;
    flex-direction: column;
}

.input-group label {
    margin-bottom: 5px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    font-weight: bold;
}

.filter-button {
    background-color: white;
    color: rgb(163, 2, 2);
    height: 40px;
    width: 60%;
    margin-top: 15px;
    font-weight: bold;
    border: 1px solid rgb(163, 2, 2);
    border-radius: 10px;
    font-size: 13px;
}

.filter-button:hover {
    background-color: rgb(255, 247, 247);
    font-size: 14px;
}

.bp-container {
    display: grid;
    grid-template-columns: fit-content(80%) min-content;
    margin-left: 25%;
    align-items: start; 
    margin-bottom: 20px; 
    gap: 0px; 
}

.buttons {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 2px;
}

.button-element {
    border-radius: 6px;
    border: 1px solid gray;
    color: darkred;
    background-color: white;
    height: 30px;
    width: 40px;
}

.list {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.not-found {
    display: flex;
    justify-content: center;
    align-items: center; 
    height: 100%;
    text-align: center;
    color: darkred;
    font-size: 17px;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
}

.statistics-panel {
    background-color: rgb(240, 240, 240);
    padding: 15px;
}

.pagination-component {
    width: 100%;
    text-align: center;
    padding: 10px 0; 
    background-color: inherit;
    position: absolute;
    bottom: 0;
    z-index: 100; 
    margin-top: auto;
    margin-bottom: 20px;
}


@media (max-width: 1000px) and (min-width: 610px) {
    .history-section {
        overflow-y: auto;
        scrollbar-width: thin; 
        scrollbar-color: #c9c9c9 #ececec;
    }
    
    .bp-container {
        margin-left: 10%;
    }
}

@media(max-width: 600px) {
    .content {
        grid-template-columns: 1fr;
        grid-template-rows: 55% 45%;
    }
    
    .history-section {
        overflow-y: auto;
        scrollbar-width: thin; 
        scrollbar-color: #c9c9c9 #ececec;
    }
    
    .bp-container {
        margin-left: 10%;
    }
    
    .header {
        grid-template-columns: 1fr;
    }
    
    .add-button {
        margin: 10px auto;
    }
}

</style>