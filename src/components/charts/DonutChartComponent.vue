<template>
  <div>
    <DonutChart :chart-data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';
import { defineChartComponent } from 'vue-chart-3';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  PieController
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  PieController
);

const DonutChart = defineChartComponent('donut-chart', 'pie');

const props = defineProps({
  dataDistribution: {
    type: Object,
    required: true
  },
  labels: {
    type: Array,
    required: true
  },
  colors: {
    type: Array,
    required: true
  }
});

// Initialize chart data
const chartData = ref({
  labels: props.labels,
  datasets: [
    {
      label: 'Procent din numarul total de afectiuni',
      backgroundColor: props.colors,
      borderColor: props.colors,
      borderWidth: 1,
      data: []
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  cutout: '50%', // Set the cutout to create the donut effect
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
      text: 'Total Afectiuni: 0'
    }
  }
});

watch(() => props.dataDistribution, (newData) => {
  if (newData) {
    chartData.value.datasets[0].data = [
      newData.conditionsFavoringHypertension,
      newData.conditionsFavoringHypotension,
    ];
    chartOptions.value.plugins.title.text = 'Numar afectiuni: ' + newData.totalConditions;
  }
}, { immediate: true });

</script>

<style scoped>
div {
  height: 32vh;
}
</style>
