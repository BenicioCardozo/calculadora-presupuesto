<template>
  <div>
    <div id="container">
      <h1>{{ this.$store.state.nameOfActualItem }}</h1>
      <b-card
        header="Materias Primas"
        header-tag="h3"
        border-variant="info"
        align="center"
        style="margin: 0 5vh 0!important"
        class="source-materials-card"
      >
        <span
          ><h5>Agregar Materia Prima</h5>
          <b-input-group size="sm"
            ><b-form-select
              v-model="newSourceMaterial"
              :options="sourceMaterialsList"
            >
              <b-form-select-option value="Nombre" hidden disabled
                >Nombre</b-form-select-option
              > </b-form-select
            ><b-input
              type="number"
              v-model="newSourceMaterialQuantity"
              placeholder="Cantidad"
            ></b-input
          ></b-input-group>
          <b-button
            id="add-source-material"
            :disabled="
              newSourceMaterial === 'Nombre' ||
                newSourceMaterial == undefined ||
                newSourceMaterial == ''
            "
            variant="outline-secondary"
            @click="addSourceMaterial()"
            ><b-icon icon="plus"></b-icon
          ></b-button>
        </span>
        <b-table
          :items="Object.values(sourceMaterials)"
          :fields="['name', 'howMuch']"
        >
          <template #cell(name)="data">
            <span
              ><b-icon
                style="cursor:pointer;color:rgb(208,6,6);"
                icon="trash"
                @click="deleteSourceMaterial(data.value)"
              ></b-icon>
              {{ data.value }}</span
            >
          </template>
          <template #cell(howMuch)="data">
            <b-input
              :value="data.value"
              @input="updateAmount(data.item.name, $event)"
              type="number"
            >
            </b-input>
          </template>
          <template #head(howMuch)>
            <span>Cantidad</span>
          </template>
          <template #head(name)>
            <span>Nombre</span>
          </template>
        </b-table>
      </b-card>
      <b-card-group columns style="margin: 0 5vh 0!important">
        <b-card
          header="Color"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-form-select
            v-model="characteristics.color"
            :options="colors"
          ></b-form-select>
        </b-card>
        <b-card
          header="Calidad"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-form-select
            v-model="characteristics.quality"
            :options="qualities"
          ></b-form-select>
        </b-card>
        <b-card
          header="Tamaño"
          header-tag="h3"
          border-variant="info"
          align="center"
        >
          <b-form-select
            v-model="characteristics.size"
            :options="sizes"
          ></b-form-select>
        </b-card>
      </b-card-group>
    </div>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase";

  export default {
    data() {
      return {
        characteristics: undefined,
        price: 0,
        sourceMaterials: undefined,
        qualities: ["Alta", "Media", "Baja"],
        colors: ["Beige", "Azul", "Blanco"],
        sizes: ["Grande", "Mediano", "Pequeño"],
        newSourceMaterial: "Nombre",
        newSourceMaterialQuantity: undefined,
        sourceMaterialsList: undefined,
      };
    },
    methods: {
      async deleteSourceMaterial(name) {
        await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/products/${this.$store.state.nameOfActualItem}/sourceMaterials/${name}`
          )
          .set(null);
        this.setItems();
      },
      async addSourceMaterial() {
        let measurementUnit = await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${this.newSourceMaterial}/price/measurementUnit`
          )
          .once("value");
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/products/${this.$store.state.nameOfActualItem}/sourceMaterials/${this.newSourceMaterial}`
        ).set({
          name: this.newSourceMaterial,
          howMuch: this.newSourceMaterialQuantity,
          measurementUnit: measurementUnit.val(),
        });
        await this.setItems();
        this.newSourceMaterialQuantity = "";
        this.newSourceMaterial = "Nombre";
      },
      updateAmount(name, newAmount) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/products/${this.$store.state.nameOfActualItem}/sourceMaterials/${name}/howMuch`
        ).set(Number(newAmount));
      },
      async setItems() {
        await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/products/${this.$store.state.nameOfActualItem}`
          )
          .on("value", (snapshot) => {
            this.characteristics = snapshot.val().characteristics;
            this.sourceMaterials = snapshot.val().sourceMaterials;
          });

        let sourceMaterialsQuery = await db
          .ref(
            `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials`
          )
          .once("value");
        let allSourceMaterials = Object.keys(sourceMaterialsQuery.val()).concat(
          Object.keys(this.sourceMaterials)
        );
        let duplicates = allSourceMaterials.filter(
          (item, index) => allSourceMaterials.indexOf(item) != index
        );

        let allSourceMaterialsWithUniqueValues = [
          ...new Set(allSourceMaterials),
        ];
        this.sourceMaterialsList = allSourceMaterialsWithUniqueValues.filter(
          (el) => !duplicates.includes(el)
        );
      },
    },
    created() {
      this.setItems();
    },
    watch: {
      characteristics: {
        handler(newCharacteristics) {
          db.ref(
            `users/${this.$store.getters["user/userProfile"].uid}/products/${this.$store.state.nameOfActualItem}/characteristics`
          ).set(newCharacteristics);
        },
        deep: true,
      },
    },
  };
</script>

<style scoped>
  .card {
    margin: 7vh 0;
  }
  .input-group > * {
    max-width: 60vw;
    margin: 0 1vw;
  }
  input {
    text-align: center;
    font-weight: 500;
  }
  #container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 80vh;
    text-align: center;
  }
  #add-source-material {
    min-width: 10vw;
    max-height: 4vh;
    margin: 2vh 0;
  }
  #add-source-material > * {
    vertical-align: baseline;
    margin: -0.3vh 0 2vh 0;
  }
</style>
