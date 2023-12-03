<template>
  <button data-cy="counter-btn" class="btn" type="button" @click="state.count++">Counter
    <span class="px-3">{{ state.count }}</span>
  </button>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
const state = reactive({ count: 0 })
</script>
