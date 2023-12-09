<template>
  <div class="dropdown inline-block">
    <Link class="icon-btn mx-2 dropdown-trigger" @click="toggleDropdown" title="Profile">
    <div class="icon" :class="iconClass"></div>
    </Link>
    <transition name="dropdown">
      <div class="dropdown-menu" v-if="isActive" ref="dd-menu" @click="closeDropdown">
        <!-- <slot></slot> -->
        <Suspense>
          <ProfileGithub :icon-class="'i-carbon-user-filled'" />
        </Suspense>
      </div>
    </transition>
  </div>
  <div class="dropup inline-block">

    <Link class="icon-btn mx-2 dropdown-trigger" @click="toggleDropup" title="Profile">
    <div class="icon" :class="iconClass"></div>
    <transition name="dropup">
      <Suspense>
        <div class="dropup-menu" v-if="isDropupActive" ref="du-menu" @click="closeDropup">
          <ul>
            <li>
              <ProfileGithub :icon-class="'i-carbon-user-filled'" />
            </li>
          </ul>
        </div>
      </Suspense>
    </transition>

    </Link>
  </div>
</template>

<script setup lang="ts">
const isActive = ref(false);
const isDropupActive = ref(false);

const toggleDropdown = () => {
  isActive.value = !isActive.value;
};

const toggleDropup = () => {
  isDropupActive.value = !isDropupActive.value;
};

const closeDropdown = () => {
  isActive.value = false;
};

const closeDropup = () => {
  isDropupActive.value = false;
};

const props = defineProps({
  iconClass: {
    type: String,
    required: false,
    default: 'i-carbon-user-filled',
  },
  // user: {
  //   type: Object,
  //   required: false,
  //   default: null,
  // },
});
</script>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  z-index: 10;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 200px;
  padding: 8px;
}

.dropdown-menu-enter-active,
.dropdown-menu-leave-active {
  transition: opacity 0.2s;
}

.dropdown-menu-enter-from,
.dropdown-menu-leave-to {
  opacity: 0;
}

/* my drop up */
.dropup {
  position: relative;
  display: inline-block;
}

.dropup-menu {
  position: absolute;
  bottom: 100%;
  background-color: #f1f1f1;
  min-width: 280px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
  z-index: 10;
  background-color: #fff;
  /* border: 1px solid #ccc; */
  border-radius: 4px;
  /* width: 200px; */
  /* padding: 8px; */
}

.dropup-menu-enter-active,
.dropup-menu-leave-active {
  transition: opacity 0.2s;
}

.dropup-menu-enter-from,
.dropup-menu-leave-to {
  opacity: 0;
}


/* drop up */
.drop-u-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 200px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-bottom: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: translateY(100%);
}

.drop-u-menu::before {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  border: 10px solid transparent;
  border-top-color: #fff;
  transform: translate(50%, 50%) rotate(45deg);
}

.drop-u-menu.is-open {
  transform: translateY(-100%);
}

.drop-u-menu.is-open::before {
  bottom: -20px;
  border-top-color: transparent;
  border-bottom-color: #fff;
}
</style>
