<!-- PieChartComponent.vue -->
<template>
  <div>
    <PieChart :chart-data="chartData" :options="chartOptions" />
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

const PieChart = defineChartComponent('pie-chart', 'pie');

const props = defineProps({
  propertyShown: {
    type: String,
    required: true
  },
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
      label: 'Procent din numarul total de pacienti',
      backgroundColor: props.colors,
      borderColor: props.colors,
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
      text: 'Total Patients: 0'
    }
  }
});

watch(() => props.dataDistribution, (newData) => {
  if (newData) {
    if (props.propertyShown === "gender") {
      chartData.value.datasets[0].data = [
        newData.women,
        newData.men,
        newData.other
      ];
      chartOptions.value.plugins.title.text = 'Numar pacienti: ' + newData.totalPatients;
    } else if (props.propertyShown === "womenDistribution") {
      chartData.value.datasets[0].data = [
        newData.womenWithHypertension,
        newData.womenWithNormal,
        newData.womenWithHypotension
      ];
      chartOptions.value.plugins.title.text = 'Numar femei: ' + newData.totalPatients;
    } else if (props.propertyShown === "menDistribution") {
      chartData.value.datasets[0].data = [
        newData.menWithHypertension,
        newData.menWithNormal,
        newData.menWithHypotension
      ];
      chartOptions.value.plugins.title.text = 'Numar barbati: ' + newData.totalPatients;
    }
  }
}, { immediate: true });

</script>

<style scoped>
</style>
