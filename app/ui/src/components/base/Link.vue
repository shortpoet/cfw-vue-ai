<template>
  <a :class="{ active: pageContext.urlPathname === $attrs.href }">
    <slot />
  </a>
</template>
<style scoped>
a {
  padding: 0.25rem 0.25rem;
  margin: 0rem 0.25rem;
  /* margin-left: -10px; */
}

a.active {
  background-color: rgb(130, 94, 130);
  border-radius: .25rem;
}
</style>
<script lang="ts" setup>
const pageContext = usePageContext()
</script>
