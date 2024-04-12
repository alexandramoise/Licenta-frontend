<template>
    <div class="date-picker">
    <!-- Display the selected date and a button to clear it -->
    <div v-if="selectedDate" class="selected-date">
      <button @click="clearDate" class="clear-date-button">Clear Date</button>
    </div>
    
    <!-- Buttons to navigate months or select year -->
    <div class="controls">
      <button @click="previous" class="control-button">&lt;</button>
      <button @click="toggleYearView" class="month-year-label">
        <!-- Show only the month and year when monthView is true -->
        <span v-if="monthView">
          {{ currentMonth.toDateString() }}
        </span>
        <!-- Show a range of years when monthView is false -->
        <span v-else>
          {{ yearRange[0] }} - {{ yearRange[yearRange.length - 1] }}
        </span>
      </button>
      <button @click="next" class="control-button">&gt;</button>
    </div>
    
    <div v-if="monthView" class="calendar-grid">
    <!-- Calendar header -->
    <div class="day header" v-for="day in weekDays" :key="day">{{ day }}</div>
    
    <!-- Empty slots for days before the first day of the current month -->
    <div class="day empty" v-for="empty in emptyDaysBefore" :key="`empty-${empty}`"></div>
    
    <!-- Current month's days -->
    <div 
      class="day" 
      v-for="day in daysInMonth" 
      :key="day"
      :class="{ 'selected': isSelected(day) }" 
      @click="selectDate(day)"
    >
      {{ day }}
    </div>
    
    <!-- Empty slots for days after the last day of the current month -->
    <div class="day empty" v-for="empty in emptyDaysAfter" :key="`empty-${empty}`"></div>
  </div>
    
    <!-- Year Selection Grid -->
    <div v-else class="years-grid">
      <div 
        class="year" 
        v-for="year in yearRange" 
        :key="year" 
        @click="selectYear(year)"
      >
        {{ year }}
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';

  const emits = defineEmits(["selectedDate"]);
  
  const selectedDate = ref(null);
  const currentMonth = ref(new Date());
  const monthView = ref(true); // State to toggle between month and year view
  const yearRange = computed(() => {
    let startYear = currentMonth.value.getFullYear() - 4;
    let years = [];
    for (let i = 0; i < 9; i++) { // Display a range of 9 years
      years.push(startYear + i);
    }
    return years;
  });
  

// This method takes a Date object and returns a string in the yyyy-mm-dd format
function formatDate(date) {
  if (!date) return '';
  let month = '' + (date.getMonth() + 1),
      day = '' + date.getDate(),
      year = date.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

function selectDate(day) {
  const date = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), day);
  selectedDate.value = date;
  console.log(`Selected Date: ${formatDate(selectedDate.value)}`); // Now logging in yyyy-mm-dd format
  emits("selectedDate", formatDate(selectedDate.value));
}
  // Calculate days in current month
  const daysInMonth = computed(() => {
    const date = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0);
    return new Array(date.getDate()).fill(null).map((_, index) => index + 1);
  });

  
  
  // Calculate the previous month's "empty" days
  const previousMonthDays = computed(() => {
    const startDay = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1).getDay();
    return new Array(startDay).fill(null);
  });

  const emptyDaysBefore = computed(() => {
    const firstDayOfMonth = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1).getDay();
    const emptyDays = firstDayOfMonth === 0 ? 0 : firstDayOfMonth - 1; // Adjust based on your week start day
    return Array.from({ length: emptyDays }, (_, index) => index);
  });

  // Calculate empty slots after the last day of the current month
  const emptyDaysAfter = computed(() => {
    const lastDayOfMonth = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0).getDay();
    const emptyDays = lastDayOfMonth === 6 ? 0 : 6 - lastDayOfMonth; // Adjust based on your week start day
    return Array.from({ length: emptyDays }, (_, index) => index);
  });
  
  const weekDays = ['Lu', 'Ma', 'Mi', 'J', 'Vi', 'Sa','Du'];
  
  function changeMonth(step) {
    currentMonth.value.setMonth(currentMonth.value.getMonth() + step);
    currentMonth.value = new Date(currentMonth.value);
  }
  
  function isSelected(day) {
    if (!selectedDate.value) return false;
    const date = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), day);
    return date.toDateString() === selectedDate.value.toDateString();
  }
  
  // Clear selected date
  function clearDate() {
    selectedDate.value = null;
    emits("selectedDate", null);
  }

  function toggleYearView() {
  monthView.value = !monthView.value;
}

function selectYear(year) {
  currentMonth.value.setFullYear(year);
  monthView.value = true;
}

function previous() {
  if (monthView.value) {
    changeMonth(-1);
  } else {
    changeYearRange(-9);
  }
}

function next() {
  if (monthView.value) {
    changeMonth(1);
  } else {
    changeYearRange(9);
  }
}

function changeYearRange(offset) {
  let startYear = yearRange.value[0] + offset;
  for (let i = 0; i < 9; i++) {
    yearRange.value[i] = startYear + i;
  }
}
  </script>
  
  <style scoped>
  .date-picker {
  font-family: 'Arial', sans-serif;
  user-select: none;
  -webkit-user-select: none;
  width: 280px; /* Adjust the width as necessary */
  margin: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.controls button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.day {
  padding: 10px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.day:hover {
  background-color: #f0f0f0;
}

.other-month {
  color: #ccc;
}

.selected {
  background-color: #007bff;
  color: white;
  border-radius: 50%;
}

/* Header styles */
.date-picker span {
  font-weight: bold;
}

.clear-date-button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #ff0000;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
  }

  .clear-date-button:hover {
    background-color: #cc0000;
  }

  .years-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    text-align: center;
    margin-top: 10px;
  }

  .year {
    padding: 10px;
    cursor: pointer;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin: 2px;
    transition: background-color 0.3s;
  }

  .year:hover {
    background-color: #f0f0f0;
  }

  .control-button {
    color: blue;
  }

  .month-year-label {
    color: purple;
  }
  </style>