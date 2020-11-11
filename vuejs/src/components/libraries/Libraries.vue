<template>
  <div class="libraries">
    <el-card
      class="box-card"
      style="cursor: pointer; margin-bottom: 24px;"
      shadow="hover"
      v-for="(library, index) of libraries"
      :key="library._id"
      @click.native="open(library._id)"
    >
      <div class="clearfix">
        <span>{{library.name}}</span>
        <el-button
          style="float: right; padding: 3px 0; color: #f56c6c;"
          type="text"
          @click="remove(index)"
        >Delete library</el-button>
      </div>
    </el-card>
    <div class="button-container">
      <el-tooltip
        effect="dark"
        content="Create a new library"
        placement="right"
      >
        <el-button
          class="create"
          type="primary"
          icon="el-icon-plus"
          size="medium"
          circle
          @click="showCreateDialog = true"
        ></el-button>
      </el-tooltip>
    </div>

    <el-dialog
      title="Create a new library"
      :visible.sync="showCreateDialog"
      width="30%"
    >
      <el-input v-model="newLibraryName" placeholder="Name" clearable />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="showCreateDialog = false">Cancel</el-button>
        <el-button
          type="primary"
          :disabled="buttonDisabled"
          @click="create(); showCreateDialog = false;"
        >Crea</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DBLibraryDocument } from "@/types/database";
import { deleteLibrariesLid, getLibraries, postLibraries } from "@/services/api";

@Component
export default class Libraries extends Vue {
  /* DATA */

  private libraries: DBLibraryDocument[] = [];
  private showCreateDialog = false;
  private newLibraryName = '';

  /* GETTERS */

  get buttonDisabled(): boolean {
    return !this.newLibraryName;
  }

  /* METHODS */

  async remove(index: number): Promise<void> {
    try {
      await deleteLibrariesLid(this.libraries[index]._id);
      this.libraries.splice(index, 1);
    } catch (error) {
      window.alert(error);
    }
  }

  open(id: string): void {
    console.log('id', id)
    this.$router.push({ name: 'libraries-lid', params: { lid: id } });
  }

  async create(): Promise<void> {
    try {
      const id = await postLibraries({ name: this.newLibraryName });
      const library: DBLibraryDocument = {
        _id: id,
        name: this.newLibraryName,
        owners: [],
        schema: {
          resources: [],
          ubications: []
        }
      };
      this.libraries.push(library);
      this.newLibraryName = '';
    } catch (error) {
      window.alert(error);
    }
  }

  /* LIFE CYCLE */

  async mounted() {
    try {
      this.libraries = await getLibraries();
    } catch (error) {
      window.alert(error);
    }
  }
}
</script>

<style lang="scss" scoped>
.libraries {
  margin: 60px 25px;

  .button-container {
    width: 100%;
    margin-top: 64px;
    display: flex;
    justify-content: center;

    .create {
      transform: scale(1.5);
    }
  }
}
</style>
