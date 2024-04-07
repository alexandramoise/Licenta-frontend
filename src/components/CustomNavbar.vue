<template>
  <nav class="navbar">
    <CustomButton class="toggle-button" @click="toggleNav" v-if="!isDesktop">☰</CustomButton>
    <div :class="{ 'nav-links': true, 'nav-active': navVisible }">
      <CustomButton class="navbar-item-logo" @click="navigateTo('home')"> <img class="logo" src="../assets/images/logo.png"> CardioHealth Companion</CustomButton>
      <CustomButton class="navbar-item" @click="navigateTo('appointments')"> <i class="far fa-calendar-check"> </i> Programări</CustomButton>

      <div class="profile-dropdown">
        <CustomButton class="navbar-item" @click.stop="dropdownVisible = !dropdownVisible"> <i class="fas fa-plus"> </i> Adaugă <i class='fas fa-caret-down'> </i></CustomButton>
        <div v-if="dropdownVisible && userType === 'doctor'" class="dropdown-content">
            <CustomButton class="dropdown-item" @click="navigateTo('add-pacient')"> pacient <i class="fas fa-user"></i></CustomButton>
            <CustomButton class="dropdown-item" @click="navigateTo('add-recommandation')"> recomandare <i class="fas fa-lightbulb"></i> </CustomButton>
          </div>
          <div v-if="dropdownVisible && userType === 'pacient'" class="dropdown-content">
            <CustomButton class="dropdown-item" @click="navigateTo('add-treatment')"> tratament <i class="fas fa-capsules"></i> </CustomButton>
            <CustomButton class="dropdown-item" @click="navigateTo('add-journal')"> jurnal <i class="fas fa-book"></i></CustomButton>
          </div>
      </div>

      <CustomButton class="navbar-item" @click="navigateTo('recomandations')"> <i class="fas fa-lightbulb"> </i> Recomandări</CustomButton>
      <div class="profile-dropdown">
        <CustomButton class="navbar-item" @click.stop="dropdownAccountVisible = !dropdownAccountVisible"> <i class="fas fa-user"> </i> Cont <i class='fas fa-caret-down'> </i></CustomButton>
        <div v-if="dropdownAccountVisible" class="dropdown-content">
          <CustomButton class="dropdown-item" @click="navigateTo('data')"> Datele mele <i class="fas fa-address-book"></i></CustomButton>
          <CustomButton class="dropdown-item" @click="navigateTo('change-password')">Schimbă parola <i class="fas fa-lock"></i> </CustomButton>
          <CustomButton class="dropdown-item" @click="navigateTo('logout')">Deconectare <i class="fas fa-arrow-right"></i> </CustomButton>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const dropdownVisible = ref(false);
    const dropdownAccountVisible = ref(false);
    const navVisible = ref(false);
    const isDesktop = ref(true);
    const router = useRouter();

    const userType = sessionStorage.getItem("gotIn");

    const handleResize = () => {
      isDesktop.value = window.innerWidth > 600;
      if (isDesktop.value) {
        navVisible.value = false;
        dropdownVisible.value = false;
        dropdownAccountVisible.value = false;
      }
    };

    onMounted(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    const toggleNav = () => {
      navVisible.value = !navVisible.value;
    };

    const navigateTo = (path) => {
      console.log("Merge la: ", path);
      alert(path);
    };

    return { 
      dropdownVisible, 
      dropdownAccountVisible,
      navVisible, 
      isDesktop, 
      toggleNav, 
      navigateTo, 
      userType
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
}

.nav-links {
  display: flex;
  justify-content: space-evenly;
}

.navbar-item,
.navbar-item-logo {
  color:  rgb(172, 0, 0);
  margin-right: 1rem;
  font-size: 18px;
}

.navbar-item-logo {
  font-weight: bold;
  font-size: 22px;
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
  width: 120px;
  height: 25px;
  font-size: 16px;
}

/* Small screens (less than 600px) */
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
    font-size: 15px;
  }

  .toggle-button {
    display: block;
  }

  .profile-btn {
    margin-bottom: 0.5rem; /* Spacing for the dropdown */
  }
}
</style>
