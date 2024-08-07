<template>
  <nav class="navbar">
    <CustomButton class="toggle-button" @click="toggleNav" v-if="!isDesktop">☰</CustomButton>
    <div :class="{ 'nav-links': true, 'nav-active': navVisible }">
      <CustomButton class="navbar-item-logo" @click="navigateTo('home')"> <img class="logo" src="../assets/images/logo.png"> CardioHealth Companion</CustomButton>
      <CustomButton class="navbar-item" @click="navigateTo('appointments')"> <i class="far fa-calendar-check"> </i> Programări</CustomButton>

      <CustomButton v-if="userType === 'patient'" class="navbar-item" @click="navigateTo('patient-cluster')"> <i class="fas fa-users"></i> Grup pacienți  </CustomButton>

      <CustomButton v-if="userType === 'doctor'" class="navbar-item" @click="navigateTo('all-patient-clusters')"> <i class="fas fa-users"></i> Grupuri pacienți </CustomButton>

      <div class="profile-dropdown" v-if="userType === 'doctor'">
        <CustomButton class="navbar-item" @click.stop="dropdownVisible = !dropdownVisible"> <i class="fas fa-plus"> </i> Adaugă <i class='fas fa-caret-down'> </i></CustomButton>
        <div v-if="dropdownVisible" class="dropdown-content">
            <CustomButton class="dropdown-item" @click="navigateTo('add-patient')"> pacient <i class="fas fa-user"></i></CustomButton>
            <CustomButton class="dropdown-item" @click="navigateTo('add-recommandation')"> recomandare <i class="fas fa-lightbulb"></i> </CustomButton>
          </div>
      </div>

      <CustomButton v-if="userType === 'patient'" class="navbar-item" @click="navigateTo('patient-treatment')"> <i class="fas fa-capsules"></i> Tratament  </CustomButton>

      <CustomButton class="navbar-item" @click="navigateTo('recommandations')"> <i class="fas fa-lightbulb"> </i> Recomandări</CustomButton>
      <div class="profile-dropdown">
        <CustomButton class="navbar-item" @click.stop="dropdownAccountVisible = !dropdownAccountVisible"> <i class="fas fa-user"> </i> {{ userName }} <i class='fas fa-caret-down'> </i></CustomButton>
        <div v-if="dropdownAccountVisible" class="dropdown-content">
          <CustomButton class="dropdown-item" @click="navigateTo('data')"> Datele mele <i class="fas fa-address-book"></i></CustomButton>
          <CustomButton class="dropdown-item" @click="navigateTo('account-options')"> Opțiuni cont <i class="fas fa-bell"></i> </CustomButton>
          <CustomButton class="dropdown-item" @click="navigateTo('change-password')"> Schimb parola <i class="fas fa-lock"></i> </CustomButton>
          <CustomButton class="dropdown-item" @click="navigateTo('logout')">Deconectare <i class="fas fa-arrow-right"></i> </CustomButton>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { routerViewLocationKey, useRouter } from 'vue-router';
import { requestNewPasswordPatient, getPatientByEmail } from '@/services/patient_service.js';
import { requestNewPasswordDoctor, getDoctorByEmail } from '@/services/doctor_service.js';
import router from '@/router';
import { useRoute } from 'vue-router';

