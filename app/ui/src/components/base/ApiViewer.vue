<template>
  <div class="page-container">
    <div>
      <h1>{{ title }}</h1>
      <Link :href="`/api-data`" :title="'back'">
      <i class="i-carbon-page-first" inline-block />
      </Link>
      <div v-if="!loaded">
        <h1 class="text-4xl font-bold">Loading...</h1>
      </div>
      <pre class="text-left" v-else-if="error">{{ error }}</pre>
      <div v-else>
        <JsonTree :data="data" />
      </div>
    </div>

  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
}
</style>
  
<script lang="ts">
import { computed, PropType, ref, watch } from 'vue';
import Counter from '@/ui/src/components/base/Counter.vue'
import Link from '@/ui/src/components/base/Link.vue'
import JsonTree from '@/ui/src/components/base/JsonTree.vue'
import { useNextAuth } from '@/ui/src/composables/auth';
import { RequestConfig, USE_FETCH_REQ_INIT, useFetch } from '@/ui/src/composables/fetch';

export default {
  components: {
    Counter,
    Link,
    JsonTree,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    urlPath: {
      type: String,
      required: true,
      validator: (url: string) => {
        return !url.startsWith('http://') || !url.startsWith('https://') || !url.startsWith('www.') || !url.startsWith('localhost') || !url.startsWith('/')
      }
    },
    fetchNow: {
      type: Boolean,
      required: false,
      default: true,
    },
    options: {
      type: Object as PropType<RequestConfig>,
      // Make sure to use arrow functions if your TypeScript version is less than 4.7
      default: () => new Request('', USE_FETCH_REQ_INIT),
      validator: (options: RequestConfig) => {
        return options.method === 'GET' ||
          options.method === 'POST' ||
          options.method === 'PUT' ||
          options.method === 'DELETE' ||
          options.method === 'PATCH' ||
          options.method === 'OPTIONS' ||
          options.withAuth === true ||
          options.withAuth === false
      }
    }
  },

  async setup(props) {
    const urlPath = computed(() => props.urlPath);
    const fetchNow = computed(() => props.fetchNow);
    const NOOP = {
      data: undefined,
      dataLoading: ref(false),
      error: undefined,
      loaded: ref(false),
    }
    if (typeof window === "undefined" || !fetchNow.value) {
      return NOOP
    }

    const auth = useNextAuth();
    const {
      user, authLoading, onLoad,
      // authError, isLoggedIn
    } = auth;
    await onLoad();
    authLoading.value = auth.authLoading.value;

    const options = {
      ...props.options,
      // token: props.options.withAuth ? user.value?.token : undefined,
      // user: props.options.withAuth ? user.value : undefined,
    };
    // const options = { user: user.value };
    // const urlPath = ref(props.urlPath);
    let dataLoading = ref(false);
    let error = ref();
    let data = ref();

    const loaded = computed(() => dataLoading.value === false && authLoading.value === false);
    watch(urlPath, async (newUrl, oldUrl) => {
      if (fetchNow.value === false) {
        return
      }
      console.log(`[ui] [Api Viewer] [watch] [urlPath]`);
      console.log(newUrl);
      const { dataLoading, error, data } = await useFetch(newUrl, options);
      dataLoading.value = dataLoading.value;
      error.value = error.value;
      data.value = data.value;
    }, { immediate: false, deep: true });
    watch(fetchNow, async (newVal, oldVal) => {
      if (newVal === true) {
        console.log(`[ui] [Api Viewer] [watch] [fetchNow]`);
        console.log(newVal);
        const { dataLoading: fDL, error: fE, data: fD } = await useFetch(urlPath.value, options);
        dataLoading.value = fDL.value;
        error.value = fE.value;
        data.value = fD.value;
        console.log(`[ui] [Api Viewer] [watch] [dataLoading]`);
        console.log(dataLoading.value);
        console.log(`[ui] [Api Viewer] [watch] [error]`);
        console.log(error.value);
        console.log(`[ui] [Api Viewer] [watch] [data]`);
        console.log(data.value);
      }
    }, { immediate: true });
    // watch(error, (newVal, oldVal) => {
    //   if (newVal) {
    //     console.log(`[ui] [Api Viewer] [watch] [newVal]`);
    //     console.log(newVal);
    //     console.log(`[ui] [Api Viewer] [watch] [status]`);
    //     // console.log(error.value.status);
    //     // console.log(error.value.code);
    //     if (newVal.status === 401) {
    //       console.log(`[ui] [Api Viewer] [watch] [status] [401]`);
    //       console.log(newVal.status);
    //       throw render(401, {
    //         notAdmin: true,
    //         message: 'Only logged in users can access this page.',
    //       });
    //     }
    //   }
    // }, { immediate: false, deep: true });
    return { data, loaded, error, user };
  },
}
</script>
