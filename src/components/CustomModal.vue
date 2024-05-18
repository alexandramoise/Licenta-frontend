<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    open: Boolean,
    forConfirmation: Boolean,
    title: "",
    message: ""
});

const emits = defineEmits(["close", "confirm", "cancel"]);
</script>

<template>
    <Transition name="modal">
    <div v-if="open" class="modal-mask">
      <div class="modal-container">
        <div class="modal-header">
          {{ props.title }}
        </div>

        <div class="modal-body">
            {{ props.message }}
        </div>

        <div class="modal-footer">
            <div v-if="forConfirmation">
                <button class="modal-default-button1" @click="$emit('cancel')">
                    Anulare
                </button>
                <button class="modal-default-button2" @click="$emit('confirm')">
                    Da
                </button>
            </div>
            <div v-else>
                <button class="modal-default-button" @click="$emit('close')">
                    Ok
                </button>
            </div>
        </div>
    </div>
</div>
</Transition>
</template>

<style scoped>

.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    transition: opacity 0.3s ease;
}

.modal-container {
    width: 300px;
    margin: auto;
    background-color: #fff;
    border-radius: 5px;
    border: 1px solid slategray;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.modal-header {
    background-color: #ec9fa7; 
    padding: 16px;
    text-align: center;
    font-size: 17px;
    border-top-left-radius: 5px; 
    border-top-right-radius: 5px;
    width: 90%;
}

.modal-body {
  background-color: #fff; 
  padding: 16px;
  text-align: center;
  font-size: 16px;
  color: #333; 
}

.modal-footer {
  padding: 12px;
  text-align: center;
  border-bottom-left-radius: 5px; 
  border-bottom-right-radius: 5px;
}

.modal-default-button1,
.modal-default-button2, 
.modal-default-button {
  height: 30px;
  width: 60px;
  border-radius: 5px;
  margin-right: 10px;
}

.modal-default-button, 
.modal-default-button1 {
  border: 1px solid slategray;
}

.modal-default-button1:hover {
  box-shadow: 0 2px 2px slategray;
  background-color: rgba(163, 161, 161, 0.565);
}

.modal-default-button2 {
  background: #ec5e6c;
  border: 1px solid #54020a; 
}
.modal-default-button2:hover {
  box-shadow: 0 2px 2px #54020a; 
  background-color: #c31122; 
}

.modal-default-button {
    background-color: #ec9fa7;
}
.modal-default-button:hover {
  background-color:rgb(206, 71, 87);
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>