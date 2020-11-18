<template>
  <div class="libraries-lid-view">
    <libraries-lid :lid="lid" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import LibrariesLid from "@/components/libraries/lid/LibrariesLid.vue";

@Component({
  components: { LibrariesLid },
})
export default class LibrariesLidView extends Vue {
  /* PROPS */

  @Prop({ type: String, required: true })
  lid!: string;
}
</script>

<style lang="scss" scoped>
.libraries-lid-view {
  width: 100%;
  height: 100%;
}
</style>