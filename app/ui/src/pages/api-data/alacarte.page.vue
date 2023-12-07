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
  
<script lang="ts">
import {
  computed, ref,
  watch
} from 'vue';
// import { PageContext } from '@/types';
import ApiViewer from '@/ui/src/components/base/ApiViewer.vue';
import TextInput from '@/ui/src/components/base/TextInput.vue';
import { useUiStore } from '@/ui/src/stores'
// import { usePageContext } from '@/ui/src/composables';
// import { resolveRoute } from 'vike/routing'
// import { navigate } from 'vike/client/router';
// import { StoreState } from 'pinia';


export default {
  components: {
    ApiViewer,
    TextInput
  },
  setup() {
    const ui = useUiStore()
    // const ui: StoreState<UiState> = useUiStore()
    const urlPath = ref(ui.alaCartePath)
    // const urlPath = ref('')
    // const pageContext: PageContext = usePageContext()
    const showViewer = ref(false)
    const fetchNow = ref(false)
    // const router = useRouter()
    const go = () => {
      // goTime.value = false
      if (urlPath.value) {
        ui.setNewPath(urlPath.value)
        if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
          // console.log('orig/index.page.vue: go()')
          // console.log('urlPath.value: ' + urlPath.value)
          // console.log('pageContext.urlPathname: ' + pageContext.urlPathname)
          // console.log('resolveRoute: ' + resolveRoute(`/orig/${encodeURIComponent(urlPath.value)}`, pageContext.urlPathname))
        }
        showViewer.value = true
        fetchNow.value = true
        // navigate(`/orig/hi/${encodeURIComponent(urlPath.value)}`)
      }
    }
    // console.log('orig/index.page.vue: setup()')
    // console.log('urlPath.value: ' + urlPath.value)
    const validUrl = computed(() => {
      return (
        urlPath.value &&
        urlPath.value.length > 0 &&
        urlPath.value !== '/' &&
        urlPath.value.startsWith('api/') &&
        showViewer.value
      )
    })
    const onUpdateModel = (value: string) => {
      fetchNow.value = false
      console.log('orig/index.page.vue: onUpdateModel()')
      // goTime.value = false
      urlPath.value = value
      ui.setNewPath(urlPath.value)
      // console.log('urlPath.value: ' + urlPath.value)
    }
    watch(urlPath, (newVal, oldVal) => {
      // console.log('orig/index.page.vue: watch(urlPath)')
      // console.log('newVal: ' + newVal)
      // console.log('oldVal: ' + oldVal)
    })

    return {
      go,
      urlPath,
      validUrl,
      onUpdateModel,
      fetchNow
    }
  }
}
</script>
