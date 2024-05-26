<!-- BarChartComponent.vue -->
<template>
    <BarChart :style="'height: 95%;'" :chart-data="chartData" :options="chartOptions" />
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';
import { defineChartComponent } from 'vue-chart-3';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
  BarController
} from 'chart.js';

ChartJS.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

const BarChart = defineChartComponent('bar-chart', 'bar');

const props = defineProps({
  bpDistributionData: {
    type: Object,
    required: true
  },
  labels: {
    type: Array,
    required: true
  },
});

// Initialize chart data
const chartData = ref({
  labels: props.labels,
  datasets: [
    {
      label: 'Procent din numarul total de pacienti',  // Set a meaningful label for the dataset
      backgroundColor: ["red", "#99ff99", "#80e5ff"],
      borderColor: ["red", "#99ff99", "#80e5ff"],
      borderWidth: 1,
      data: []
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: true
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
    title: {
      display: true,
      text: 'Numar pacienti: 0'  // Set initial title text
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
});

watch(() => props.bpDistributionData, (newData) => {
  if (newData) {
    chartData.value.labels = props.labels; // Ensure labels are updated
    chartData.value.datasets[0].data = [
      newData.hypertensivePercentage,
      newData.normalPercentage,
      newData.hypotensivePercentage
    ];
    chartOptions.value.plugins.title.text = 'Numar pacienti: ' + newData.totalPatients;
  }
}, { immediate: true });

</script>

<style scoped>
</style>
