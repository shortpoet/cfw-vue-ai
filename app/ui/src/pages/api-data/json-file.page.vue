<template>
  <div class="page-container">
    <ApiViewer :title="'Json Data'" :urlPath="'api/json-data'" />
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
}
</style>
  
<script lang="ts">

export default {
  components: {
    ApiViewer
  },
}
</script>
