<script setup>
import { ref, watch, onMounted } from 'vue';
import { getBloodPressures } from "../services/bloodpressure_service.js";
import DateFiltering from '@/components/DateFiltering.vue';
import LineChartComponent from '@/components/charts/LineChartComponent.vue';

const props = defineProps({
    patientEmail: {
        type: String,
        required: true,
    },
});

const fromDate = ref(null);
const toDate = ref(null);
const bloodPressures = ref([]);

watch(
    () => [props.patientEmail, fromDate.value, toDate.value],
    async ([newEmail, newFromDate, newToDate]) => {
        if (newEmail) {
            await fetchBloodPressures();
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
});


function convertDate(originalDate) {
    const date = new Date(originalDate);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('ro-RO', options);
}

</script>

<template>
    <div class="statistics-panel">
        <p class="statistics-header"> Statistica {{ props.patientEmail }}
            <span v-if="fromDate!== null && fromDate !== ''"> incepand cu {{ convertDate(fromDate) }}</span> 
            <span v-if="toDate!== null && toDate !== ''"> pana la {{ convertDate(toDate) }}</span> 
        </p>

        <DateFiltering @filter-dates="filterByDate" />

        <div v-if="bloodPressures.length > 0">
            <LineChartComponent :bloodPressureData="bloodPressures" />
        </div>
        <div v-else>
            <p> {{ props.patientEmail }} nu are tensiuni inregistrate. </p>
        </div>
    </div>
</template>

<style scoped>
.statistics-header {
    text-align: center; 
    font-family: Georgia, serif;
    font-size: 22px;
}
</style>
