import { acceptHMRUpdate, defineStore } from "pinia";
import { ComputedRef, Ref, computed, ref } from "vue";

export interface UiState {
  alaCartePath: Ref<string>;
  otherPaths: ComputedRef<string[]>;
  setNewPath: (name: string) => void;
}

// export const useUiStore = defineStore<string, UiState>("ui", () => {
export const useUiStore = defineStore(
  "ui",
  () => {
    if (import.meta.env.VITE_LOG_LEVEL === "debug") {
      console.log("creating ui store");
    }
    /**
     * Current value of selected a la carte URI
     */
    const alaCartePath = ref("");
    const previousPaths = ref(new Set<string>());

    const usedPaths = computed(() => Array.from(previousPaths.value));
    const otherPaths = computed(() =>
      usedPaths.value.filter((path) => path !== alaCartePath.value)
    );

    /**
     * Changes the current name of the user and saves the one that was used
     * before.
     *
     * @param name - new name to set
     */
    function setNewPath(name: string) {
      if (alaCartePath.value) previousPaths.value.add(alaCartePath.value);

      alaCartePath.value = name;
    }
    if (import.meta.env.VITE_LOG_LEVEL === "debug") {
      console.log("user store created");
    }
    return {
      setNewPath,
      otherPaths,
      alaCartePath,
      persist: true,
    };
  },
  { persist: true }
);

// breaks things
// https://github.com/vuejs/pinia/issues/690
// https://www.reddit.com/r/vuejs/comments/snh25a/cryptic_error_with_pinia_vue_3_typescript/
// https://stackoverflow.com/questions/70681667/cant-use-vue-router-and-pinia-inside-a-single-store
if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUiStore, import.meta.hot));