export default {
  setup() {
    const dropdownVisible = ref(false);
    const dropdownAccountVisible = ref(false);
    const dropdownVisualizeVisible = ref(false);
    const navVisible = ref(false);
    const isDesktop = ref(true);
    //const router = useRouter();
    const route = useRoute();

    const userType = localStorage.getItem('role');
    const userEmail = localStorage.getItem('user');
    const patientAge = ref(0);

    const handleResize = () => {
      isDesktop.value = window.innerWidth > 600;
      if (isDesktop.value) {
        navVisible.value = false;
        dropdownVisible.value = false;
        dropdownAccountVisible.value = false;
        dropdownVisualizeVisible.value = false;
      }
    };

    onMounted(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
    });

    let user;
    const userName = ref('');
    onMounted(async () => {
      if(userType === 'doctor') {
         user = await getDoctorByEmail(userEmail);
      } else {
         user = await getPatientByEmail(userEmail); 
      }

      userName.value = user.fullName;
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    const toggleNav = () => {
      navVisible.value = !navVisible.value;
    };

const navigateTo = async (path) => {
  const routeToGo = route.path.slice(1,route.path.length + 1);

  if(path == routeToGo ||(path === "home" && (routeToGo == "main-doctor" || routeToGo == "main-patient"))) {
    window.location.reload(); 
  }

  if(path === "home") {
    router.push("main-" + userType)
  } else if(path === "appointments") {
      router.push("appointments");
  } 
  else if(path === "add-patient") {
    router.push({ 
      name: "new", 
      query: { accountType: "pacient" } 
    });
  }
  else if(path === "data") {
    router.push("my-profile");
  } 
  else if(path === "recommandations") {
    router.push("recommandations");
  } else if(path === "add-recommandation") {
    router.push("add-recommandation");
  } else if(path === "patient-treatment") {
    router.push("patient-treatment");
  } else if(path === "logout") {
    localStorage.clear();
    router.push("/");
  } else if(path === "change-password") {
    try {
      if(userType === 'patient') {

        await requestNewPasswordPatient(userEmail);
      } else {
        await requestNewPasswordDoctor(userEmail);
      }
      router.push({ 
        name: "change-password", 
        query: { for: userType.substring(0,1) } 
      });
    } catch (error) {
      console.error('Error when requesting new password:', error);
    }
  } else if(path === "patient-cluster" || path === "all-patient-clusters" || path === "journals" || path === "account-options") {
    router.push(path);
  } 
};


    return { 
      dropdownVisible, 
      dropdownAccountVisible,
      dropdownVisualizeVisible,
      navVisible, 
      isDesktop, 
      toggleNav, 
      navigateTo, 
      userType, 
      userEmail,
      userName
    };
  }
};
</script>


<style scoped>
.navbar {
  background-color: rgb(255, 255, 255);
  padding: 0.5rem;
  position: relative;
  box-shadow: 1px 1px rgb(172, 0, 0);
}

.toggle-button {
  color: rgb(172, 0, 0);
  font-size: 2rem;
  display: none;
  cursor: pointer;
}

.nav-links {
  display: flex;
  justify-content: space-evenly;
}

.navbar-item,
.navbar-item-logo {
  color:  rgb(172, 0, 0);
  margin-right: 0.2rem;
  font-size: 1.1rem;
  cursor: pointer;
}

.navbar-item-logo {
  font-weight: bold;
  font-size: 1.3rem;
  cursor: pointer;
}

.logo {
  height: 20px;
  width: 20px;
}

.profile-dropdown {
  position: relative;
}

.dropdown-content {
  display: block;
  position: absolute;
  left: 0;
  background-color: white;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  z-index: 100; 
  margin-top: 10px;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  text-decoration: none;
  display: block;
  background-color: white;
  border-bottom: 1px solid rgb(176, 176, 176);
  width: 100%;
  height: 25px;
  font-size: 1rem;
  cursor: pointer;
}

@media only screen and (max-width: 600px) {
  .nav-links, .dropdown-content {
    flex-direction: column;
  }

  .nav-links {
    display: none;
    width: 100%;
  }

  .nav-links.nav-active {
    display: flex;
  }

  .navbar-item,
  .navbar-item-logo {
    margin: 0;
    padding: 1rem;
    border-top: 1px solid #ddd;
    display: block; 
    font-size: 0.8rem;
  }

  .toggle-button {
    display: block;
  }

  .profile-btn {
    margin-bottom: 0.5rem; 
  }
}

@media (max-width: 768px) and (min-width: 601px) {
  .navbar-item {
    font-size: 0.8rem;
    margin-right: 2px;
  }

  .navbar-item-logo {
    font-size: 1rem;
    margin-right: 2px;
  }

  .dropdown-item {
    font-size: 0.7rem;
  }
}
</style>
