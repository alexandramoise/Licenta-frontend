<script setup>
import { ref, watch, onMounted, capitalize } from 'vue';
import { getBloodPressures } from "../services/bloodpressure_service.js";

import DateFiltering from '@/components/DateFiltering.vue';
import LineChartComponent from '@/components/charts/LineChartComponent.vue';

import { getStatisticsForOnePatient } from '@/services/statistics_service.js'
import DonutChartComponent from './charts/DonutChartComponent.vue';

const props = defineProps({
    patientEmail: {
        type: String,
        required: true,
    },
    patientName: {
        type: String,
        required: true,
    }
});

const fromDate = ref(null);
const toDate = ref(null);
const bloodPressures = ref([]);

watch(
    () => [props.patientEmail, fromDate.value, toDate.value],
    async ([newEmail, newFromDate, newToDate]) => {
        if (newEmail) {
            await fetchBloodPressures();
            await fetchStatisticsForPatient(newEmail);
        }
    },
    { deep: true }
);

function filterByDate({ fromDate: from, toDate: to }) {
    fromDate.value = from;
    toDate.value = to;

    fetchBloodPressures();
}

async function fetchBloodPressures() {
    
    const data = await getBloodPressures(props.patientEmail, fromDate.value, toDate.value, 2000, 0);
 
    if(data && data.content) {
        if(data.content.length !== 0) {
            bloodPressures.value = data.content.map(b => b);
        } else {
            bloodPressures.value = [];
        }
    } else {
        console.error("No content returned from the API");
    }
}

onMounted(() => {
    fetchBloodPressures();
    fetchStatisticsForPatient(props.patientEmail);
});

const conditions = ref({
    name: '',
    increasesBp: false,
    reducesBp: false
});

const favoringConditions = ref({
    totalConditions: 0,
    conditionsFavoringHypertension: 0,
    conditionsFavoringHypotension: 0,
});

const favoringCondition = ref('');

const averageValues = ref({
    averageSystolic: 0,
    averageDiastolic: 0,
    averagePulse: 0,
});

const numberOfVisits = ref(0);

async function fetchStatisticsForPatient(email) {
    const statisticsData = await getStatisticsForOnePatient(email, fromDate.value, toDate.value);
    averageValues.value.averageSystolic = statisticsData.averageSystolic;
    averageValues.value.averageDiastolic = statisticsData.averageDiastolic;
    averageValues.value.averagePulse = statisticsData.averagePulse;

    conditions.value = statisticsData.conditions.map(condition => ({
        name: condition.name,
        increasesBp: condition.increasesBP,
        reducesBp: condition.reducesBP
    }));

    favoringConditions.value = {
        totalConditions: statisticsData.conditions.length,
        conditionsFavoringHypertension: statisticsData.conditionsFavoringHypertension,
        conditionsFavoringHypotension: statisticsData.conditionsFavoringHypotension
    }

    favoringCondition.value = statisticsData.favoringCondition;
    numberOfVisits.value = statisticsData.numberOfVisits;
}

function convertDate(originalDate) {
    const date = new Date(originalDate);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('ro-RO', options);
}

function convertDateToSuitableFormat(originalDate) {
    const date = new Date(originalDate);
    const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit' };
    return `${date.toLocaleDateString('ro-RO', optionsDate)} ${date.toLocaleTimeString('ro-RO', optionsTime)}`;
}

