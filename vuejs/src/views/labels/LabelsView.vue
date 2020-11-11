<template>
  <div class="labels-view">
    <labels />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Labels from "@/components/labels/Labels.vue";
@Component({
  components: { Labels },
})
export default class LabelsView extends Vue {}
</script>

<style lang="scss" scoped>
.labels-view {
  width: 100%;
  height: 100%;
}
</style>