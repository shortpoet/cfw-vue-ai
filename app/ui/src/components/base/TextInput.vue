<template>
  <div>
    <label class="hidden" for="input">{{ label }}</label>
    <input :placeholder="placeholder" data-cy="text-input" class="text-input" type="text" v-model="modelValue"
      @input="onInput" @update:modelValue="$emit('update:modelValue', $event)" />
    <p><span>{{ message }}</span> {{ modelValue }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// Define a reactive ref for the text input value
const modelValue = ref('')
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  }
})
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()
// Event handler for input changes
const onInput = (event: Event) => {
  // console.log('TextInput.vue: onInput()')
  // console.log('event.target: ' + event.target)
  // console.log('event.target.value: ' + (event.target as HTMLInputElement).value)
  modelValue.value = (event.target as HTMLInputElement).value
  // console.log('modelValue.value: ' + modelValue.value)
  emit('update:modelValue', modelValue.value)
}
</script>
