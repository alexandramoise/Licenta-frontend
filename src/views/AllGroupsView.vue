<script setup>
import CustomNavbar from '@/components/CustomNavbar.vue';
import CustomLoader from '@/components/CustomLoader.vue';
import { ref, watch, computed, onMounted } from 'vue';
import router from "@/router";

import { getAllClusters } from '@/services/clustering_service.js';

import NotAuthenticatedView from './NotAuthenticatedView.vue';
import NotAllowedView from "./NotAllowedView.vue";

// checking whether or not the user is authenticated based on the token's existence and expiration
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
onMounted(() => {
    currentDate.value = new Date();
    token.value = localStorage.getItem("token");
    availableUntil.value = localStorage.getItem("availableUntil");
    if(localStorage.getItem("role") !== "doctor") {
        notAllowed.value = true;
    }
});

const clusters = ref([]);
const isLoading = ref(false);

async function loadClusters() {
    if(isAuthenticated.value && localStorage.getItem("role") === "doctor") {
        isLoading.value = true;
        clusters.value = await getAllClusters();
        isLoading.value = false;
        console.log("S-a facut fetch");
    }
}
onMounted(async () => {
    loadClusters();
});

setInterval(loadClusters, 30000);

function redirectToGroupInfo(patientEmail) {
    console.log("Cluster pentru pacientul: ", patientEmail);
    const encodedEmail = btoa(patientEmail); // encode uri component in base 64
    router.push({
        name: "patient-cluster",
        query: {
            patient: encodedEmail
        }
    });
}

</script>

<template>
    <div v-if="isLoading" class="loading-animation">
        <CustomLoader size="100" />
    </div>

    <div class="page" v-if="isAuthenticated && !notAllowed && !isLoading">
        <CustomNavbar />

        <p class="title"> Grupuri de pacienți cu evoluție similară </p>
        <p class="text"> Apăsați un card pentru detaliile grupului. </p>
        <div class="content">
            <div class="central-line"></div>
            <div class="clusters-container">
                <div 
                    v-for="(cluster, index) in clusters" 
                    :key="cluster.clusterLabel" 
                    @click="redirectToGroupInfo(cluster.patientEmails[0])"
                    :class="['cluster-card', index % 2 === 0 ? 'left' : 'right']">
                    
                    <p class="cluster-label"> Grupul: {{ cluster.clusterLabel + 1 }} <span v-if="cluster.clusterLabel == -1"> - pacienți fără înregistrări ale tensiunii</span></p>
                    <div v-for="(email, index) in cluster.patientEmails" :key="email" class="patient-info">
                        <p> 
                            <strong class="card-label"> Pacient {{ index + 1  }} </strong> <br> <br>
                            <span class="card-label"> <i class="fas fa-user"></i> </span> {{ cluster.patientNames[index] }}
                            <span class="card-label"> <i class="far fa-envelope"></i> </span> {{ email }}</p> 
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="!isAuthenticated">
        <NotAuthenticatedView />
    </div>
    <div v-else-if="isAuthenticated && notAllowed">
        <NotAllowedView />
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

.title {
    color: rgb(153, 7, 7);
    font-size: 1.3rem;
    text-align: center;
    font-family: Georgia, serif;
    font-weight: bold;
    text-decoration: underline;
}

.text {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.1rem;
    font-weight: bold;
    text-align: center;
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding: 20px;
}

.central-line {
    position: absolute;
    width: 2px;
    height: 100%;
    background-color: rgb(153, 7, 7);
    left: 50%;
    transform: translateX(-50%);
}

.clusters-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80%;
    padding: 20px;
    gap: 15px;
    position: relative;
}

.cluster-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px 0 rgba(153, 7, 7, 0.322);
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    width: 42%;
    position: relative;
}

.left {
    align-self: flex-start;
    margin-right: auto;
}

.right {
    align-self: flex-end;
    margin-left: auto;
}

.cluster-card::after {
    content: "";
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border-style: solid;
}

.left::after {
    left: 100%;
    border-width: 40px 0 40px 40px;
    border-color: transparent transparent transparent white;
}

.right::after {
    right: 100%;
    border-width: 40px 40px 40px 0;
    border-color: transparent white transparent transparent;
}

.cluster-label {
    font-size: 1.3em;
    margin-bottom: 10px;
    text-align: center;
    width: 100%;
    color: rgb(153, 7, 7);
}

.card-label {
    font-size: 1.2rem;
    margin-left: 10px;
    color: rgb(153, 7, 7);
}

.patient-info {
    font-size: 1.1rem;
    border-bottom: 1px dotted rgb(153, 7, 7);
    margin-bottom: 5px;
}

@media (max-width: 768px) {

    .central-line {
        display: none;
    }

    .clusters-container {
        flex-direction: column;
        align-items: center;
    }

    .cluster-card {
        width: 100%;
        align-self: center;
    }

    .left, .right {
        margin: auto 30px;
    }

    .cluster-card::after {
        display: none;
    }

    .patient-info {
        font-size: 0.9rem;
    }
}
</style>