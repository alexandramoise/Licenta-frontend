<script setup>
import CustomButton from '@/components/CustomButton.vue';
import CustomNavbar from '@/components/CustomNavbar.vue';
import CustomModal from '@/components/CustomModal.vue';
import { ref, watch, computed, onMounted } from 'vue';
import router from "@/router";

import { addRecommandation } from '@/services/recommandation_service.js';

import NotAuthenticatedView from './NotAuthenticatedView.vue';
import NotAllowedView from "./NotAllowedView.vue";

// checking whether or not the user is authenticated based on the token's existence and expiration
const token = ref(localStorage.getItem("token"));
const availableUntil = ref(localStorage.getItem("availableUntil"));
const currentDate = ref(new Date());

const isAuthenticated = computed(() => {
    if (!token.value) return false;
    const expirationDate = new Date(availableUntil.value);
    return currentDate.value < expirationDate;
});

watch([token, availableUntil], ([newToken, newExpireDate]) => {
    if (newToken === null || newExpireDate === null) {
        isAuthenticated.value = false;
    } else {
        const expirationDate = new Date(newExpireDate);
        const currentDate = new Date();
        isAuthenticated.value = currentDate < expirationDate;
    }
});

const notAllowed = ref(false);
onMounted(() => {
    currentDate.value = new Date();
    token.value = localStorage.getItem("token");
    availableUntil.value = localStorage.getItem("availableUntil");
    if(localStorage.getItem("role") !== "doctor") {
        notAllowed.value = true;
    }
});


const tags = ['Sport', 'Alimentatie', 'Stres', 'Obiceiuri'];
const selectedTag = ref('');
const textAreaContent = ref('');
const characterLimit = 1000;
const types = ['Hipertensiune', 'Normal', 'Hipotensiune', 'General'];
const selectedType = ref('');

const typeTranslations = {
  'Hipotensiune': 'Hypotension',
  'Normal': 'Normal',
  'Hipertensiune': 'Hypertension',
  'General': 'All'
};


const modalShow = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const doctorEmail = localStorage.getItem('user');

async function createRecommandation() {
   console.log("Campuri: TAG", selectedTag.value, "TEXT ", textAreaContent.value, "TIP ", selectedType.value);
   if(!selectedTag.value || !textAreaContent.value || !selectedType.value) {
        modalShow.value = true;
        modalTitle.value = "Alerta";
        modalMessage.value = "Va rog sa completati campurile";
   } else {
       try {
        let typeInEnglish = typeTranslations[selectedType.value] || selectedType.value;
        console.log("Tip in engleza: ", typeInEnglish);
            const recommandationDto = {
                text: textAreaContent.value,
                recommandationType: typeInEnglish,
                hashtag: selectedTag.value,
            };

            let data = await addRecommandation(recommandationDto, doctorEmail);
            modalShow.value = true;
            modalTitle.value = "Succes";
            modalMessage.value = "S-a salvat!";
            return data;
       } catch(error) {
            modalShow.value = true;
            modalTitle.value = "Eroare";
            modalMessage.value = error.message;
       }
   }
}

function closeDialog() {
    modalShow.value = false;
    if(modalTitle.value === "Succes") {
        setTimeout(() => {
        redirectToPage();
    }, 300);
    }
}

function redirectToPage() {
    router.push("recommandations");
}
</script>

<template>
  <div class="container" v-if="isAuthenticated && !notAllowed">
    <CustomNavbar />
    <div class="form-container">
      <h1 style="color: #b80f20; text-align: center">Adaugă o recomandare</h1>
      <div class="input-group">
        <template v-for="tag in tags" :key="tag">
          <input :id="tag" type="radio" :value="tag" name="tag" v-model="selectedTag" />
          <label :for="tag" class="tag-label"> #{{ tag }}</label>
        </template>
      </div>
      <textarea :maxlength="500" v-model="textAreaContent" @input="handleTextAreaInput" placeholder="Scrieti recomandarea aici..." />
      <div class="character-count">{{ textAreaContent.length }} / 500</div>
      <div class="input-group">
        <template v-for="t in types" :key="t">
          <input :id="t" type="radio" :value="t" name="type" v-model="selectedType" />
          <label :for="t" class="type-label">{{ t }}</label>
        </template>
      </div>
      <CustomButton @click="createRecommandation" class="submit-button">Trimite</CustomButton>
    </div>
      <CustomModal
            :open="modalShow"
            :forConfirmation="false"
            :title="modalTitle"
            :message="modalMessage"
            @close="closeDialog"
        />
  </div>
  <div v-else-if="!isAuthenticated && !notAllowed"> 
     <NotAuthenticatedView />
  </div> 
  <div v-else="notAllowed">
     <NotAllowedView />
   </div>
</template>

<style scoped>
.container {
  height: 100vh;
  width: 100vw;
  background-color: #b80f20;
  overflow-y: hidden;
}

.form-container {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  margin: 50px auto;
}

.input-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.input-group input[type="radio"] {
    display: none; 
}

.tag-label,
.type-label {
  flex-grow: 1;
  text-align: center;
  border: 1px solid #ccc;
  padding: 0.5rem;
  margin: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tag-label:hover,
.type-label:hover {
  background-color: #f0f0f0;
}

input[type="radio"]:checked + .tag-label,
input[type="radio"]:checked + .type-label {
  background-color: #e3bfc2;
  border-color: #87373f;
}

textarea {
  width: 95%;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  resize: vertical;
  min-height: 100px;
}

.character-count {
  text-align: right;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.submit-button {
  width: 95%;
  padding: 10px 20px;
  border-radius: 8px;
  background: #b80f20;
  color: #fff;
  font-size: 17px;
  border: none;
  cursor: pointer;
  display: block;
  margin: 20px auto;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #a30e1c;
}

@media only screen and (max-width: 600px) {
  .form-container {
    max-width: 80%;
    margin: 20px auto;
    padding: 1rem;
  }

  .input-group {
    display: grid;
    grid-template-columns: 50% 50%;
  }

  .tag-label,
  .type-label {
    flex-grow: 0;
    margin: 5px 0;
  }

  textarea {
    width: calc(100% - 10px); /* scădere padding */
  }

  .submit-button {
    width: calc(100% - 10px); /* scădere padding */
  }
}

</style>
