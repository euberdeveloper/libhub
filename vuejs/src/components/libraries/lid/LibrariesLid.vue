<template>
  <div
    class="libraries-lid"
    v-if="library"
  >
    <h1 class="title">{{library.name}}</h1>
    <div class="schema">
      <h2 style="margin-top: 68px;">Ubications</h2>
      <div class="ubications-container">
        <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 24px;">
          <el-input
            type="text"
            placeholder="New ubication"
            v-model="newUbicationText"
            clearable
          />
          <el-button
            style="margin-left: 12px"
            type="primary"
            icon="el-icon-plus"
            circle
            @click="addUbication"
          />
        </div>
        <el-card
          class="box-card"
          style="margin: 12px 0;"
          v-for="(ubication, index) of library.schema.ubications"
          :key="`${index}-${ubication}`"
        >
          <div class="clearfix">
            <span>{{ubication}}</span>
            <el-button
              style="float: right; padding: 3px 0; color: #f56c6c;"
              type="text"
              @click="removeUbication(index)"
            >Delete Ubication</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <div class="books">
      <h2 style="margin-top: 68px; margin-bottom: 48px;">Books</h2>
      <div class="books-container">
        <el-card
          class="box-card"
          style="margin: 12px 0;"
          v-for="(book, index) of books"
          :key="book._id"
        >
          <div
            slot="header"
            class="clearfix"
          >
            <span><b>{{book.title}}</b></span>
            <el-tooltip
              effect="dark"
              content="Remove this label"
              placement="bottom"
            >
              <el-button
                style="float: right; padding: 3px 0; color: #f56c6c;"
                type="text"
                icon="el-icon-delete"
                @click="removeBook(index)"
                circle
              />
            </el-tooltip>

          </div>
          <div>
            <span v-if="book.isbn">ISBN:</span><span v-if="book.isbn">{{book.isbn}}</span>
            <span>Title:</span><span v-if="book.title">{{book.title}}</span>
            <span v-if="book.authors">Author:</span><span v-if="book.authors">{{book.authors}}</span>
            <span v-if="book.publisher">Publisher:</span><span v-if="book.publisher">{{book.publisher}}</span>
            <span v-if="book.ubication">Ubication:</span><span v-if="book.ubication">{{book.ubication}}</span>
            <span v-if="book.edition">Edition:</span><span v-if="book.edition">{{book.edition}}</span>
            <span v-if="book.condition">Condition:</span><span v-if="book.condition">{{book.condition}}</span>
            <span v-if="book.labels">Labels:</span><span v-if="book.labels">{{book.labels.join('; ')}}</span>
            <span v-if="book.notes">Notes:</span><span v-if="book.notes">{{book.notes}}</span>
          </div>
        </el-card>
        <div class="button-container">
          <el-tooltip
            effect="dark"
            content="Create a new book"
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
      </div>
    </div>

    <el-dialog
      title="Create a new book"
      :visible.sync="showCreateDialog"
      width="30%"
    >
      <div
        class="isbn"
        style="margin: 12px 0;"
      >
        <el-input
          v-model="newBook.isbn"
          placeholder="ISBN"
          clearable
        />
        <el-button
          type="primary"
          style="margin-left: 8px"
          icon="el-icon-search"
          circle
          @click="searchIsbn()"
          :loading="loadingIsbn"
        ></el-button>
      </div>

      <el-input
        v-model="newBook.title"
        style="margin: 12px 0;"
        placeholder="Name*"
        clearable
      />
      <el-input
        v-model="newBook.author"
        style="margin: 12px 0;"
        placeholder="Author"
        clearable
      />
      <el-input
        v-model="newBook.publisher"
        style="margin: 12px 0;"
        placeholder="Publisher"
        clearable
      />
      <el-input
        v-model="newBook.edition"
        style="margin: 12px 0;"
        placeholder="Edition"
        clearable
      />
      <el-input
        v-model="newBook.condition"
        style="margin: 12px 0;"
        placeholder="Condition"
        clearable
      />
      <el-select
        v-model="newBook.ubication"
        style="margin: 12px 0; display: block;"
        placeholder="Ubication*"
        clearable
      >
        <el-option
          v-for="(ubication, index) in library.schema.ubications"
          :key="index"
          :value="ubication"
          :label="ubication"
        >
        </el-option>
      </el-select>
      <el-select
        v-model="newBook.labels"
        style="margin: 12px 0; display: block;"
        multiple
        placeholder="Labels"
        clearable
      >
        <el-option
          v-for="label in labels"
          :key="label._id"
          :label="label.name"
          :value="label._id"
        >
        </el-option>
      </el-select>
      <el-input
        v-model="newBook.notes"
        style="margin: 12px 0;"
        placeholder="Notes"
        type="textarea"
        clearable
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="showCreateDialog = false">Cancel</el-button>
        <el-button
          type="primary"
          :disabled="buttonDisabled"
          @click="createBook(); showCreateDialog = false;"
        >Crea</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  DBBookDocument,
  DBLabelDocument,
  DBLibraryDocument,
} from "@/types/database";
import {
  deleteLibrariesLidBooksBid,
  deleteLibrariesLidSchemaUbicationsUbication,
  getIsbn,
  getLabels,
  getLibrariesLid,
  getLibrariesLidBooks,
  postLibrariesLidBooks,
  postLibrariesLidSchemaUbications,
} from "@/services/api";

