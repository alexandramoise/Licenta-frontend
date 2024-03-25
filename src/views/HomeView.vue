<script setup>
import router from "../router";

function setUser(userType) {
  sessionStorage.setItem("gotIn", userType)
  router.push({ name: "login" });
}

</script>

<template>
  <div class="page">
    <div class="presentation-half">
      <h1 class="app-title">CardioHealth Companion</h1>
      <div class="lower-half">
        <div class="heart-animation">
          <div id="wrapper">
            <div id="pulsingheart"></div>
          </div><div id="wrapper">
            <div id="pulsingheart"></div>
          </div>
      </div>
        <ul class="features-list">
          <li><i class="fas fa-heartbeat"></i> Monitorizare facilă</li>
          <li><i class="fas fa-chart-line"></i> Grafice și Statistici</li>
          <li><i class="fas fa-bell"></i> Notificări Personalizate</li>
          <li><i class="fas fa-clipboard-list"></i> Istoric și Tratament</li>
          <li><i class="fas fa-envelope"></i> Comunicare simplă și eficientă</li>
        </ul>
      </div>
    </div>

    <div class="choosing-half">
      <div class="role-selection">
            <p class="selection-text">Selectați rolul dvs</p>
            <button class="role-button doctor" @click="setUser('doctor')">
              <i class="fas fa-stethoscope"></i> Doctor
            </button>
            <button class="role-button patient" @click="setUser('pacient')">
              <i class="fas fa-user"></i> Pacient
            </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.page {
  display: grid;
  grid-template-columns: 1fr; 
  height: 100vh; 
  width: 100vw; 
}

.choosing-half {
  background-color: rgb(163, 2, 2);
  order: 1; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.presentation-half {
  flex: 1;
  background-color: rgb(255, 153, 153);
  order: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.lower-half {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  color: rgb(163, 2, 2);
  font-size: 25px;
  text-shadow: -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white;
}

.role-selection {
  text-align: center;
}

.selection-text {
  color: white;
  margin-bottom: 20px;
  font-size: 20px;
}

.role-button {
  background-color: #d8615d; 
  border: none;
  border-radius: 15px;
  color: white;
  padding: 10px 20px;
  margin: 10px;
  font-size: 18px;
  cursor: pointer;
  height: 70px;
}

.role-button:hover {
  box-shadow: 0px 5px 10px 0px rgb(231, 149, 149);
}

@media (min-width: 750px) {
  .page {
    grid-template-columns: 60% 40%; 
  }

  .presentation-half,
  .choosing-half {
    order: 0; 
  }

  .app-title {
    font-size: 40px;
  }

  .selection-text {
    font-size: 24px;
  }

  .role-button {
    font-size: 18px;
  }

  .features-list li {
    font-size: 18px;
  }
}

.heart-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;
  margin-left: 70px;
}

#pulsingheart {
  margin-right: 20px;
}

.features-list {
  list-style: none;
  color: white;
  text-align: left;
  margin-left: 50px;
}

.features-list li {
  font-size: 20px;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: black;
}

.features-list li i {
  margin-right: 0.5rem;
  color: rgb(163, 2, 2);
}

#wrapper {
	position: absolute;
  margin-left: 50px;
  margin-top: 50px;
	animation:pulse 1s infinite;
}


#pulsingheart { 
  position: relative; 
  width: 100px; 
  height: 90px;
} 

#pulsingheart:before, #pulsingheart:after { 
  position: absolute; 
  content: ""; 
  left: 50px; 
  top: 0; 
  width: 50px; 
  height: 80px; 
  background: #aa0000; 
  border-radius: 50px 50px 0 0; 
  transform: rotate(-45deg);  
  transform-origin: 0 100%;
  animation:pulsecolor 1s infinite;
} 

#pulsingheart:after { 
  left: 0; 
  transform: rotate(45deg); 
  transform-origin :100% 100%;
  animation:pulsecolor 1s infinite;
}

@keyframes pulse {
	10% {transform: scale(1.1)}
}

@keyframes pulsecolor {
  10% {background: rgb(163, 2, 2);}
}

@keyframes pulse {
0%, 100% { transform: scale(0.9); }
50% { transform: scale(1); }
}

@keyframes pulsecolor {
0%, 100% { background: rgb(163, 2, 2);}
50% { background: rgb(216, 33, 33); }
}

</style>



