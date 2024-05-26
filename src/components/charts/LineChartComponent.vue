<template>
  <div>
    <LineChart :chart-data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { defineChartComponent } from 'vue-chart-3';
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
  bloodPressureData: {
    type: Array,
    required: true,
    default: () => []
  }
});

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Sistolic',
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      data: [],
      fill: false,
    },
    {
      label: 'Diastolic',
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      data: [],
      fill: false,
    }, 
  ]
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
    y: {
      beginAtZero: true
    }
  }
};

// watch for changes in bloodPressureData prop and update chart data accordingly
watch(() => props.bloodPressureData, (newData) => {
  //props.bloodPressureData.reverse();
  if (newData && newData.length) {
    chartData.value.labels = newData.map(dp => new Date(dp.date).toLocaleDateString());
    chartData.value.datasets[0].data = newData.map(dp => dp.systolic);
    chartData.value.datasets[1].data = newData.map(dp => dp.diastolic);
  }
}, { immediate: true });

</script>
