<script setup>
import { ref, watch } from 'vue';

import DateFiltering from '@/components/DateFiltering.vue'
import BarChartComponent from '@/components/charts/BarChartComponent.vue';
import PieChartComponent from '@/components/charts/PieChartComponent.vue';

import { getStatisticsForList } from '@/services/statistics_service.js'

const props = defineProps({
    patients: {
        type: Array,
        required: true,
    },
});

const fromDate = ref(null);
const toDate = ref(null);

const bpDistribution = ref({
    totalPatients: 0,
    hypertensivePercentage: 0,
    normalPercentage: 0,
    hypotensivePercentage: 0
});

const genders = ["Feminin", "Masculin", "Altele"];
const genderColors = ['#ff80bf', '#4da6ff', '#a6a6a6'];
const genderDistribution = ref({
    totalPatients: 0,
    "women": 0,
    "men": 0, 
    "other": 0
});

const bpTypes = ["Hipertensiv", "Normal", "Hipotensiv"];
const bpColors = ["#ff704d", "#99ff99", "#80e5ff"];

const womenBpDistribution = ref({
    totalPatients: 0,
    womenWithHypertension: 0,
    womenWithNormal: 0,
    womenWithHypotension: 0,
});
const menBpDistribution = ref({
    totalPatients: 0,
    menWithHypertension: 0,
    menWithNormal: 0,
    menWithHypotension: 0,
}); 

const minBp = ref({
    systolic: 0,
    diastolic: 0,
});

const maxBp = ref({
    systolic: 0,
    diastolic: 0,
});

const patientMinBp = ref('');
const patientMaxBp = ref('');
const maxVisits = ref(null);
const patientMaxVisits = ref('');

watch(
    () => [fromDate.value, toDate.value, props.patients],
    ([newFromDate, newToDate, newPatients]) => {
        console.log("LISTA IN WATCH: ", newPatients);
        fetchStatistics(newPatients, newFromDate, newToDate);
    },
    { immediate: true, deep: true }
);

function filterByDate({ fromDate: from, toDate: to }) {
    fromDate.value = from;
    toDate.value = to;
    fetchStatistics(props.patients, fromDate.value, toDate.value);
}

function convertDate(originalDate) {
    const date = new Date(originalDate);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('ro-RO', options);
}

const emptyStats = ref(false);
async function fetchStatistics(patientList, from, to) {
    const statisticsData = await getStatisticsForList(patientList, from, to);

    bpDistribution.value = {
        totalPatients: statisticsData.totalNumberOfPatients,
        hypertensivePercentage: statisticsData.hypertensivePercentage,
        normalPercentage: statisticsData.normalPercentage,
        hypotensivePercentage: statisticsData.hypotensivePercentage
    };

    genderDistribution.value = {
        totalPatients: statisticsData.totalNumberOfPatients,
        women: statisticsData.women,
        men: statisticsData.men,
        other: statisticsData.other
    }

    womenBpDistribution.value = {
        totalPatients: statisticsData.women,
        womenWithHypertension: statisticsData.womenWithHypertension,
        womenWithNormal: statisticsData.womenWithNormal,
        womenWithHypotension: statisticsData.womenWithHypotension,
    }

    menBpDistribution.value = {
        totalPatients: statisticsData.men,
        menWithHypertension: statisticsData.menWithHypertension,
        menWithNormal: statisticsData.menWithNormal,
        menWithHypotension: statisticsData.menWithHypotension,
    }

    minBp.value = {
        systolic: statisticsData.minBp.systolic,
        diastolic: statisticsData.minBp.diastolic
    }
    patientMinBp.value = statisticsData.patientWithMinBloodPressure;

    maxBp.value = {
        systolic: statisticsData.maxBp.systolic,
        diastolic: statisticsData.maxBp.diastolic
    }
    patientMaxBp.value = statisticsData.patientWithMaxBloodPressure;

    maxVisits.value = statisticsData.maxVisits;
    patientMaxVisits.value = statisticsData.patientWithMostVisits;
    console.log("AFISEZ: ", patientMaxVisits.value);
}
</script>

<template>
    <div class="statistics-panel">
        <p class="statistics-header"> Statistici 
            <span v-if="fromDate!== null && fromDate !== ''"> incepand cu {{ convertDate(fromDate) }}</span> 
            <span v-if="toDate!== null && toDate !== ''"> pana la {{ convertDate(toDate) }}</span> 
        </p>

        <DateFiltering 
            @filter-dates="filterByDate"
        />

        <div class="charts-container">
            <div class="bar-chart">
                <BarChartComponent :bpDistributionData="bpDistribution" :labels="bpTypes" />
            </div>
            <div class="pie-charts">
                <PieChartComponent
                    propertyShown="gender"
                    :dataDistribution="genderDistribution"
                    :labels="genders"
                    :colors="genderColors"
                />
                <PieChartComponent v-if="womenBpDistribution.totalPatients > 0"
                    propertyShown="womenDistribution"
                    :dataDistribution="womenBpDistribution"
                    :labels="bpTypes"
                    :colors="bpColors"
                />
                <PieChartComponent v-if="menBpDistribution.totalPatients > 0"
                    propertyShown="menDistribution"
                    :dataDistribution="menBpDistribution"
                    :labels="bpTypes"
                    :colors="bpColors"
                />
            </div>
        </div>
        <div class="extreme-values-table">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Minim</th>
                            <th>Maxim</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Nume pacient</td>
                            <td>{{ patientMinBp }}</td>
                            <td>{{ patientMaxBp }}</td>
                        </tr>
                        <tr>
                            <td>Valoare tensiune</td>
                            <td>{{ minBp.systolic }}/{{ minBp.diastolic }}</td>
                            <td>{{ maxBp.systolic }}/{{ maxBp.diastolic }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="most-visits">
                <b>Pacientul cu cele mai multe vizite:</b>
                <p>{{ patientMaxVisits }} - {{ maxVisits }} vizite {{ fromDate !== null && fromDate !== '' ? ' de la ' + convertDate(fromDate) : "" }} {{ toDate !== null && toDate !== '' ? ' până la ' + convertDate(toDate) : " până acum"}}</p>
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

.charts-container {
    display: grid;
    grid-template-rows: 1.5fr 1fr; 
    gap: 10px;
}

.bar-chart {
    grid-row: 1;
    height: 100%; 
}

.pie-charts {
    display: flex;
    gap: 20px;
    height: 100%; 
}

.pie-charts > * {
    flex: 1;
    height: 100%;
}

.extreme-values-table {
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

.most-visits {
    margin: auto;
    text-align: center;
    font-size: 17px;
    background-color: #f6f6f6;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 70px;
}
</style>