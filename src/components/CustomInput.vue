<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";

const {
  canModifySearchValue,
  modelValue,
  placeholder,
  error,
  type,
  inputRef,
  widthInPx,
  heightInPx,
} = defineProps([
  "canModifySearchValue",
  "modelValue",
  "placeholder",
  "error",
  "type",
  "widthInPx",
  "heightInPx",
]);

const emit = defineEmits(["update:modelValue", "input-focused"]);

const inputChange = (event) => {
  emit("update:modelValue", event.target.value);
};

const focused = ref(false);
const inputValue = ref("");

const handleFocus = () => {
  focused.value = true;
  emit("input-focused", focused.value);
};

const handleBlur = () => {
  focused.value = false;
  emit("input-focused", focused.value);
};

const handleInputKeyPress = (event) => {
  if (event.key === "Enter" && focused.value && canModifySearchValue) {
    searchValue.value = {
      text: event.target.value,
      key: "Enter",
    };
    setTimeout(() => {
      console.log(searchValue.value);
    }, 1000);
  }
  return false;
};

const handleInputKeyChange = (event) => {
  if (focused.value == true && canModifySearchValue) {
    searchValue.value = {
      text: event.target.value,
      key: null,
    };
  }
};
</script>

<template>
  <input
    class="input"
    :type="type"
    ref="inputValue"
    :placeholder="placeholder"
    :class="{ input: error }"
    required
    :value="modelValue"
    @keydown.enter="handleInputKeyPress"
    @input="inputChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @keyup="handleInputKeyChange"
    :style="{
      height: heightInPx ? heightInPx + 'vh' : {},
      width: widthInPx ? widthInPx + 'vw' : {},
    }"
  />
</template>

<style scoped>
.input {
  border-radius: 10px;
  border: 1px solid slategray;
  background-color: white;
  padding: 5px;
  box-sizing: border-box;
  cursor: text;
}

.input:hover {
  border: 1px solid rgb(164, 184, 204);
}

input {
  all: unset;
}

.input::placeholder {
  color: rgb(103, 102, 102);
}
</style>
