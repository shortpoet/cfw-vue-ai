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
  
<script setup lang="ts">
import {
  computed, ref, watch
} from 'vue';

<template>
  <!--Your template content here-- >
    </template>

    < script setup lang = "ts" >
import {
  computed, ref, watch, defineProps, PropType
} from 'vue';

// Import necessary functions like useNextAuth, useFetch, and Request
// Import your components: Counter, Link, JsonTree

const props = defineProps({
  title: {
    type: String,
    required: true
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
    default: true
  },
  options: {
    type: Object as PropType<RequestConfig>,
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
});

const urlPath = ref(props.urlPath);
const fetchNow = ref(props.fetchNow);

const NOOP = {
  data: undefined,
  dataLoading: ref(false),
  error: undefined,
  loaded: ref(false),
};

if (typeof window === 'undefined' || !fetchNow.value) {
  return NOOP;
}

const auth = useNextAuth();
const { user, authLoading, onLoad } = auth;
await onLoad();
authLoading.value = auth.authLoading.value;

const options = {
  ...props.options,
};

let dataLoading = ref(false);
let error = ref();
let data = ref();

const loaded = computed(() => dataLoading.value === false && authLoading.value === false);

watch(urlPath, async (newUrl, oldUrl) => {
  if (fetchNow.value === false) {
    return;
  }
  console.log('[ui] [Api Viewer] [watch] [urlPath]');
  console.log(newUrl);
  const { dataLoading: dl, error: e, data: d } = await useFetch(newUrl, options);
  dataLoading.value = dl.value;
  error.value = e.value;
  data.value = d.value;
}, { immediate: false, deep: true });

watch(fetchNow, async (newVal, oldVal) => {
  if (newVal === true) {
    console.log('[ui] [Api Viewer] [watch] [fetchNow]');
    console.log(newVal);
    const { dataLoading: fDL, error: fE, data: fD } = await useFetch(urlPath.value, options);
    dataLoading.value = fDL.value;
    error.value = fE.value;
    data.value = fD.value;
    console.log('[ui] [Api Viewer] [watch] [dataLoading]');
    console.log(dataLoading.value);
    console.log('[ui] [Api Viewer] [watch] [error]');
    console.log(error.value);
    console.log('[ui] [Api Viewer] [watch] [data]');
    console.log(data.value);
  }
}, { immediate: true });

</script>