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
      >
        <b-input-group
          :prepend="`Cantidad de ${sourceMaterial.name}`"
          :key="sourceMaterial + ' ' + index"
          v-for="(sourceMaterial, index) in sourceMaterials"
        >
          <b-input
            type="number"
            :value="sourceMaterials[sourceMaterial.name].howMuch"
            @input="updateAmount(sourceMaterial.name, $event)"
          >
          </b-input>
        </b-input-group>
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
      };
    },
    methods: {
      updateAmount(name, newAmount) {
        db.ref(
          `users/${this.$store.getters["user/userProfile"].uid}/products/${this.$store.state.nameOfActualItem}/sourceMaterials/${name}/howMuch`
        ).set(Number(newAmount));
      },
    },
    created() {
      db.ref(
        `users/${this.$store.getters["user/userProfile"].uid}/products/${this.$store.state.nameOfActualItem}`
      ).on("value", (snapshot) => {
        this.characteristics = snapshot.val().characteristics;
        this.sourceMaterials = snapshot.val().sourceMaterials;
      });
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
  .input-group {
    margin: 2vh;
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
  .source-materials-card {
    max-width: 100%;
  }
</style>