@Component
export default class LibrariesLid extends Vue {
  /* DATA */

  private library: DBLibraryDocument | null = null;
  private labels: DBLabelDocument[] = [];
  private books: DBBookDocument[] = [];
  private newUbicationText = "";
  private showCreateDialog = false;
  private loadingIsbn = false;

  private newBook: any = null;

  /* PROPS */

  @Prop({ type: String, required: true })
  lid!: string;

  /* GETTERS */

  get buttonDisabled(): boolean {
    return !this.newBook.title || !this.newBook.ubication;
  }

  /* METHODS */

  async searchIsbn(): Promise<void> {
    try {
      this.loadingIsbn = true;
      const isbnInfo = await getIsbn(this.newBook.isbn);
      this.newBook.title = isbnInfo.title || this.newBook.title;
      if (isbnInfo.authors) {
        this.newBook.author =
          (isbnInfo?.authors as any)[0] || this.newBook.author;
      }
      this.newBook.publisher = isbnInfo.publisher || this.newBook.publisher;
    } catch (error) {
      alert(error);
    } finally {
      this.loadingIsbn = false;
    }
  }

  async createBook(): Promise<void> {
    try {
      const book = {
        isbn: this.newBook.isbn || null,
        title: this.newBook.title,
        authors: this.newBook.author ? [this.newBook.author] : [],
        condition: this.newBook.condition || null,
        publisher: this.newBook.publisher || null,
        edition: this.newBook.edition || null,
        publicationYear: this.newBook.publicationYear || null,
        notes: this.newBook.notes || null,
        ubication: this.newBook.ubication,
        labels: this.newBook.labels,
      };
      const id = await postLibrariesLidBooks(this.lid, book as any);
      this.books.push({ ...book, _id: id, libraryId: this.lid, pictures: [] });
      this.newBook = {
        isbn: "",
        title: "",
        author: "",
        publisher: "",
        publicationYear: "",
        edition: "",
        condition: "",
        ubication: "",
        labels: [],
        notes: "",
      };
    } catch (error) {
      alert(error);
    }
  }

  async addUbication(): Promise<void> {
    try {
      await postLibrariesLidSchemaUbications(this.lid, {
        ubication: this.newUbicationText,
      });
      this.library?.schema.ubications.push(this.newUbicationText);
      this.newUbicationText = "";
    } catch (error) {
      alert(error);
    }
  }

  async removeUbication(index: number): Promise<void> {
    try {
      await deleteLibrariesLidSchemaUbicationsUbication(
        this.lid,
        this.library!.schema.ubications[index]
      );
      this.library?.schema.ubications.splice(index, 1);
    } catch (error) {
      alert(error);
    }
  }

  async removeBook(index: number): Promise<void> {
    try {
      await deleteLibrariesLidBooksBid(
        this.lid,
        this.books[index]._id
      );
      this.books.splice(index, 1);
    } catch (error) {
      alert(error);
    }
  }

  /* LIFE CYCLE */

  created() {
    this.newBook = {
      isbn: "",
      title: "",
      author: "",
      publisher: "",
      publicationYear: "",
      edition: "",
      condition: "",
      ubication: "",
      labels: [],
      notes: "",
    };
  }

  async mounted() {
    try {
      this.library = await getLibrariesLid(this.lid);
      this.books = await getLibrariesLidBooks(this.lid);
      this.labels = await getLabels();
    } catch (error) {
      alert(error);
    }
  }
}
</script>

<style lang="scss" scoped>
.libraries-lid {
  margin: 0 25px;

  h1,
  h2,
  h3 {
    width: 100%;
    text-align: center;
  }

  .title {
    margin-top: 48px;
  }

  .ubications-container {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
  }

  .button-container {
    width: 100%;
    margin-top: 64px;
    display: flex;
    justify-content: center;

    .create {
      transform: scale(1.5);
    }
  }

  .isbn {
    display: flex;
    flex-direction: row;
  }
}
</style>
