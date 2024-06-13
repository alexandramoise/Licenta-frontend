<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import CustomNavbar from '@/components/CustomNavbar.vue';
import CustomLoader from '@/components/CustomLoader.vue';
import SharingDataModal from '../components/SharingDataModal.vue';

import LineChartForClusterComponent from '../components/charts/LineChartForClusterComponent.vue'; 

import NotAuthenticatedView from './NotAuthenticatedView.vue';
import NotAllowedView from './NotAllowedView.vue';

import { getPatientByEmail, patientAcceptsSharingData } from '../services/patient_service.js';
import { getPatientCluster } from '@/services/clustering_service.js';

// Verificarea autentificării
const token = ref(localStorage.getItem("token"));
const availableUntil = ref(localStorage.getItem("availableUntil"));
const currentDate = ref(new Date());

const isAuthenticated = computed(() => {
    if (!token.value) return false;
    const expirationDate = new Date(availableUntil.value);
    return currentDate.value < expirationDate;
});

watch([token, availableUntil], ([newToken, newExpireDate]) => {
    if (newToken === null || newExpireDate === null) {
        isAuthenticated.value = false;
    } else {
        const expirationDate = new Date(newExpireDate);
        const currentDate = new Date();
        isAuthenticated.value = currentDate < expirationDate;
    }
});

const notAllowed = ref(false);
const email = ref('');
const role = localStorage.getItem("role");
const route = useRoute();

const acceptedSharingData = ref(true);
const showTermsAndConditionsModal = ref(false); 

onMounted(async () => {
    currentDate.value = new Date();
    token.value = localStorage.getItem("token");
    availableUntil.value = localStorage.getItem("availableUntil");

    if(role === "doctor") {
        email.value = atob(route.query.patient);
        loadPatientCluster();
    } else if (role === "patient") {
        email.value = localStorage.getItem("user");
        const data = await getPatientByEmail(email.value);

        if (data.acceptedSharingData !== true) {
            showTermsAndConditionsModal.value = true;
            acceptedSharingData.value = false;
        } else {
            loadPatientCluster();
        }
    } else {
        notAllowed.value = true;
    }
});

const cluster = ref(null);
const clusterLabel = ref(0);
const clusterEmails = ref([]);
const clusterNames = ref([]);
const clusterTreatments = ref([]);

const isLoading = ref(false);

async function loadPatientCluster() {
    if (!notAllowed.value) {
        isLoading.value = true;
        try {
            const result = await getPatientCluster(email.value);
            if (result) {
                cluster.value = result;

                clusterLabel.value = cluster.value.clusterLabel + 1;
                clusterEmails.value = cluster.value.patientEmails;
                clusterNames.value = cluster.value.patientNames;
                clusterTreatments.value = cluster.value.treatmentsInTheGroup.flat();

                if (cluster.value.patientEmails && cluster.value.patientNames) {
                    createPatientPairs(cluster.value.patientEmails, cluster.value.patientNames);
                }
            } else {
                console.error("Failed to fetch cluster data.");
            }
        } catch (error) {
            console.error("Error fetching cluster data: ", error);
        } finally {
            isLoading.value = false;
        }
    }
}

setInterval(loadPatientCluster, 60000);

const patientPairs = ref({
    emails: [],
    names: []
});

const createPatientPairs = (patientEmails, patientNamesList) => {
    const pairs = [];
    const namePairs = [];
    for (let i = 0; i < patientEmails.length; i += 2) {
        pairs.push([patientEmails[i], patientEmails[i + 1] || null]);
        namePairs.push([patientNamesList[i], patientNamesList[i + 1] || '']);
    }

    patientPairs.value.emails = pairs;
    patientPairs.value.names = namePairs;
};

async function acceptTermsAndConditions() {
    await patientAcceptsSharingData(email.value);
    acceptedSharingData.value = true;
    showTermsAndConditionsModal.value = false;
    loadPatientCluster();
}

function declineTermsAndConditions() {
    showTermsAndConditionsModal.value = false;
}

function showTermsAndConditionsPopup() {
    showTermsAndConditionsModal.value = true;
}
</script>

