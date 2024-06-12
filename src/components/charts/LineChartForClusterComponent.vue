<template>
  <div>
    <line-chart :chart-data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { defineChartComponent } from 'vue-chart-3';
import { getBloodPressures } from '@/services/bloodpressure_service.js';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LineController
} from 'chart.js';

ChartJS.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Define the LineChart component
const LineChart = defineChartComponent('line-chart', 'line');

const props = defineProps({
  patients: {
    type: Array,
    required: true
  }, 
  patientNames: {
    type: Array,
    required: true
  }
});

const chartData = ref({
  labels: [],
  datasets: []
});

const chartOptions = {
  responsive: true,
  plugins: {
    tooltip: {
      mode: 'index',
      intersect: false,
    },
    legend: {
      display: true
    }
  },
  scales: {
    x: {
      display: false // Ascunde etichetele de pe axa Ox
    },
    y: {
      beginAtZero: false
    }
  }
};

const fetchBloodPressureData = async () => {
  const datasets = [];
  const labels = new Set();

  for (let i = 0; i < props.patients.length; i++) {
    const email = props.patients[i];
    const name = props.patientNames[i];

    const data = await getBloodPressures(email, null, null, 50, 0);
    console.log("EMAIL: ", email, " VALORI: ", data.content);

    if (data && data.content) {
      const hue = (i * 30) % 360; 
      const systolicData = {
        label: `Sistolic - ${name}`,
        borderColor: `hsl(${hue}, 70%, 50%)`,
        backgroundColor: `hsl(${hue}, 70%, 50%)`,
        data: data.content.map(dp => {
          labels.add(new Date(dp.date).toLocaleDateString());
          return dp.systolic;
        }),
        fill: false,
      };

      const diastolicData = {
        label: `Diastolic - ${name}`,
        borderColor: `hsl(${hue + 180}, 70%, 50%)`, // Folosirea unei culori complementare
        backgroundColor: `hsl(${hue + 180}, 70%, 50%)`,
        data: data.content.map(dp => dp.diastolic),
        fill: false,
      };

      datasets.push(systolicData, diastolicData);
    }
  }

  chartData.value.labels = Array.from(labels).sort((a, b) => new Date(b) - new Date(a));
  chartData.value.datasets = datasets;
};

onMounted(() => {
  fetchBloodPressureData();
});

watch(() => [props.patients, props.patientNames], () => {
  fetchBloodPressureData();
}, { immediate: true });
</script>

<style scoped>
/* Add any custom styles for your chart component here */
</style>
