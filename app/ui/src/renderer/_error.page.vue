<template>
  <div v-if="is404">
    <h1>{{ title404 }}</h1>
    <p> {{ msg404 }}</p>
    <p>{{ errorInfo }}</p>
  </div>
  <div v-else>
    <h1>{{ title }}</h1>
    <p> {{ msg }}</p>
    <p>{{ errorInfo }}</p>
  </div>
  <p>
    This page is hydrated:
    <Counter />
  </p>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { usePageContext } from '../composables';
import Counter from '@/ui/src/components/Counter.vue'

defineProps(['is404', 'errorInfo'])
const pageContext = usePageContext()
const { abortReason } = pageContext
const notAdmin = abortReason?.notAdmin === true
const noSession = abortReason?.noSession === true

const msg404 = "This page doesn't exist."
const title404 = 'Page Not Found'

const msg = computed(() => {
  console.log(`[ui] [error] [msg] notAdmin: ${notAdmin}, noSession: ${noSession}`)
  if (noSession) {
    return `You cannot access this page because you aren't signed in.`
  }
  if (notAdmin) {
    return `You cannot access this page because you aren't an administrator.`
  }
  return `Something went wrong`
})
const title = computed(() => {
  console.log(`[ui] [error] [title] notAdmin: ${notAdmin}, noSession: ${noSession}`)
  if (noSession) {
    return 'Not Signed In'
  }
  if (notAdmin) {
    return 'Unauthorized'
  }
  return 'Error'
})

</script>
