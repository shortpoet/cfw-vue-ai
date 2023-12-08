<template>
  <div class="page-container">
    <!-- <div py-4 /> -->
    <TextInput autocomplete="false" :message="'Navigate to'" :label="'Search'" :placeholder="'api/<enter route>'"
      @keydown.enter="go" v-model="urlPath" @update:model-value="onUpdateModel" />
    <div>
      <button class="c-yellow btn m-3 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        :disabled="!urlPath" @click="go">
        GO
      </button>
    </div>

    <ApiViewer v-if="validUrl" :title="'Debug'" :url-path="urlPath" :fetch-now="fetchNow" />
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
}
</style>
  
<script setup lang="ts">
import { useUiStore } from '../../stores';

const ui = useUiStore();
const urlPath = ref(ui.alaCartePath);
const showViewer = ref(false);
const fetchNow = ref(false);

const go = () => {
  if (urlPath.value) {
    ui.setNewPath(urlPath.value);
    if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
      // Your debug logs here
    }
    showViewer.value = true;
    fetchNow.value = true;
  }
};

const validUrl = computed(() => {
  return (
    urlPath.value &&
    urlPath.value.length > 0 &&
    urlPath.value !== '/' &&
    urlPath.value.startsWith('api/') &&
    showViewer.value
  );
});

const onUpdateModel = (value: string) => {
  fetchNow.value = false;
  urlPath.value = value;
  ui.setNewPath(urlPath.value);
};

watch(urlPath, (newVal, oldVal) => {
  // Watch logic here if needed
});

</script>