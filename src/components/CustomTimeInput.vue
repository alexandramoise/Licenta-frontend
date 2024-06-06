<template>
    <div class="time-picker">
      <input v-model="timeInput" @input="updateTimeFromInput" placeholder="HH:MM" maxlength="5" />
      <div class="clock">
        <div v-for="n in 12" :key="n" class="number" :style="getNumberStyle(n)">
          {{ n }}
        </div>
        <div class="hand hour-hand" :style="hourHandStyle"></div>
        <div class="hand minute-hand" :style="minuteHandStyle"></div>
        <div class="center-dot"></div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  
  export default {
    setup() {
      const timeInput = ref('12:00');
      const hours = ref(12);
      const minutes = ref(0);
  
      const updateTimeFromInput = () => {
        const [h, m] = timeInput.value.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
          hours.value = h;
          minutes.value = m;
        }
      };
  
      const getNumberStyle = (n) => {
        const angle = (n - 3) * 30;
        const radius = 80;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);
        return {
          transform: `translate(${x}px, ${y}px)`,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transformOrigin: 'center',
        };
      };
  
      const hourHandStyle = computed(() => ({
        transform: `rotate(${(hours.value % 12) * 30}deg)`,
      }));
  
      const minuteHandStyle = computed(() => ({
        transform: `rotate(${minutes.value * 6}deg)`,
      }));
  
      return {
        timeInput,
        hours,
        minutes,
        updateTimeFromInput,
        getNumberStyle,
        hourHandStyle,
        minuteHandStyle,
      };
    },
  };
  </script>
  
  <style scoped>
  .time-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  input {
    width: 80px;
    padding: 10px;
    font-size: 18px;
    text-align: center;
    margin-bottom: 20px;
    border: 1px solid #000;
    border-radius: 4px;
  }
  
  .clock {
    position: relative;
    width: 200px;
    height: 200px;
    border: 10px solid #333;
    border-radius: 50%;
    background: #f5f5f5;
  }
  
  .number {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    font-size: 18px;
    font-weight: bold;
  }
  
  .hand {
    position: absolute;
    bottom: 50%;
    left: 50%;
    width: 50%;
    height: 6px;
    background: #333;
    transform-origin: 0% 100%;
    transition: transform 0.5s ease-in-out;
  }
  
  .hour-hand {
    height: 8px;
  }
  
  .minute-hand {
    height: 4px;
    background: #666;
  }
  
  .center-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #333;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  </style>
  