<script setup>
  import { ref, computed, watch } from 'vue';

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
    const emptyDays = firstDayOfMonth === 0 ? 0 : firstDayOfMonth - 1;
    return Array.from({ length: emptyDays }, (_, index) => index);
  });

  // Calculate empty slots after the last day of the current month
  const emptyDaysAfter = computed(() => {
    const lastDayOfMonth = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0).getDay();
    const emptyDays = lastDayOfMonth === 6 ? 0 : 6 - lastDayOfMonth; 
    return Array.from({ length: emptyDays }, (_, index) => index);
  });
  
  const weekDays = ['Lu', 'Ma', 'Mi', 'J', 'Vi', 'Sa', 'Du'];
  
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
  console.log(currentMonth.value.getFullYear());
  changeYearRange(year);
  monthView.value = true;
}

function previous() {
  if (monthView.value) {
    changeMonth(-1);
  } 
}

function next() {
  if (monthView.value) {
    changeMonth(1);
  } 
}

function changeYearRange(year) {
  let startYear = year - 4;
  for (let i = 0; i < 9; i++) {
    yearRange.value[i] = startYear + i;
  }
}

</script>

<template>
    <div class="date-picker">
    <div v-if="selectedDate" class="selected-date">
      <button @click="clearDate" class="clear-date-button">Sterge selectia</button>
    </div>
    
    <div class="controls">
      <button @click="previous" class="control-button">&lt;</button>
      <button @click="toggleYearView" class="month-year-label">
        <span v-if="monthView">
          {{ currentMonth.toDateString() }}
        </span>
    
        <span v-else>
          {{ yearRange[0] }} - {{ yearRange[yearRange.length - 1] }}
        </span>
      </button>
      <button @click="next" class="control-button">&gt;</button>
    </div>
    
    <div v-if="monthView" class="calendar-grid">
    <div class="day header" v-for="day in weekDays" :key="day"> <b> {{ day }} </b> </div>
    
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
  
<style scoped>
.date-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 95%; 
    max-width: 100%; 
    background: white;
    padding: 10px;
    margin: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden; 
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr); 
    gap: 5px; 
    width: 100%; 
}


.day {
    padding: 8px; 
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1 / 1; 
    font-size: 14px; 
    transition: background-color 0.3s;
    cursor: pointer;
}


.controls {
    display: flex;
    justify-content: space-between;
    width: 100%; 
}

.controls button {
    border: none;
    background: none;
    cursor: pointer;
    padding: 10px;
}

.years-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* Three years per row */
    gap: 10px; /* Space between boxes */
    padding: 10px; /* Padding around the grid */
    width: 100%; /* Full width of the container */
}

.year {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px; /* Padding inside each year box */
    border: 1px solid #ccc; /* Border for the boxes */
    border-radius: 8px; /* Rounded corners for the boxes */
    cursor: pointer;
    transition: background-color 0.3s; /* Smooth transition for hover effect */
}

.month-year-label {
  font-size: 1.2rem;
  color: darkred;
  font-family: Arial, Helvetica, sans-serif;
}

.selected {
    background-color: darkred;
    color: white;
    border-radius: 50%;
}

.clear-date-button {
  border-radius: 8px;
  background: white;
  color: #b80f20;
  font-size: 1em;
  border: 1px solid #b80f20;
  cursor: pointer;
  display: block;
}

@media (max-width: 1024px) {
    .day {
        font-size: 13px; 
    }
}

@media (max-width: 768px) {
    .day {
        padding: 6px; 
        font-size: 12px; 
    }
    .controls button {
        font-size: 12px; 
    }
}

@media (max-width: 480px) {
    .calendar-grid {
        gap: 3px; 
    }
    .day {
        padding: 5px; 
        font-size: 10px; 
    }
    .controls button {
        padding: 8px;
        font-size: 10px;
    }
}


</style>
