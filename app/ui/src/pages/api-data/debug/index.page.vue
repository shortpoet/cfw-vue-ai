<template>
  <div class="page-container">
    <ApiViewer :title="'Debug'" :urlPath="'api/health/debug'" />
  </div>
</template>

<style scoped></style>
  
<script lang="ts">

export default {
  components: {
    ApiViewer
  },
}
</script>