function exportToCsv() {
    const csvHeader = 'DATA;SISTOLIC;DIASTOLIC;PULS;TIP\n';
    const csvRows = bloodPressures.value.map(bp => {
        let date = convertDateToSuitableFormat(bp.date);
        let tendencyTranslation = '';

        switch(bp.bloodPressureType) {
            case 'Hypotension':
                tendencyTranslation = 'Hipotensiune';
                break;
            case 'Normal':
                tendencyTranslation = 'Normala';
                break;
            case 'Hypertension':
                tendencyTranslation = 'Hipertensiune';
                break;
        }

        return `${date};${bp.systolic};${bp.diastolic};${bp.pulse};${tendencyTranslation}`;
    });

    const csvContent = csvHeader + csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    let csvFileName = "tensiuni " + props.patientEmail;
    if (fromDate.value !== null && fromDate.value !== '') {
        csvFileName += " de la " + fromDate.value;
    } 

    if (toDate.value !== null && toDate.value !== '') {
        csvFileName += " pana la " + toDate.value;
    } 

    csvFileName += '.csv';

    link.setAttribute('download', csvFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

</script>

<template>
    <div class="statistics-panel">
        <p class="statistics-header"> Statistica {{ props.patientName }}
            <span v-if="fromDate!== null && fromDate !== ''"> incepand cu {{ convertDate(fromDate) }}</span> 
            <span v-if="toDate!== null && toDate !== ''"> pana la {{ convertDate(toDate) }}</span> 
        </p>

        <DateFiltering @filter-dates="filterByDate" />

        <div v-if="bloodPressures.length > 0">
            <LineChartComponent :bloodPressureData="bloodPressures" />
            <div class="file-container">
                <span class="file-message"> Salvati valoriile tensiunii intr-un fisier .CSV </span>
                <CustomButton class="export-button" @click="exportToCsv"> Creeaza fisier </CustomButton>
            </div>
        </div>
        <div v-else class="not-found">
            <p> {{ props.patientEmail }} nu are tensiuni înregistrate. </p>
        </div>

        <div class="medium-values-table">
                <table>
                    <thead>
                        <tr>
                            <th>Sistolic - val. medie</th>
                            <th>Diastolic - val. medie</th>
                            <th>Puls - val. medie </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td> {{ averageValues.averageSystolic }}</td>
                            <td> {{ averageValues.averagePulse }}</td>
                            <td> {{ averageValues.averagePulse }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        <div v-if="conditions.length > 0">
            <div class="conditions-list">
                <p class="favoring-condition-message">Afecțiuni:</p>
                <ul>
                    <li v-for="condition in conditions" :key="condition.name" :style="{backgroundColor: condition.increasesBp ? 'rgba(255, 112, 77, 0.6)' : 'rgba(128, 229, 255, 0.6)'}">
                        {{ condition.name }} <span style="float: right"> <i>  {{ condition.increasesBp ? 'crește' : 'reduce' }} </i> tensiunea </span>
                    </li>
                </ul>
            </div>

                <DonutChartComponent
                    class="chart"
                    :dataDistribution="favoringConditions"
                    :labels="['favorizeaza hipertensiunea', 'favorizeaza hipertensiunea']"
                    :colors="['#ff704d', '#80e5ff']"
                />
        </div>
        <div v-else class="not-found">
            <p> {{ props.patientEmail }} nu are afecțiuni adăugate. </p>
        </div> 

        <div class="favoring-condition-message">
            <p v-if="conditions.length > 0">Tendința favorizată: <i> {{ favoringCondition }} </i> </p>
            <p> Număr vizite: {{ numberOfVisits }} {{ fromDate !== null && fromDate !== '' ? ' de la ' + convertDate(fromDate) : "" }} {{ toDate !== null && toDate !== '' ? ' până la ' + convertDate(toDate) : " până acum"}}</p>
        </div>

    </div>
</template>

<style scoped>
.statistics-panel {
    background-color: rgb(240, 240, 240);
    height: 100vh;
    padding: 15px;
    overflow-y: hidden;
}

.statistics-header {
    text-align: center; 
    font-family: Georgia, serif;
    font-size: 22px;
}

.not-found {
    display: flex;
    justify-content: center;
    align-items: center; 
    height: 20%;
    text-align: center;
    font-size: 18px;
    color: darkred;
    font-weight: 600;
    font-family: Arial, Helvetica, sans-serif;
}

.file-container {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.file-message {
    font-size: 15px;
    font-weight: bold;
    color: #4a4a4a;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
}

.export-button {
    background-color: #e6f9e6;
    color: #28a745;
    font-weight: bold;
    border: 2px solid #28a745;
    border-radius: 8px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
}

.export-button:hover {
    background-color: #ccf2cc;
}

.chart {

    margin: auto;
}

.medium-values-table {
    margin: 20px auto;
    text-align: center;
}

table {
    margin: 0 auto;
    border-collapse: collapse;
    width: 100%;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}

th {
    background-color: #f6f6f6;
    font-weight: bold;
}

tr {
    background-color: #f2f2f2;
}

tr:hover {
    background-color: #f1f1f1;
}

ul {
    list-style-type: none;
    padding: 0;
}

ul li {
    background: #fcfcfcc6;
    font-size: 18px;
    font-family: 'Times New Roman', Times, serif;
    margin: 5px 0;
    padding: 10px;
    border-radius: 5px;
    width: 95%;
}

.favoring-condition-message {
    margin-top: 20px;
    text-align: center;
    font-size: 18px;
    font-family: Georgia, serif;
}
</style>
