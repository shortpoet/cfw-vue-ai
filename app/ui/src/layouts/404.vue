<script setup lang="ts">
import { navigate } from 'vike/client/router'
import { useI18n } from '../composables';

const { t } = useI18n()

const nav = () => ({
  back: () => navigate('/'),
});
</script>

<template>
  <main p="x4 y10" text="center teal-700 dark:gray-200">
    <div text-4xl>
      <div i-carbon-warning inline-block />
    </div>
    <RouterView />
    <div>
      <button btn text-sm m="3 t8" @click="nav().back()">
        {{ t('button.back') }}
      </button>
    </div>
  </main>
</template>
