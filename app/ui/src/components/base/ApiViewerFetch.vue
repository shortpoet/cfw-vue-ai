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

const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  data: {
    type: Object,
    required: false,
  },
  loading: {
    type: Boolean,
    required: false,
  },
  error: {
    type: Object,
    required: false,
  },
});


const loading = ref(props.loading);
const error = ref(props.error);
const data = ref(props.data);

if (typeof window === 'undefined') {
  const NOOP = {
    data: ref(undefined),
    loading: ref(false),
    error: ref(undefined),
  };
  data.value = NOOP.data.value;
  error.value = NOOP.error.value
  loading.value = NOOP.loading.value;
}

const loaded = computed(() => loading.value === false);

</script>
