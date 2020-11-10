<template>
  <div id="app">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
    >
      <el-menu-item index="labels" @click="activeIndex = 'labels'; $router.push('labels');">LABELS</el-menu-item>
      <el-menu-item index="libraries" @click="activeIndex = 'libraries'; $router.push('libraries');">LIBRARIES</el-menu-item>
    </el-menu>

    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {
  /* DATA */

  private activeIndex = "libraries";
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}
</style>