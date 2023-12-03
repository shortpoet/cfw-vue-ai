<template>
  <div>
    <h1>Welcome to AI-Maps</h1>
    <ul>
      <TheCounter :initial="8" />
    </ul>
  </div>
</template>

<script lang="ts" setup>
import TheCounter from '@/ui/src/components/base/TheCounter.vue';
</script>
