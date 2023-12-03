<script setup lang="ts">
import { useCounter } from '@vueuse/core'
const props = defineProps<{
  initial: number
}>()

const { count, inc, dec } = useCounter(props.initial)
</script>

<template>
  <div>
    <button class="inc btn" @click="inc()">
      +
    </button>
    {{ count }}
    <button class="dec btn" @click="dec()">
      -
    </button>
  </div>
</template>
<style scoped>
button {
  margin: 0 0.5rem;
}
</style>
