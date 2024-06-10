<script setup>
import fileContent from "@/assets/modalTexts/acceptedTermsModalText.js";
import CustomButton from "./CustomButton.vue";

const props = defineProps({
  show: Boolean,
});

const vFocus = {
  mounted: (el) => {
    el.focus();
  }
};

const emits = defineEmits(["accepted-terms-and-conditions", "declined-terms-and-conditions"]);

function acceptTermsAndConditions() {
  emits("accepted-terms-and-conditions");
}

function declineTermsAndConditions() {
  emits("declined-terms-and-conditions");
}
</script>

<template>
    <Transition name="popup">
      <div 
        v-if="show" 
        class="popup-mask"
      >
        <div 
          class="popup-container"
          @keydown.enter="acceptTermsAndConditions"
        >
          <div id="container" class="text-color">
            <h1 id="title"> Termeni și condiții - colectarea datelor personale </h1>
            <div id="text-container" v-html="fileContent"></div>
          </div>
          <CustomButton 
            @click="acceptTermsAndConditions"
            v-focus
            class="accept-button"
          >
            Am citit și accept termenii și condițiile.
          </CustomButton>
        </div>
      </div>
    </Transition>
  </template>
  
  <style scoped>
  .popup-default-button:hover {
    box-shadow: 0 2px 2px slategray;
  }
  
  .material-symbols-outlined {
    font-size: 40px;
  }
  
  button:hover {
    cursor: pointer;
  }
  
  .popup-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s ease;
  }
  
  .popup-container {
    width: 70%;
    height: 80%;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 5px;
    border: 1px solid #b80f20;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  
  .popup-enter-from {
    opacity: 0;
  }
  
  .popup-leave-to {
    opacity: 0;
  }
  
  .popup-enter-from .popup-container,
  .popup-leave-to .popup-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
  
  #title {
    font-size: 30px;
    color: #b80f20;
  }
  
  p {
    color: black;
  }
  
  #text-container {
    width: 75%;
    height: 70%;
    overflow: auto;
    border: 1px solid #b80f20;
    padding: 10px;
    background-color: white;
    color: black;
    border-radius: 5px;
  }
  
  #container {
    position: relative;
    
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    gap: 20px;
    height: 90%;
  }
  
  .accept-button {
    background-color: #b80f20;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .accept-button:hover {
    background-color: #930c1a;
  }
  
  </style>