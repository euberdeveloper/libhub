<template>
  <div class="libraries-view">
    <libraries />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Libraries from "@/components/libraries/Libraries.vue";
@Component({
  components: { Libraries },
})
export default class LibrariesView extends Vue {}
</script>

<style lang="scss" scoped>
.libraries-view {
  width: 100%;
  height: 100%;
}
</style>