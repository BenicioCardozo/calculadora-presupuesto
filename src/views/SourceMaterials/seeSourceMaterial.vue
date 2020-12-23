<template>
  <div id="container">
    <h1>{{ name }}</h1>
    <b-card-group columns>
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
      <!-- I didn't include the measurement unit field because that won't change very often -->
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
        header="Precio"
        header-tag="h3"
        border-variant="info"
        align="center"
      >
        <b-input-group prepend="$">
          <b-input v-model="price.amount" type="number"></b-input>
        </b-input-group>
      </b-card>
    </b-card-group>
    <b-card-group deck>
      <b-card
        header="Proveedor"
        header-tag="h3"
        border-variant="info"
        align="center"
      >
        <b-input-group>
          <b-input v-model="characteristics.supplier" type="text"></b-input>
        </b-input-group>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
  import { db } from "../../firebase/firebase.js";

  export default {
    data() {
      return {
        name: undefined,
        price: 0,
        qualities: ["Alta", "Media", "Baja"],
        colors: ["Beige", "Azul", "Blanco"],
        price: undefined,
        characteristics: {
          color: undefined,
          quality: undefined,
          supplier: undefined,
        },
      };
    },
    created() {
      if (!this.$store.state.nameOfActualItem) return false;
      db.ref("/sourceMaterials/" + this.$store.state.nameOfActualItem).on(
        "value",
        (snapshot) => {
          this.name = snapshot.val().name;

          this.price = snapshot.val().price;

          this.characteristics = snapshot.val().characteristics;
        }
      );
    },

    watch: {
      price: {
        handler(newPrice) {
          db.ref(`/sourceMaterials/${this.name}/price`).set(newPrice);
        },
        deep: true,
      },
      characteristics: {
        handler(newCharacteristics) {
          db.ref(`/sourceMaterials/${this.name}/characteristics`).set(
            newCharacteristics
          );
        },
        deep: true,
      },
    },
  };
</script>

<style scoped>
  /* div > h3 {
  	font-weight: 700;
  	font-size: 2.4em;
  }
  div > h3 {
  	font-size: 2em;
  } */
  @media screen and (min-width: 576px) {
    .card-columns {
      margin: 10vh 5vh 10vh !important;
    }
  }

  h1 {
    margin: 0 0 8vh 0;
  }

  input {
    text-align: center;
    font-weight: 500;
    width: 100%;
  }
  #container * {
    text-align: center;
    max-width: 100%;
  }
  .card-deck {
    margin: auto;
  }
</style>
