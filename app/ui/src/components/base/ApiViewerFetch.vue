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
import { computed, ref } from 'vue';

export default {
  components: {
    Counter,
    Link,
    JsonTree,
  },
  props: {
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
  },

  async setup(props) {
    const NOOP = {
      data: undefined,
      error: undefined,
      loaded: ref(false),
    }
    if (typeof window === "undefined") {
      return NOOP
    }

    let loading = ref(props.loading);
    let error = ref(props.error);
    let data = ref(props.data);

    const loaded = computed(() => loading.value === false);
    return { data, loaded, error };
  },
}
</script>
