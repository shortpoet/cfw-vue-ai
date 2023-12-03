<template>
  <div class="navigation">
    <a href="/">
      <img class="logo" :src="logoUrl" height="64" width="64" alt="logo" />
    </a>
    <Link href="/">Home</Link>
    <Link href="/about">About</Link>
  </div>
</template>

<script setup lang="ts">
import Link from '@/ui/src/components/base/Link.vue';
import logoUrl from '@/public/Old_map_icon.svg';
</script>
<style scoped>
.logo {
  margin: 0 1rem;
  padding: 0.5rem;
}
</style>