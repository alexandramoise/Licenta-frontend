<template>
    <div>
      <LineChart :chart-data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
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
  
  const chartData = ref({
    labels: [],
    datasets: [
      {
        label: 'Systolic',
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
      }
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
  
  import { getBloodPressures } from '@/services/bloodpressure_service.js';
  const patientEmail = localStorage.getItem('user');
  
  async function fetchChartData() {
    try {
      const data = await getBloodPressures(patientEmail);
      if (data && data.length) {
        chartData.value.labels = data.map(dp => new Date(dp.date).toLocaleDateString());
        chartData.value.datasets[0].data = data.map(dp => dp.systolic);
        chartData.value.datasets[1].data = data.map(dp => dp.diastolic);
      }
    } catch ( error) {
      console.error("Failed to fetch chart data:", error);
    }
  }
  
  onMounted(fetchChartData);
  </script>
  