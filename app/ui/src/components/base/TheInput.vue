<script setup lang="ts">
import { ref } from 'vue';

const modelValue = ref('')

</script>

<template>
  <input id="input" v-model="modelValue" type="text" v-bind="$attrs" p="x-4 y-2" w="250px" text="center" bg="transparent"
    border="~ rounded gray-200 dark:gray-700" outline="none active:none"
    @update:modelValue="$emit('update:modelValue', $event)">
</template>