<template>
    <div v-if="isLoading" class="loading-animation">
        <CustomLoader size="100" />
    </div>

    <div class="page" v-if="isAuthenticated && !notAllowed">
        <CustomNavbar />
        
        <SharingDataModal
            :show="showTermsAndConditionsModal"
            @accepted-sharing-terms-and-conditions="acceptTermsAndConditions"
            @declined-sharing-terms-and-conditions="declineTermsAndConditions"
        />

        <div class="content" v-if="acceptedSharingData">
            <div class="group-info">
                <p class="cluster-label"> Grupul: {{ clusterLabel }} <span v-if="clusterLabel == -1"> - pacienți fără înregistrări ale tensiunii </span></p>
                <div v-for="(email, index) in clusterEmails" :key="email" class="patient-info">
                    <p> 
                        <strong class="card-label"> Pacient {{ index + 1  }} </strong> <br> <br>
                        <span class="card-label"> <i class="fas fa-user"></i> </span> {{ clusterNames[index] }}
                        <span class="card-label"> <i class="far fa-envelope"></i> </span> {{ email }}</p> 
                </div>

                <div v-if="clusterTreatments.length !== 0">
                    <p class="treatment-group-label"> Tratamente la nivelul grupului </p>
                    <div v-for="treatment in clusterTreatments" :key="treatment.id" class="treatment-info">
                        <p>
                            <strong class="card-label">Pacient:</strong> {{ treatment.patientFirstName }} {{ treatment.patientLastName }}
                            <strong class="card-label">Medicament:</strong> {{ treatment.medicineName }} x {{ treatment.doses }} buc. pe zi
                        </p>
                    </div>
                </div>
                
                <div v-else>
                    <p class="no-treatments"> Niciun membru nu are tratamente în curs. </p>
                </div>
                
            </div>
            <div class="graph-section">
                <p class="graph-label"> Grafice cu înregistrările tensiunii ale pacienților din grup </p>
                <div v-for="(pair, index) in patientPairs.emails" :key="index" class="chart-container">
                    <LineChartForClusterComponent 
                        :patients="pair.filter(p => p !== null)" 
                        :patientNames="patientPairs.names[index].filter(n => n !== '')"
                    />
                </div>
            </div>
        </div>
        
    </div>
    <div v-else-if="!isAuthenticated">
        <NotAuthenticatedView />
    </div>
</template>

<style scoped>
.page {
    height: 100vh;
    width: 100vw;
    background-color: #f5f5f5;
    overflow-y: auto;
    overflow-x: hidden;
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
    grid-template-columns: 40% 60%;
    width: 100%;
    height: 100%;
}

.group-info {
    flex: 0 0 30%;
    padding: 20px;
    box-sizing: border-box;
    background-color: rgb(244, 244, 244);
    border-right: 1px solid #ddd;
    font-size: 1.1rem;
}

.cluster-label {
    font-size: 1.3em;
    margin-bottom: 10px;
    text-align: center;
    width: 90%;
    font-weight: bold;
    color: rgb(153, 7, 7);
}

.treatment-group-label {
    font-size: 1.2em;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    margin-top: 50px;
    margin-bottom: 30px;
    text-align: center;
    font-weight: bold;
    color: rgb(173, 7, 7);
    text-decoration: underline;
    width: 90%;
}

.no-treatments {
    font-size: 1.1em;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    margin-top: 50px;
    text-align: center;
    font-weight: bold;
    color: rgb(173, 7, 7);
    width: 90%;
}

.card-label {
    margin-left: 10px;
    color: rgb(153, 7, 7);
}

.graph-section {
    padding: 20px;
    background-color: rgb(236, 236, 236);
}

.graph-label {
    font-size: 1.3em;
    margin-bottom: 10px;
    text-align: center;
    font-family: Georgia, serif;
}

.chart-container {
    margin: 20px auto;
    width: 90%;
}

@media (max-width: 768px) {
    .content {
        grid-template-columns: 1fr;
        grid-template-rows: 50% 50%;
        overflow-y: hidden;
    }

    .group-info {
        border-right: none;
        border-bottom: 1px solid #ddd;
        overflow-y: auto;
    }

    .graph-section {
        overflow-y: auto;
    }
}
</style>
