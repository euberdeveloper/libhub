<template>
  <div class="labels">
    <el-card
      class="box-card"
      style="cursor: pointer; margin-bottom: 24px;"
      shadow="hover"
      v-for="(label, index) of labels"
      :key="label._id"
      @click="open(label._id)"
    >
      <div
        slot="header"
        class="clearfix"
      >
        <span :style="getStyleFromColor(label.colour)"><b>{{label.name}}</b></span>
        <el-tooltip
          effect="dark"
          content="Remove this label"
          placement="bottom"
        >
          <el-button
            style="float: right; padding: 3px 0; margin-left: 18px; color: #f56c6c;"
            type="text"
            icon="el-icon-delete"
            @click="remove(index)"
            circle
          />
        </el-tooltip>
        <el-tooltip
          effect="dark"
          content="Edit this label"
          placement="bottom"
        >
          <el-button
            style="float: right; padding: 3px 0;"
            type="text"
            icon="el-icon-edit"
            @click="openEditDialog(index)"
            circle
          />
        </el-tooltip>

      </div>
      <div v-if="label.description">
        {{label.description}}
      </div>
    </el-card>
    <div class="button-container">
      <el-tooltip
        effect="dark"
        content="Create a new label"
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
      title="Create a new label"
      :visible.sync="showCreateDialog"
      width="30%"
    >
      <el-input
        v-model="newLabelName"
        placeholder="Name"
        clearable
        style="margin-bottom: 18px;"
      />
      <el-input
        v-model="newLabelDescription"
        type="textarea"
        placeholder="Description"
        style="margin-bottom: 18px;"
      />
      <el-input
        v-model="newLabelColor"
        placeholder="Colour"
      />
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

    <el-dialog
      title="Edit the label"
      :visible.sync="showEditDialog"
      v-if="labelToEdit !== null"
      width="30%"
    >
      <el-input
        v-model="labelToEdit.name"
        placeholder="Name"
        clearable
        style="margin-bottom: 18px;"
      />
      <el-input
        v-model="labelToEdit.description"
        type="textarea"
        placeholder="Description"
        style="margin-bottom: 18px;"
      />
      <el-input
        v-model="labelToEdit.colour"
        placeholder="Colour"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="showEditDialog = false">Cancel</el-button>
        <el-button
          type="primary"
          :disabled="!labelToEdit.name"
          @click="edit(); showEditDialog = false;"
        >Modifica</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DBLabelDocument, DBLibraryDocument } from "@/types/database";
import {
  deleteLabelsLid,
  getLabels,
  patchLabelLid,
  postLabels,
} from "@/services/api";
import { ApiPostLabelsBody } from "@/types/api";

@Component
export default class Labels extends Vue {
  /* DATA */

  private labels: DBLabelDocument[] = [];
  private showCreateDialog = false;
  private showEditDialog = false;
  private newLabelName = "";
  private newLabelColor = "";
  private newLabelDescription = "";
  private labelToEdit: DBLabelDocument | null = null;

  /* GETTERS */

  get buttonDisabled(): boolean {
    return !this.newLabelName;
  }

  get createLabelBody(): Partial<ApiPostLabelsBody> {
    return {
      name: this.newLabelName,
      description: this.newLabelDescription || null,
      colour: this.newLabelColor || null,
    };
  }

  /* METHODS */

  getStyleFromColor(color: string) {
    if (color === null) {
      return {};
    } else if (color === "red") {
      return { color: "red" };
    } else if (color === "yellow") {
      return { color: "yellow" };
    } else if (color === "green") {
      return { color: "green" };
    } else {
      return { color: color };
    }
  }

  async remove(index: number): Promise<void> {
    try {
      await deleteLabelsLid(this.labels[index]._id);
      this.labels.splice(index, 1);
    } catch (error) {
      window.alert(error);
    }
  }

  open(id: string): void {
    console.log("merda");
  }

  openEditDialog(index: number): void {
    this.labelToEdit = { ...this.labels[index] };
    this.showEditDialog = true;
  }

  async create(): Promise<void> {
    try {
      const id = await postLabels(this.createLabelBody);
      const label: DBLabelDocument = {
        _id: id,
        name: this.newLabelName,
        description: this.newLabelDescription,
        colour: this.newLabelColor,
        children: [],
        parent: null,
      };
      this.labels.push(label);
      this.newLabelDescription = "";
      this.newLabelName = "";
      this.newLabelColor = "";
    } catch (error) {
      window.alert(error);
    }
  }

  async edit(): Promise<void> {
    try {
      await patchLabelLid(this.labelToEdit!._id, {
        name: this.labelToEdit?.name,
        description: this.labelToEdit?.description === '' ? null : undefined,
        colour: this.labelToEdit?.colour === '' ? null : undefined
      });
      const index = this.labels.findIndex(
        (l) => l._id === this.labelToEdit?._id
      );
      this.labels.splice(index, 1, {
        ...this.labelToEdit,
        children: this.labels[index].children,
        parent: this.labels[index].parent,
      } as any);
    } catch (error) {
      alert(error);
    }
  }

  /* LIFE CYCLE */

  async mounted() {
    try {
      this.labels = await getLabels();
    } catch (error) {
      window.alert(error);
    }
  }
}
</script>

<style lang="scss" scoped>
.labels {
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
