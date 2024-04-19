<script setup>
import CustomNavbar from '@/components/CustomNavbar.vue';
import { ref } from 'vue';

const tags = ref(['Sport', 'Alimentatie', 'Stres']);
const selectedTag = ref('');
const textAreaContent = ref('');
const characterLimit = 4000;
const types = ref(['Hipertensiune', 'Normal', 'Hipotensiune', 'General']);
const selectedType = ref('');
const formSubmission = ref({
  tag: '',
  content: '',
  type: ''
});

const handleTextAreaInput = (e) => {
  if (e.target.value.length <= characterLimit) {
    textAreaContent.value = e.target.value;
  }
};

const submitForm = () => {
  formSubmission.value = {
    tag: selectedTag.value,
    content: textAreaContent.value,
    type: selectedType.value,
  };
  // Here you would handle the form submission, like calling an API
  console.log(formSubmission.value);
};
</script>

<template>
    <CustomNavbar />
  <div class="add-recommendation-form">
    <h3> Adauga o recomandare </h3>
    <div class="radio-group">
            <template v-for="tag in tags" :key="`radio-${tag}`">
            <input
                :id="tag"
                type="radio"
                :value="tag"
                name="tag"
                v-model="selectedTag"
            />
            <label :for="tag">{{ `#${tag}` }}</label>
            </template>
        </div>
    
    <textarea
      v-model="textAreaContent"
      @input="handleTextAreaInput"
      placeholder="Write the recommendation here..."
      rows="4"
    ></textarea>
    <p>{{ textAreaContent.length }} / {{ characterLimit }}</p>

    <div class="radio-group">
      <template v-for="t in types">
        <input
          :id="t"
          type="radio"
          :value="t"
          name="type"
          v-model="selectedType"
        />
        <label :for="type">{{ t }}</label>
      </template>
    </div>
    
    <button @click="submitForm">Submit</button>
  </div>
</template>

<style scoped>
.add-recommendation-form {
    max-width: 500px;
    background-color: #b80f20;
}

.radio-group {
    display: flex;
    justify-content: space-between;
}

.radio-group input[type="radio"] {
    display: none; 
}

.radio-group label {
    flex: 1;
    text-align: center;
    padding: 10px;
    margin: 2px;
    background: #ffffff;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    display: block;
}

.radio-group input[type="radio"]:checked + label {
    background: #b80f20;
    color: #fff;
    border-color: #b80f20;
}
</style>
